import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setSecurityHeaders, handleCors, safeError } from "../_security.js";
import { getTokenFromRequest, destroySession, verifyToken } from "./_auth.js";
import { getClientIp, securityLog } from "../_security.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(res);
  handleCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return safeError(res, 405, "Method not allowed");

  const token = getTokenFromRequest(req);
  if (token && verifyToken(token)) {
    destroySession(token);
    securityLog("admin_logout", { ip: getClientIp(req) });
  }
  // Clear cookie
  res.setHeader("Set-Cookie", "scispace_admin=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0");
  return res.status(200).json({ success: true });
}
