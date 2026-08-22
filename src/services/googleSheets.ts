/**
 * Google Sheets integration placeholder
 * DO NOT implement Apps Script yet — we only prepare the service.
 *
 * Only VERIFIED and PAID bookings should eventually be sent.
 * The URL is read from environment: VITE_GOOGLE_APPS_SCRIPT_URL (frontend)
 * or GOOGLE_APPS_SCRIPT_URL (backend). Falls back to empty string.
 */

import type { Booking } from "../types/booking";

// Env var handled via googleSheetsService (kept for spec placeholder)

export async function sendBookingToGoogleSheets(booking: Booking): Promise<{ ok: boolean; skipped?: boolean }> {
  // Compatibility shim — delegates to googleSheetsService which handles empty URL gracefully
  const { sendBookingToGoogleSheets: svc } = await import("./googleSheetsService");
  // For UPI bookings, status is PAYMENT_CHECK_*; allow PASS
  const okStatus = ["PAYMENT_CHECK_PASSED", "PAYMENT_SUBMISSION_RECEIVED", "PAID", "PENDING_REVIEW"].includes(
    (booking.payment as unknown as { status: string }).status
  );
  if (!okStatus) {
    console.warn("[Sheets] Skipping non-PAID booking", booking.bookingId);
    return { ok: false, skipped: true };
  }
  return svc(booking);
}

export const GOOGLE_APPS_SCRIPT_PLACEHOLDER = 'GOOGLE_APPS_SCRIPT_URL=""';
