import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

// ─── Security headers (Helmet-like) ──────────────────────────────────────────
export function setSecurityHeaders(res: VercelResponse) {
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "0"); // modern browsers use CSP
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");

  // CSP — allows self + fonts
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob:",
    "frame-src 'self'",
    "connect-src 'self' https://script.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
  res.setHeader("Content-Security-Policy", csp);
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
}

// ─── CORS — strict allowlist ──────────────────────────────────────────────────
const DEFAULT_ALLOWED = [
  "https://scispace.in",
  "https://www.scispace.in",
  "https://scispace-research-club.vercel.app",
];

export function getAllowedOrigins(): string[] {
  const env =
    process.env.ALLOWED_ORIGINS ??
    process.env.FRONTEND_URL ??
    process.env.SITE_URL ??
    "";
  const list = env
    ? env.split(",").map((s) => s.trim()).filter(Boolean)
    : DEFAULT_ALLOWED;
  if (process.env.NODE_ENV !== "production") {
    list.push("http://localhost:5173", "http://localhost:3000", "http://localhost:4173");
  }
  return list;
}

export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = (req.headers.origin as string | undefined) ?? "";
  const allowed = getAllowedOrigins();
  const isVercelPreview = origin.endsWith(".vercel.app");
  const shouldAllow =
    !origin ||
    allowed.includes(origin) ||
    (process.env.NODE_ENV !== "production" && isVercelPreview);

  if (origin) {
    if (shouldAllow) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    } else {
      securityLog("cors_blocked", { origin, ip: getClientIp(req) });
      return false;
    }
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token");
  res.setHeader("Access-Control-Max-Age", "86400");
  return true;
}

// ─── Rate limiting (in-memory token bucket) ───────────────────────────────────
type Bucket = { count: number; resetAt: number };
const rateStore = new Map<string, Bucket>();

export function rateLimit(
  req: VercelRequest,
  key: string,
  max: number,
  windowMs: number
): boolean {
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

// Cleanup stale buckets every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of rateStore.entries()) {
      if (now > v.resetAt) rateStore.delete(k);
    }
  }, 5 * 60 * 1000).unref?.();
}

export function getClientIp(req: VercelRequest): string {
  const fwd = (req.headers["x-forwarded-for"] as string | undefined) ?? "";
  if (fwd) return fwd.split(",")[0].trim();
  return (
    (req.headers["x-real-ip"] as string | undefined) ??
    (req as unknown as { ip?: string }).ip ??
    "unknown"
  );
}

// ─── Sanitization ─────────────────────────────────────────────────────────────
export function sanitizeString(input: unknown, maxLen = 200): string {
  if (typeof input !== "string") return "";
  let s = input.trim();
  s = s.replace(/[\x00-\x1F\x7F]/g, ""); // strip control chars
  s = s.replace(/[<>]/g, "");             // prevent XSS
  if (s.length > maxLen) s = s.slice(0, maxLen);
  return s;
}

export function isValidEmail(email: string): boolean {
  return (
    /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email) &&
    !email.includes("<") &&
    !email.includes(">") &&
    email.length <= 254
  );
}

export function isValidPhone(phone: string): boolean {
  return /^[0-9]{10}$/.test(phone.replace(/\D/g, ""));
}

// ─── Security logging ─────────────────────────────────────────────────────────
export function securityLog(event: string, meta: Record<string, unknown> = {}) {
  const entry = { ts: new Date().toISOString(), event, ...meta };
  console.warn(`[SECURITY] ${event}`, JSON.stringify(entry));
}

// ─── Timing-safe string compare ───────────────────────────────────────────────
export function timingSafeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) {
      // Still do a dummy comparison to avoid timing leak on length
      crypto.timingSafeEqual(Buffer.alloc(1), Buffer.alloc(1));
      return false;
    }
    return crypto.timingSafeEqual(new Uint8Array(bufA), new Uint8Array(bufB));
  } catch {
    return false;
  }
}

// ─── Generic safe error response ─────────────────────────────────────────────
export function safeError(res: VercelResponse, status: number, message: string) {
  return res.status(status).json({ error: message });
}
