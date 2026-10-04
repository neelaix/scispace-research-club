/**
 * POST /api/qconnect/submit
 *
 * Manual UPI flow (Cashfree removed):
 *   1. Validate exactly 1 participant (Full Name / VIT Reg No / Phone / Email)
 *   2. Require uploaded screenshot (JPG/PNG/WebP, <=5MB) + tick confirmation
 *   3. Create PENDING registration in store
 *   4. Upload screenshot to Google Drive via GAS (secret stays server-side)
 *   5. Save PENDING row to Google Sheets REGISTRATIONS tab via GAS
 *      (Sheet structure unchanged — screenshot lives only in Drive)
 *
 * No confirmation email is sent here. Admin manually verifies the
 * screenshot in Drive, then marks CONFIRMED and sends the email from
 * spaceresearch.club@vitap.ac.in.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createRegistration, updateRegistration } from "./_store";
import { gasCall } from "./_gas";
import {
  handleCors, setSecurityHeaders, rateLimit, safeError,
  sanitizeString, isValidEmail, isValidPhone,
} from "../_security";

const TICKET_PRICE = 50;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(res);
  if (!handleCors(req, res)) return safeError(res, 403, "Forbidden");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return safeError(res, 405, "Method not allowed");
  if (!rateLimit(req, "qconnect-submit", 5, 60_000))
    return safeError(res, 429, "Too many requests. Please wait a moment.");

  try {
    const rawBody: unknown = typeof req.body === "string"
      ? (() => { try { return JSON.parse(req.body as string); } catch { return {}; } })()
      : (req.body ?? {});
    const body = rawBody as Record<string, unknown>;

    // ── 1. Participant (exactly 1) ─────────────────────────────────────────
    const raw = (body.participant as Record<string, unknown> | undefined) ?? {};
    const p = {
      fullName:           sanitizeString(raw.fullName,           80),
      registrationNumber: sanitizeString(raw.registrationNumber, 20).toUpperCase(),
      phone:              sanitizeString(raw.phone,              15).replace(/\D/g, ""),
      email:              sanitizeString(raw.email,             254).toLowerCase(),
    };

    if (!/^[a-zA-Z\s.'-]{2,80}$/.test(p.fullName))
      return safeError(res, 400, "Enter a valid full name.");
    if (!/^[A-Z0-9-]{5,20}$/.test(p.registrationNumber))
      return safeError(res, 400, "Enter a valid registration number.");
    if (!isValidPhone(p.phone))
      return safeError(res, 400, "Enter a valid 10-digit phone number.");
    if (!isValidEmail(p.email))
      return safeError(res, 400, "Enter a valid email address.");

    // ── 2. Tick confirmation ───────────────────────────────────────────────
    if (body.uploadedConfirmed !== true && body.confirmed !== true)
      return safeError(res, 400, "Please tick “I have uploaded my payment screenshot” to continue.");

    // ── 3. Screenshot (JSON base64 — frontend reads the file, never touches GAS) ──
    const shot = (body.screenshot as Record<string, unknown> | undefined) ?? {};
    const mimeType = String(shot.mimeType ?? shot.type ?? "");
    const dataBase64 = String(shot.dataBase64 ?? shot.data ?? "");
    const origName = sanitizeString(shot.fileName ?? shot.name ?? "payment-screenshot", 80);

    if (!dataBase64) return safeError(res, 400, "Please upload your payment screenshot.");
    if (!ALLOWED_TYPES.has(mimeType.toLowerCase()))
      return safeError(res, 400, "Screenshot must be JPG, PNG or WebP.");
    // Approx byte size from base64 length
    const approxBytes = Math.floor((dataBase64.length * 3) / 4);
    if (approxBytes > MAX_BYTES || approxBytes <= 0)
      return safeError(res, 400, "Screenshot must be 5MB or smaller.");
    if (dataBase64.length > 8 * 1024 * 1024)
      return safeError(res, 400, "Screenshot must be 5MB or smaller.");

    // ── 4. Create PENDING registration ─────────────────────────────────────
    const reg = createRegistration({
      event:              "Q-Connect 2026",
      fullName:           p.fullName,
      registrationNumber: p.registrationNumber,
      phone:              p.phone,
      email:              p.email,
      amount:             TICKET_PRICE,
      cashfreeOrderId:    "",
      cashfreePaymentId:  "",
      screenshotFileId:   "",
      screenshotUrl:      "",
      paymentStatus:      "PENDING",
      bookingStatus:      "PENDING",
      emailSent:          false,
    });

    // ── 5. Upload screenshot to Drive via GAS ──────────────────────────────
    const ext = mimeType.toLowerCase().includes("png") ? "png" : mimeType.toLowerCase().includes("webp") ? "webp" : "jpg";
    const safeReg = p.registrationNumber.replace(/[^A-Z0-9-]/g, "");
    const fileName = `${reg.bookingId}_${safeReg}_${Date.now()}.${ext}`;

    let fileId = "";
    let fileUrl = "";
    try {
      const up = await gasCall<{ ok: boolean; fileId?: string; fileUrl?: string }>(
        "uploadScreenshot",
        { bookingId: reg.bookingId, fileName, mimeType, dataBase64, originalName: origName }
      );
      fileId = (up as { fileId?: string }).fileId ?? "";
      fileUrl = (up as { fileUrl?: string }).fileUrl ?? "";
    } catch (e) {
      console.error("[qconnect-submit] Drive upload failed:", (e as Error).message);
      return safeError(res, 500, "Could not save your screenshot. Please try again.");
    }
    if (!fileId) return safeError(res, 500, "Could not save your screenshot. Please try again.");

    updateRegistration(reg.bookingId, { screenshotFileId: fileId, screenshotUrl: fileUrl });

    // ── 6. Save PENDING row to Sheets (structure unchanged) ────────────────
    try {
      await gasCall("savePending", {
        bookingId:          reg.bookingId,
        fullName:           p.fullName,
        registrationNumber: p.registrationNumber,
        phone:              p.phone,
        email:              p.email,
        amount:             TICKET_PRICE,
        paymentStatus:      "PENDING",
        bookingStatus:      "PENDING",
      });
    } catch (e) {
      console.error("[qconnect-submit] GAS savePending failed:", (e as Error).message);
      // Screenshot is already in Drive + store has the record; surface as error
      // so the user retries (savePending is idempotent by bookingId).
      return safeError(res, 500, "Screenshot saved but sheet entry failed. Please submit again.");
    }

    return res.status(200).json({ ok: true, bookingId: reg.bookingId, amount: TICKET_PRICE });
  } catch (e) {
    console.error("[qconnect-submit]", (e as Error).message);
    return safeError(res, 500, "Could not submit your registration. Please try again.");
  }
}
