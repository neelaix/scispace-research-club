/**
 * GET /api/qconnect/booking?id=QCON-2026-XXXXXX
 *
 * Returns safe booking status fields. Called by the result page to show
 * PENDING (manual verification) or CONFIRMED state. No participant PII
 * is exposed.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getRegistration } from "./_store.js";
import { gasCall } from "./_gas.js";
import { handleCors, setSecurityHeaders, rateLimit, safeError } from "../_security.js";

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
  if (reg) {
    return res.status(200).json({
      bookingId:         reg.bookingId,
      totalAmount:       reg.amount,
      cashfreeOrderId:   reg.cashfreeOrderId,
      cashfreePaymentId: reg.cashfreePaymentId,
      paymentStatus:     reg.paymentStatus,
      bookingStatus:     reg.bookingStatus,
    });
  }

  // Fallback to Google Sheets (source of truth) when the in-memory
  // store missed (cold start / another serverless instance).
  try {
    const sheet = await gasCall<{
      ok: boolean; bookingId?: string; amount?: number;
      cashfreePaymentId?: string; paymentStatus?: string; bookingStatus?: string;
    }>("get", { bookingId: id });
    return res.status(200).json({
      bookingId:         sheet.bookingId ?? id,
      totalAmount:       Number(sheet.amount ?? 50),
      cashfreeOrderId:   "",
      cashfreePaymentId: sheet.cashfreePaymentId ?? "",
      paymentStatus:     sheet.paymentStatus ?? "PENDING",
      bookingStatus:     sheet.bookingStatus ?? "PENDING",
    });
  } catch {
    return safeError(res, 404, "Booking not found.");
  }
}
