import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

// --- Security headers (Helmet-like) ---
export function setSecurityHeaders(res: VercelResponse) {
  // HSTS — 1 year, includeSubDomains, preload
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "0"); // modern browsers use CSP
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  // CSP — strict, allow self, qr server, fonts
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https://api.qrserver.com blob:",
    "connect-src 'self' https://script.google.com https://api.qrserver.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
  res.setHeader("Content-Security-Policy", csp);
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
}

// --- HTTPS enforcement (for non-vercel direct) ---
export function isHttps(req: VercelRequest): boolean {
  const forwarded = (req.headers["x-forwarded-proto"] as string | undefined) ?? "";
  if (forwarded) return forwarded.split(",")[0].trim() === "https";
  // On Vercel, req.url is https; assume true in prod, but check host
  return true;
}

// --- CORS — strict allowlist ---
const DEFAULT_ALLOWED = [
  "https://scispace.in",
  "https://www.scispace.in",
  "https://scispace-research-club.vercel.app",
];

export function getAllowedOrigins(): string[] {
  const env = process.env.ALLOWED_ORIGINS ?? process.env.FRONTEND_URL ?? process.env.SITE_URL ?? "";
  const list = env
    ? env.split(",").map((s) => s.trim()).filter(Boolean)
    : DEFAULT_ALLOWED;
  // always allow localhost for dev
  if (process.env.NODE_ENV !== "production") {
    list.push("http://localhost:5173", "http://localhost:3000", "http://localhost:4173");
  }
  // allow vercel preview suffix via regex separately
  return list;
}

export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = (req.headers.origin as string | undefined) ?? "";
  const allowed = getAllowedOrigins();
  const isVercelPreview = origin.endsWith(".vercel.app");
  const isAllowed = !origin || allowed.includes(origin) || (isVercelPreview && process.env.NODE_ENV !== "production" ? true : allowed.some((a) => origin === a));

  if (origin) {
    if (isAllowed || (isVercelPreview && allowed.includes(origin)) || isVercelPreview) {
      // In production, only allow exact matches; keep preview restrictive
      const shouldAllow = allowed.includes(origin) || (process.env.NODE_ENV !== "production" && isVercelPreview);
      if (shouldAllow) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
      } else if (!process.env.ALLOWED_ORIGINS) {
        // If no explicit env, allow scispace.in + localhost logic; block others
        res.setHeader("Access-Control-Allow-Origin", allowed[0]);
      }
    } else {
      // block unknown origin — do not set CORS header (browser will block)
      securityLog("cors_blocked", { origin, ip: getClientIp(req) });
      return false;
    }
  } else {
    // no origin (curl/mobile) — allow but not for admin?
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token");
  res.setHeader("Access-Control-Max-Age", "86400");
  return true;
}

// --- Body size limit ---
export function checkBodySize(req: VercelRequest, maxBytes = 10 * 1024): boolean {
  const len = Number(req.headers["content-length"] ?? 0);
  if (len && len > maxBytes) return false;
  // also check stringified body length
  try {
    const bodyStr = JSON.stringify(req.body ?? {});
    if (Buffer.byteLength(bodyStr, "utf8") > maxBytes) return false;
  } catch {
    return false;
  }
  return true;
}

// --- Rate limiting (in-memory token bucket) ---
type Bucket = { count: number; resetAt: number };
const rateStore = new Map<string, Bucket>();

export function rateLimit(req: VercelRequest, key: string, max: number, windowMs: number): boolean {
  const ip = getClientIp(req);
  const mapKey = `${key}:${ip}`;
  const now = Date.now();
  const bucket = rateStore.get(mapKey);
  if (!bucket || now > bucket.resetAt) {
    rateStore.set(mapKey, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count += 1;
  return true;
}

// Cleanup old buckets every 5m
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of rateStore.entries()) if (now > v.resetAt) rateStore.delete(k);
  }, 5 * 60 * 1000).unref?.();
}

export function getClientIp(req: VercelRequest): string {
  const fwd = (req.headers["x-forwarded-for"] as string | undefined) ?? "";
  if (fwd) return fwd.split(",")[0].trim();
  return (req.headers["x-real-ip"] as string | undefined) ?? (req as unknown as { ip?: string }).ip ?? "unknown";
}

// --- Sanitization ---
export function sanitizeString(input: unknown, maxLen = 200): string {
  if (typeof input !== "string") return "";
  let s = input.trim();
  // strip control chars
  s = s.replace(/[\x00-\x1F\x7F]/g, "");
  // prevent XSS: strip < > and encode
  s = s.replace(/[<>]/g, "");
  // limit length
  if (s.length > maxLen) s = s.slice(0, maxLen);
  return s;
}

export function sanitizeEmail(input: unknown): string {
  const s = sanitizeString(input, 254).toLowerCase();
  return s;
}

export function isValidEmail(email: string): boolean {
  // strict RFC-ish, no injection
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email) && !email.includes("<") && !email.includes(">") && email.length <= 254;
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return /^[0-9]{10}$/.test(digits);
}

export function isValidRegNo(reg: string): boolean {
  // VIT-AP reg: alphanumeric 6-15 chars, no special injection
  return /^[a-zA-Z0-9-]{5,20}$/.test(reg);
}

export function isValidName(name: string): boolean {
  // Allow letters, spaces, dots, apostrophes, hyphens — no script tags
  return /^[a-zA-Z\s.'-]{2,80}$/.test(name) || /^[a-zA-Z\s.'-\u00C0-\u024F]{2,80}$/.test(name);
}

// --- Idempotency store for UPI transaction references (prevent duplicate submissions) ---
const seenTransactions = new Set<string>();

export function isDuplicateTransaction(ref: string): boolean {
  if (!ref) return false;
  const norm = ref.trim().toUpperCase();
  if (seenTransactions.has(norm)) return true;
  seenTransactions.add(norm);
  if (seenTransactions.size > 10000) {
    const first = seenTransactions.values().next().value as string;
    seenTransactions.delete(first);
  }
  return false;
}

export function hasDuplicateTransaction(ref: string): boolean {
  if (!ref) return false;
  return seenTransactions.has(ref.trim().toUpperCase());
}

// Legacy aliases for compatibility if any admin still checks
export function isDuplicatePayment(paymentId: string): boolean {
  return isDuplicateTransaction(paymentId);
}
export function isDuplicateOrder(orderId: string): boolean {
  return isDuplicateTransaction(orderId);
}

// --- Security logging (server-side only, generic messages to client) ---
export function securityLog(event: string, meta: Record<string, unknown> = {}) {
  const entry = {
    ts: new Date().toISOString(),
    event,
    ...meta,
  };
  // In production this would go to external log aggregator; console for Vercel logs
  console.warn(`[SECURITY] ${event}`, JSON.stringify(entry));
}

// --- Timing-safe compare for signatures ---
export function timingSafeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// --- File validation helpers (magic bytes) ---
export const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const ALLOWED_EXTS = new Set(["jpg", "jpeg", "png", "webp"]);
export const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateImageMagic(buffer: Buffer): { ok: boolean; mime?: string; reason?: string } {
  if (!buffer || buffer.length < 12) return { ok: false, reason: "File too small or corrupted" };
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ok: true, mime: "image/jpeg" };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { ok: true, mime: "image/png" };
  }
  // WEBP: RIFF....WEBP
  if (
    buffer[0] === 0x52 && // R
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x46 && // F
    buffer[8] === 0x57 && // W
    buffer[9] === 0x45 && // E
    buffer[10] === 0x42 && // B
    buffer[11] === 0x50 // P
  ) {
    return { ok: true, mime: "image/webp" };
  }
  // Reject SVG ( <?xml or <svg )
  const head = buffer.slice(0, 256).toString("utf8").toLowerCase();
  if (head.includes("<svg") || head.includes("<?xml")) {
    return { ok: false, reason: "SVG and vector images are not allowed" };
  }
  return { ok: false, reason: "Invalid image format. Only JPG, PNG, WEBP allowed." };
}

// --- Generic safe error response (never leak stack) ---
export function safeError(res: VercelResponse, status: number, message: string) {
  return res.status(status).json({ error: message });
}
