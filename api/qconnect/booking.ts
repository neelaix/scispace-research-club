/**
 * GET /api/qconnect/booking?id=QCON-2026-XXXXXX
 *
 * Returns safe booking status fields. Called by the result page to show
 * PENDING (manual verification) or CONFIRMED state. No participant PII
 * is exposed.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getRegistration } from "./_store";
import { handleCors, setSecurityHeaders, rateLimit, safeError } from "../_security";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(res);
  if (!handleCors(req, res)) return safeError(res, 403, "Forbidden");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")    return safeError(res, 405, "Method not allowed");
  if (!rateLimit(req, "qconnect-booking", 60, 60_000))
    return safeError(res, 429, "Too many requests.");

  const id = String(req.query.id ?? "");
  if (!/^QCON-2026-\d{6}$/.test(id)) return safeError(res, 400, "Invalid booking ID.");

  const reg = getRegistration(id);
  if (!reg) return safeError(res, 404, "Booking not found.");

  return res.status(200).json({
    bookingId:         reg.bookingId,
    totalAmount:       reg.amount,
    cashfreeOrderId:   reg.cashfreeOrderId,
    cashfreePaymentId: reg.cashfreePaymentId,
    paymentStatus:     reg.paymentStatus,
    bookingStatus:     reg.bookingStatus,
  });
}
