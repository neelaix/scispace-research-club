/**
 * /api/qconnect/admin — Admin read-only endpoints.
 *
 * Manual UPI flow: bookings stay PENDING until an admin verifies the
 * payment screenshot in Google Drive, then marks CONFIRMED and sends
 * the confirmation email from spaceresearch.club@vitap.ac.in.
 *
 *   GET  /api/qconnect/admin              — list bookings
 *   GET  /api/qconnect/admin?format=csv   — CSV export (sheet columns unchanged)
 *   GET  /api/qconnect/admin?view=stats   — capacity stats
 *   GET  /api/qconnect/admin?action=get&id=QCON-2026-XXXXXX — single detail
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getRegistration, listRegistrations, getStats } from "./_store";
import { handleCors, setSecurityHeaders, rateLimit, safeError } from "../_security";
import { requireAdmin } from "../admin/_auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(res);
  if (!handleCors(req, res)) return safeError(res, 403, "Forbidden");
  if (req.method === "OPTIONS") return res.status(200).end();

  const admin = await requireAdmin(req);
  if (!admin) return safeError(res, 401, "Unauthorized");
  if (!rateLimit(req, "qconnect-admin", 30, 60_000)) return safeError(res, 429, "Too many requests.");

  const url    = req.url ?? "";
  const action = String(req.query.action ?? "");

  try {
    // Stats
    if (url.includes("/stats") || req.query.view === "stats") {
      return res.status(200).json(getStats());
    }

    // Single booking
    if (action === "get" || req.query.id) {
      const bookingId = String(req.query.id ?? req.query.bookingId ?? "");
      if (!/^QCON-2026-\d{6}$/.test(bookingId)) return safeError(res, 400, "Invalid booking ID.");
      const reg = getRegistration(bookingId);
      if (!reg) return safeError(res, 404, "Booking not found.");
      return res.status(200).json({ ok: true, booking: reg });
    }

    // List + CSV
    const q     = String(req.query.q ?? "");
    const page  = Number(req.query.page ?? 1);
    const { rows, total, page: pg } = listRegistrations(q, page, 25);

    if (req.query.format === "csv") {
      const header = "bookingId,fullName,registrationNumber,phone,email,amount,cashfreePaymentId,paymentStatus,bookingStatus,createdAt\n";
      const body   = rows.map((r) =>
        [r.bookingId, `"${r.fullName}"`, r.registrationNumber, r.phone, r.email,
          r.amount, r.cashfreePaymentId, r.paymentStatus, r.bookingStatus, r.createdAt].join(",")
      ).join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=qconnect-bookings.csv");
      return res.status(200).send(header + body);
    }

    return res.status(200).json({ ok: true, rows, total, page: pg });
  } catch (e) {
    console.error("[qconnect-admin]", (e as Error).message);
    return safeError(res, 500, "Something went wrong.");
  }
}
