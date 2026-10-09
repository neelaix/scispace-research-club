/**
 * POST /api/qconnect/collect
 *
 * Step 1 of registration: collect a single participant's
 * Full Name / VIT Registration Number / Phone / Email and save
 * to Google Sheets (LEADS tab) via Google Apps Script.
 *
 * Step 2 (UPI screenshot submit) is handled by POST /api/qconnect/submit.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { gasCall } from "./_gas.js";
import {
  handleCors, setSecurityHeaders, rateLimit, safeError,
  sanitizeString, isValidEmail, isValidPhone,
} from "../_security.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(res);
  if (!handleCors(req, res)) return safeError(res, 403, "Forbidden");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return safeError(res, 405, "Method not allowed");
  if (!rateLimit(req, "qconnect-collect", 10, 60_000))
    return safeError(res, 429, "Too many requests. Please wait a moment.");

  try {
    const rawBody: unknown = typeof req.body === "string"
      ? (() => { try { return JSON.parse(req.body as string); } catch { return {}; } })()
      : (req.body ?? {});
    const body = rawBody as Record<string, unknown>;

    // Accept either { participant: {...} } or flat { fullName, ... }
    const raw: Record<string, unknown> =
      (body.participant as Record<string, unknown> | undefined) ?? body;

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

    // Forward to GAS (secret stays server-side, never in the browser)
    const result = await gasCall<{ ok: boolean; leadId?: string; alreadySaved?: boolean }>(
      "saveLead",
      { ...p }
    );

    return res.status(200).json({
      ok: true,
      leadId: (result as { leadId?: string }).leadId ?? null,
      alreadySaved: (result as { alreadySaved?: boolean }).alreadySaved ?? false,
      participant: p,
    });
  } catch (e) {
    const msg = (e as Error).message ?? "";
    if (/not configured/i.test(msg))
      return safeError(res, 500, "Data collection not configured yet. Please try again later.");
    if (/unauthorized/i.test(msg))
      return safeError(res, 500, "Data collection rejected the request (bad secret). Please try again later.");
    if (/non-JSON|unreachable/i.test(msg)) {
      console.error("[qconnect-collect] upstream:", msg);
      return safeError(res, 500, "Could not reach the data store. Please try again.");
    }
    // Forward GAS validation errors (safe: no secrets) so the user sees
    // the real reason instead of a generic failure.
    if (/^Enter a valid|^Invalid|^Missing|^Screenshot must|^Only /i.test(msg))
      return safeError(res, 400, msg);
    console.error("[qconnect-collect]", msg);
    return safeError(res, 500, `Could not save your details. (${msg.slice(0, 120)})`);
  }
}
