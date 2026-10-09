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
  UPI_ID: "9492758101@slc",
  UPI_PAYEE: "SciSpace Research Club",
  UPI_NOTE: "Q-Connect 2026",
  MAX_PARTICIPANTS: 160,
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
