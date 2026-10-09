/**
 * /api/qconnect/admin — Admin endpoints.
 *
 * Manual UPI flow: bookings stay PENDING until an admin verifies the
 * payment screenshot in Google Drive, then marks CONFIRMED (POST confirm)
 * and the confirmation email is sent from spaceresearch.club@vitap.ac.in.
 *
 *   GET  /api/qconnect/admin              — list bookings
 *   GET  /api/qconnect/admin?format=csv   — CSV export (sheet columns unchanged)
 *   GET  /api/qconnect/admin?view=stats   — capacity stats
 *   GET  /api/qconnect/admin?action=get&id=QCON-2026-XXXXXX — single detail
 *   POST /api/qconnect/admin              — { action: "confirm", bookingId } marks CONFIRMED + sends email
 *
 * Reads fall back to Google Sheets when the in-memory store missed
 * (cold start / another serverless instance). Sheet is the source of truth.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getRegistration, listRegistrations, getStats, updateRegistration,
} from "./_store.js";
import { gasCall } from "./_gas.js";
import { getLiveSeatCounts } from "./_seats.js";
import { sendConfirmationEmail } from "./_email.js";
import { handleCors, setSecurityHeaders, rateLimit, safeError } from "../_security.js";
import { requireAdmin } from "../admin/_auth.js";

function withStatAliases(s: Record<string, number>) {
  return {
    ...s,
    confirmedParticipants: s.confirmed ?? 0,
    pendingParticipants: s.pending ?? 0,
    failedParticipants: s.failed ?? 0,
    cancelledParticipants: s.cancelled ?? 0,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(res);
  if (!handleCors(req, res)) return safeError(res, 403, "Forbidden");
  if (req.method === "OPTIONS") return res.status(200).end();

  const admin = await requireAdmin(req);
  if (!admin) return safeError(res, 401, "Unauthorized");
  if (!rateLimit(req, "qconnect-admin", 30, 60_000)) return safeError(res, 429, "Too many requests.");

  const url    = req.url ?? "";
  const action = String(req.query.action ?? (req.body as Record<string, unknown> | undefined)?.action ?? "");

  try {
    // ── Confirm (POST) ─────────────────────────────────────────────
    if (req.method === "POST" && action === "confirm") {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const bookingId = String(body.bookingId ?? body.id ?? req.query.id ?? "");
      if (!/^QCON-2026-\d{6}$/.test(bookingId)) return safeError(res, 400, "Invalid booking ID.");
      const reg = getRegistration(bookingId);
      if (!reg) return safeError(res, 404, "Booking not in this instance. Verify it in the Sheet, then confirm there.");
      if (reg.bookingStatus === "CONFIRMED") {
        return res.status(200).json({ ok: true, alreadyConfirmed: true, booking: reg });
      }
      const emailed = await sendConfirmationEmail({ ...reg, bookingStatus: "CONFIRMED", paymentStatus: "PAYMENT_SUCCESS" });
      const updated = updateRegistration(bookingId, {
        bookingStatus: "CONFIRMED",
        paymentStatus: "PAYMENT_SUCCESS",
        emailSent: emailed,
      });
      return res.status(200).json({ ok: true, emailed, booking: updated });
    }

    if (req.method !== "GET") return safeError(res, 405, "Method not allowed");

    // Stats (Sheet truth first — the in-memory store only sees this instance)
    if (url.includes("/stats") || req.query.view === "stats") {
      try {
        // Full paginated count from Sheets (source of truth), not just page 1.
        const c = await getLiveSeatCounts();
        const stats = { confirmed: c.confirmed, pending: c.pending, failed: 0, cancelled: 0, capacity: c.capacity, seatsLeft: c.seatsLeft };
        return res.status(200).json(withStatAliases(stats as unknown as Record<string, number>));
      } catch {
        const s = getStats();
        return res.status(200).json(withStatAliases(s as unknown as Record<string, number>));
      }
    }

    // Single booking (store first, Sheet fallback)
    if (action === "get" || req.query.id) {
      const bookingId = String(req.query.id ?? req.query.bookingId ?? "");
      if (!/^QCON-2026-\d{6}$/.test(bookingId)) return safeError(res, 400, "Invalid booking ID.");
      const reg = getRegistration(bookingId);
      if (reg) return res.status(200).json({ ok: true, booking: reg });
      try {
        const sheet = await gasCall<Record<string, unknown>>("get", { bookingId });
        return res.status(200).json({
          ok: true,
          booking: {
            bookingId,
            fullName: sheet.fullName ?? "",
            registrationNumber: sheet.registrationNumber ?? "",
            phone: sheet.phone ?? "",
            email: sheet.email ?? "",
            amount: Number(sheet.amount ?? 50),
            cashfreeOrderId: "",
            cashfreePaymentId: sheet.cashfreePaymentId ?? "",
            paymentStatus: sheet.paymentStatus ?? "PENDING",
            bookingStatus: sheet.bookingStatus ?? "PENDING",
            createdAt: sheet.savedAt ?? "",
            emailSent: false,
            fromSheet: true,
          },
        });
      } catch {
        return safeError(res, 404, "Booking not found.");
      }
    }

    // List + CSV (store first, Sheet fallback when empty)
    const q     = String(req.query.q ?? "");
    const page  = Number(req.query.page ?? 1);
    const store = listRegistrations(q, page, 25);

    let rows = store.rows;
    let total = store.total;
    if (total === 0) {
      try {
        const sheet = await gasCall<{
          ok: boolean; rows?: Array<Record<string, unknown>>; total?: number; page?: number;
        }>("list", { query: q, page, limit: 25 });
        rows = ((sheet.rows ?? []) as Array<Record<string, unknown>>).map((r) => ({
          bookingId: String(r.bookingId ?? ""),
          fullName: String(r.fullName ?? ""),
          registrationNumber: String(r.registrationNumber ?? ""),
          phone: String(r.phone ?? ""),
          email: String(r.email ?? ""),
          amount: Number(r.amount ?? 50),
          cashfreeOrderId: "",
          cashfreePaymentId: String(r.cashfreePaymentId ?? ""),
          paymentStatus: String(r.paymentStatus ?? "PENDING"),
          bookingStatus: String(r.bookingStatus ?? "PENDING"),
          createdAt: String(r.savedAt ?? ""),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as unknown as any)) as typeof rows;
        total = Number(sheet.total ?? rows.length);
      } catch {
        // fall through with empty store rows
      }
    }

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

    return res.status(200).json({ ok: true, rows, total, page: store.page });
  } catch (e) {
    console.error("[qconnect-admin]", (e as Error).message);
    return safeError(res, 500, "Something went wrong.");
  }
}
