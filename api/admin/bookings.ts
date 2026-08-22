import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  setSecurityHeaders,
  handleCors,
  rateLimit,
  getClientIp,
  securityLog,
  safeError,
} from "../_security";
import { getTokenFromRequest, verifyToken } from "./_auth";

// We import the shared processedPayments map via global — but each serverless instance has its own.
// For demo we return in-memory + note. In production with DB you'd query DB; here we rely on sheets.
import { createRequire } from "module";

// Access verify-payment's map via global symbol workaround: we reuse same file's map by importing
// Since we can't share memory across serverless reliably, we return empty with note if not found.
// Instead we maintain a separate global for demo.

declare global {
  // eslint-disable-next-line no-var
  var __SCISPACE_BOOKINGS__: Map<string, unknown> | undefined;
}

function getBookingsStore(): Map<string, unknown> {
  if (!globalThis.__SCISPACE_BOOKINGS__) globalThis.__SCISPACE_BOOKINGS__ = new Map();
  return globalThis.__SCISPACE_BOOKINGS__!;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(res);
  const corsOk = handleCors(req, res);
  if (!corsOk) return safeError(res, 403, "Forbidden");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return safeError(res, 405, "Method not allowed");

  if (!rateLimit(req, "admin-bookings", 30, 60_000)) {
    securityLog("admin_bookings_rate_limit", { ip: getClientIp(req) });
    return safeError(res, 429, "Too many requests");
  }

  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) {
    securityLog("admin_unauthorized_bookings", { ip: getClientIp(req) });
    return safeError(res, 401, "Unauthorized. Please log in as admin.");
  }

  try {
    // Try to pull from verify-payment's processedPayments via global (if same instance)
    // Also try our store
    const store = getBookingsStore();
    // Populate from verify-payment global if available (hack: require its map)
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const verifyMod = createRequire(import.meta.url)("../verify-payment") as unknown;
      void verifyMod;
    } catch {
      // ignore
    }

    const bookings = Array.from(store.values());
    // Also include any env-stored mock for demo
    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
      note: bookings.length === 0 ? "No bookings in this serverless instance memory. Persistent storage is Google Sheets (when GOOGLE_APPS_SCRIPT_URL is set). This endpoint demonstrates server-side authorization + rate limiting." : undefined,
    });
  } catch (e) {
    securityLog("admin_bookings_error", { ip: getClientIp(req), error: (e as Error).message });
    return safeError(res, 500, "Internal server error");
  }
}
