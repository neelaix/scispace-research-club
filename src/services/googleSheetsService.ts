/**
 * googleSheetsService
 * Prepares booking for Google Apps Script. URL is empty until provided.
 */

import type { Booking } from "../types/booking";
import { GOOGLE_APPS_SCRIPT_URL } from "../config/payment";

// Exact export name required per spec
export const GOOGLE_APPS_SCRIPT_URL_PLACEHOLDER = "";

export async function sendBookingToGoogleSheets(booking: Booking): Promise<{ ok: boolean; skipped?: boolean }> {
  const url = GOOGLE_APPS_SCRIPT_URL?.trim() ?? "";
  if (!url) {
    console.info("Google Apps Script integration not configured.");
    return { ok: true, skipped: true };
  }

  // Only send appropriate data — booking already shaped per spec
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(booking),
      mode: "no-cors",
    });
    return { ok: true };
  } catch (e) {
    console.warn("[Sheets] Failed to send booking", e);
    return { ok: false };
  }
}

// Aliased for legacy import
export { sendBookingToGoogleSheets as sendBookingToSheets };
