/**
 * Events system — add a new object in `upcoming`, `ongoing` or `past`
 * and it will automatically appear on the Events page and home section.
 */

export type EventStatus = "upcoming" | "ongoing" | "past";

export interface ClubEvent {
  id: string;
  series: string;
  episode?: string;
  title: string;
  tags: string[];
  description: string;
  status: EventStatus;
  /** Optional short label shown on cards, e.g. "Planned" */
  badge?: string;
  /** Event-specific registration form — falls back to the club's global form. */
  registerUrl?: string;
  /** Optional discussion themes shown on the event's detail card */
  themes?: string[];
}

export const upcomingEvents: ClubEvent[] = [
  {
    id: "research-reels-ep02-secret",
    series: "Research Reels",
    episode: "Episode 02",
    title: "Secret Transmission — Next Screening",
    tags: ["Secret", "Research", "Cinema"],
    description:
      "Something is incoming. The next Research Reels screening is locked — SciSpace is preparing a secret transmission. Stay tuned, the signal will be revealed soon.",
    status: "upcoming",
    badge: "Secret — Coming Soon",
    themes: ["Secret Event", "Research", "Exploration"],
  },
];

export const ongoingInitiatives: ClubEvent[] = [];

export const pastEvents: ClubEvent[] = [
  {
    id: "research-reels-ep01",
    series: "Research Reels",
    episode: "Episode 01",
    title: "Interstellar",
    tags: ["Space", "Astrophysics", "Relativity", "Exploration"],
    description:
      "Interstellar: A Journey Beyond Limits — past screening by SciSpace Research Club, VIT-AP University. A research-oriented movie screening that brought together 339 students. Presented by SciSpace Research Club, VIT-AP University.",
    status: "past",
    badge: "Completed — Past Event",
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
    ],
  },
  {
    id: "recruitment-2026",
    series: "Community",
    title: "Member Recruitment",
    tags: ["Research", "AI", "Technology", "Leadership"],
    description:
      "Recruitment completed — we opened applications for students passionate about research, AI, technology, creativity, events, outreach and management. Selected members have been onboarded. Missed it? You can still join — email us at spaceresearch.club@vitap.ac.in or visit /join.",
    status: "past",
    badge: "Completed",
  },
  {
    id: "team-selection-2026",
    series: "Community",
    title: "Team Selection",
    tags: ["Interviews", "Teams"],
    description:
      "We interviewed applicants to understand their interests, strengths and capabilities and assigned responsibilities across our eight domains. Teams are now active.",
    status: "past",
    badge: "Completed",
  },
  {
    id: "community-building",
    series: "Community",
    title: "Community Building",
    tags: ["Network", "Collaboration"],
    description:
      "Community building completed — new members have been welcomed into SciSpace and communication channels are live. Want to join? Reach out at spaceresearch.club@vitap.ac.in.",
    status: "past",
    badge: "Completed",
  },
];

export const allEvents: ClubEvent[] = [
  ...upcomingEvents,
  ...ongoingInitiatives,
  ...pastEvents,
];