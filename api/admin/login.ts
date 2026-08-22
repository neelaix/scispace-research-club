import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  setSecurityHeaders,
  handleCors,
  checkBodySize,
  rateLimit,
  sanitizeString,
  getClientIp,
  securityLog,
  safeError,
} from "../_security";
import { createSession, isPasswordValid, getAdminUsername } from "./_auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(res);
  const corsOk = handleCors(req, res);
  if (!corsOk) return safeError(res, 403, "Forbidden");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return safeError(res, 405, "Method not allowed");

  if (!rateLimit(req, "admin-login", 5, 15 * 60 * 1000)) {
    securityLog("admin_login_rate_limit", { ip: getClientIp(req) });
    return safeError(res, 429, "Too many login attempts. Try again later.");
  }

  if (!checkBodySize(req, 4 * 1024)) return safeError(res, 413, "Request too large");

  const ct = (req.headers["content-type"] as string | undefined) ?? "";
  if (!ct.includes("application/json")) return safeError(res, 400, "Invalid content type");

  try {
    const { username, password } = (req.body ?? {}) as Record<string, unknown>;
    const u = sanitizeString(username, 64);
    const p = sanitizeString(password, 128);

    if (!u || !p) return safeError(res, 400, "Username and password required");

    const expectedUser = getAdminUsername();
    if (!expectedUser || u !== expectedUser) {
      // If no env, default dev user is admin
      if (process.env.NODE_ENV !== "production" && u !== "admin") {
        securityLog("admin_login_failed_user", { ip: getClientIp(req), username: u });
        return safeError(res, 401, "Invalid credentials");
      }
      if (process.env.NODE_ENV === "production" && u !== expectedUser) {
        securityLog("admin_login_failed_user", { ip: getClientIp(req), username: u });
        return safeError(res, 401, "Invalid credentials");
      }
    }

    if (!isPasswordValid(p)) {
      securityLog("admin_login_failed_pass", { ip: getClientIp(req), username: u });
      return safeError(res, 401, "Invalid credentials");
    }

    const { token, expiresAt } = createSession(u);
    const isProd = process.env.NODE_ENV === "production";

    // Secure cookie — httpOnly, secure, sameSite strict, path /
    const cookie = [
      `scispace_admin=${encodeURIComponent(token)}`,
      "Path=/",
      "HttpOnly",
      isProd ? "Secure" : "",
      "SameSite=Strict",
      `Max-Age=${Math.floor((expiresAt - Date.now()) / 1000)}`,
    ]
      .filter(Boolean)
      .join("; ");
    res.setHeader("Set-Cookie", cookie);

    securityLog("admin_login_success", { ip: getClientIp(req), username: u });

    return res.status(200).json({ success: true, token, expiresAt });
  } catch (e) {
    securityLog("admin_login_error", { ip: getClientIp(req), error: (e as Error).message });
    return safeError(res, 500, "Internal server error");
  }
}
