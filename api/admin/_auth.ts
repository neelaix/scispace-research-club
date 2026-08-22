import crypto from "crypto";
import type { VercelRequest } from "@vercel/node";

type Session = { username: string; expiresAt: number };

const sessions = new Map<string, Session>();
// Clean expired every 10m
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of sessions.entries()) if (now > v.expiresAt) sessions.delete(k);
  }, 10 * 60 * 1000).unref?.();
}

export function hashPasswordSHA256(pw: string): string {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

export function isPasswordValid(input: string): boolean {
  const hashEnv = process.env.ADMIN_PASSWORD_HASH ?? "";
  const plainEnv = process.env.ADMIN_PASSWORD ?? "";
  if (hashEnv) {
    const inputHash = hashPasswordSHA256(input);
    // timing safe
    try {
      const a = Buffer.from(inputHash, "hex");
      const b = Buffer.from(hashEnv, "hex");
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return inputHash === hashEnv;
    }
  }
  if (plainEnv) {
    const a = Buffer.from(input, "utf8");
    const b = Buffer.from(plainEnv, "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }
  // No env set — deny by default in production, allow dev fallback
  if (process.env.NODE_ENV !== "production") {
    // default dev creds: admin / scispace2026
    return input === "scispace2026" && hashEnv === "" && plainEnv === "";
  }
  return false;
}

export function createSession(username: string): { token: string; expiresAt: number } {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2h
  sessions.set(token, { username, expiresAt });
  return { token, expiresAt };
}

export function verifyToken(token: string): Session | null {
  const s = sessions.get(token);
  if (!s) return null;
  if (Date.now() > s.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return s;
}

export function destroySession(token: string) {
  sessions.delete(token);
}

export function getTokenFromRequest(req: VercelRequest): string | null {
  const auth = (req.headers.authorization as string | undefined) ?? "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();
  const cookie = (req.headers.cookie as string | undefined) ?? "";
  const m = cookie.match(/(?:^|;\s*)scispace_admin=([^;]+)/);
  if (m) return decodeURIComponent(m[1]);
  return null;
}

export function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME ?? (process.env.NODE_ENV !== "production" ? "admin" : "");
}
