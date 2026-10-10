/**
 * _window.ts — Registration window switch (server-side).
 *
 * Master switch + scheduled open time. Deploy ahead of T-0 with
 * REGISTRATIONS_OPEN=true and OPEN_AT in the future; collect/submit
 * return 403 until Date.now() >= OPEN_AT, then open automatically.
 * Flip REGISTRATIONS_OPEN to false any time for an instant manual pause.
 */
export const REGISTRATIONS_OPEN = true;
export const REGISTRATIONS_OPEN_AT = "2026-10-10T11:00:00+05:30";
export const REGISTRATIONS_OPEN_AT_MS: number = Date.parse(REGISTRATIONS_OPEN_AT);
export const REGISTRATIONS_CLOSED_MESSAGE =
  "Registrations are closed for today. We will resume tomorrow.";
export const REGISTRATIONS_OPENS_MESSAGE =
  "Registrations open today at 11:00 AM IST. Please come back then.";

export function isWindowOpen(now: number = Date.now()): boolean {
  if (!REGISTRATIONS_OPEN) return false;
  if (Number.isNaN(REGISTRATIONS_OPEN_AT_MS)) return true;
  return now >= REGISTRATIONS_OPEN_AT_MS;
}
