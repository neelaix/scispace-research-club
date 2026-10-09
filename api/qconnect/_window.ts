/**
 * _window.ts — Registration window switch (server-side).
 *
 * Single flag gating POST /api/qconnect/collect and /api/qconnect/submit.
 * Set to false to pause registrations (UI shows the closed banner via
 * QCONNECT.REGISTRATIONS_OPEN in src/config/qconnect.ts — flip both
 * together when opening/closing).
 */
export const REGISTRATIONS_OPEN = false;
export const REGISTRATIONS_CLOSED_MESSAGE =
  "Registrations are closed for today. We will resume tomorrow.";
