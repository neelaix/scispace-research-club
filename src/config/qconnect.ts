/**
 * Q-CONNECT 2026 — central event configuration.
 * Single source of truth for event details and pricing.
 * Backend MUST re-validate amount/capacity — never trust client-side values.
 * Open event — details surface on listing pages and the /qconnect route.
 */
export const QCONNECT = {
  EVENT_ID: "q-connect-2026",
  EVENT_NAME: "Q-Connect 2026",
  TAGLINE: "Connecting Minds. Exploring Quantum.",
  SUBTITLE: "A Research Session on Reference Quantum Computing",
  ORGANIZER: "SciSpace Research Club",
  INSTITUTION: "VIT-AP",
  COORDINATORS: ["Manda Neelaksh", "Mithinti Ramani"] as const,
  EVENT_DATE: "21 October 2026",
  EVENT_TIME: "11:00 AM – 3:00 PM",
  EVENT_VENUE: "SRM - AP University",
  TICKET_PRICE: 50,
  CURRENCY: "INR",
  // Manual UPI collection (Cashfree removed)
  UPI_ID: "mandaneelaksh7m@okicici",
  UPI_PAYEE: "Manda Neelaksh",
  UPI_NOTE: "Q-Connect 2026",
  MAX_PARTICIPANTS: 160,
  // Registration window switch — master kill-switch + scheduled open time.
  // Deploy with OPEN=true + OPEN_AT in the future to auto-open (no redeploy at T-0).
  REGISTRATIONS_OPEN: false,
  REGISTRATIONS_OPEN_AT: "2026-10-10T11:00:00+05:30",
  REGISTRATIONS_OPENS_NOTE: "Registrations open today at 11:00 AM IST.",
  REGISTRATIONS_CLOSED_NOTE: "New registrations are paused.",
  // Screenshot uploads stay open for registered/paid participants.
  SCREENSHOT_UPLOADS_OPEN: true,
  SCREENSHOT_UPLOADS_NOTE: "If you paid but didn't upload your screenshot, you're allowed — upload it here.",
  BOOKING_PREFIX: "QCON-2026-",
  EVENT_PATH: "/qconnect",
  LOGO_PATH: "/qconnect/q.png",
  POSTER_PATH: "/qconnect/q.png",
  DESCRIPTION:
    "Q-Connect 2026 is a research-oriented session designed to give students exposure to quantum computing concepts and the Reference Quantum Computer at SRM - AP University. A concise, exciting deep-dive into Quantum Computing, Research, Emerging Technology and real student learning pathways.",
  THEMES: [
    "Quantum Computing",
    "Research",
    "Emerging Technology",
    "Reference Quantum Computer",
    "Student Learning",
    "Research Opportunities",
  ],
} as const;

/** Epoch ms for the scheduled open (IST string above). NaN if misconfigured. */
export const QCONNECT_OPEN_AT_MS: number = Date.parse(QCONNECT.REGISTRATIONS_OPEN_AT);

/** Time-aware gate: master switch AND now >= OPEN_AT. */
export function isQConnectOpen(now: number = Date.now()): boolean {
  if (!QCONNECT.REGISTRATIONS_OPEN) return false;
  if (Number.isNaN(QCONNECT_OPEN_AT_MS)) return true;
  return now >= QCONNECT_OPEN_AT_MS;
}

/** Screenshot-upload gate: stays open for registered participants even when new registrations pause. */
export function isUploadOpen(): boolean {
  return QCONNECT.SCREENSHOT_UPLOADS_OPEN;
}
