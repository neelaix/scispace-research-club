/**
 * Interstellar — SciSpace Research Club Movie Experience
 * Central configuration for the single featured event.
 */

export const INTERSTELLAR_EVENT = {
  id: "interstellar-2026",
  series: "Research Reels",
  episode: "Episode 01",
  /** Display title */
  title: "Interstellar",
  /** Full event name */
  fullName: "Interstellar — A SciSpace Research Club Movie Experience",
  club: "SciSpace Research Club",
  institution: "VIT-AP University",
  theme: "Space • Science • Research • Exploration",
  /** Short description — space/research themed, no pseudoscience claims */
  description:
    "Interstellar — A SciSpace Research Club Movie Experience at VIT-AP University. Join us for a cinematic journey through space exploration, astrophysics, relativity, black holes, wormholes and time dilation — followed by a guided discussion that encourages students to explore scientific concepts and research through cinema. An invitation to curiosity, exploration and discovery. Organized by SciSpace Research Club, VIT-AP University. Theme: Space • Science • Research • Exploration.",
  /** Longer detail used on booking page */
  longDescription:
    "Space has always called to human curiosity. Interstellar takes us across wormholes, near black holes and through the distortions of time itself — not as fantasy to be taken literally, but as a springboard for real scientific inquiry. At this SciSpace Research Club screening we watch, then we question: How does relativity shape time near a black hole? What do we actually know about wormholes? How does real astrophysics research happen? Whether you love physics, astronomy, or simply the thrill of exploration and discovery, this evening is designed to turn cinema into conversation and conversation into research curiosity.",
  tags: ["Space", "Astrophysics", "Relativity", "Exploration"] as const,
  themes: [
    "Space Exploration",
    "Astrophysics",
    "Relativity",
    "Black Holes",
    "Wormholes",
    "Time Dilation",
    "Scientific Research",
    "Human Curiosity",
    "Exploration & Discovery",
  ] as const,
  status: "upcoming" as const,
  badge: "Upcoming" as const,
} as const;

/** Ticket pricing — ₹25 per person, no discount, no limit */
export const TICKET_PRICING = {
  pricePerPerson: 25,
  currency: "INR" as const,
  /** Formula: total = attendees × 25 */
  calculateTotal: (attendeeCount: number) => attendeeCount * 25,
} as const;

/** Seating policy */
export const SEATING = {
  type: "GENERAL ADMISSION" as const,
  mode: "OPEN SEATING" as const,
  label: "Open Seating — Choose any available seat at the venue.",
  hasSeatMap: false,
  hasSeatNumbers: false,
  hasReservedSeating: false,
} as const;
