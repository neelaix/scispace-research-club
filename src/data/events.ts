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
    id: "research-reels-ep01",
    series: "Research Reels",
    episode: "Episode 01",
    title: "Interstellar",
    tags: ["Space", "Astrophysics", "Relativity", "Exploration"],
    description:
      "Interstellar — A SciSpace Research Club Movie Experience at VIT-AP University. A space exploration screening exploring astrophysics, relativity, black holes, wormholes, time dilation, scientific research and human curiosity — encouraging students to explore scientific concepts and research through cinema. Presented by SciSpace Research Club, VIT-AP University. Theme: Space • Science • Research • Exploration.",
    status: "upcoming",
    badge: "Upcoming",
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
];

export const ongoingInitiatives: ClubEvent[] = [
  {
    id: "recruitment-2026",
    series: "Community",
    title: "Member Recruitment",
    tags: ["Research", "AI", "Technology", "Leadership"],
    description:
      "SciSpace opened recruitment for students interested in research, AI, technology, creativity, events, outreach and management. Onboarding continues as the community takes shape.",
    status: "ongoing",
    badge: "Ongoing",
  },
  {
    id: "team-selection-2026",
    series: "Community",
    title: "Team Selection",
    tags: ["Interviews", "Teams"],
    description:
      "We conducted interviews to understand students' interests, strengths and capabilities, and to assign suitable responsibilities across our eight domains.",
    status: "ongoing",
    badge: "In progress",
  },
  {
    id: "community-building",
    series: "Community",
    title: "Community Building",
    tags: ["Network", "Collaboration"],
    description:
      "We welcomed selected students into the SciSpace community and established communication channels for future coordination.",
    status: "ongoing",
    badge: "In progress",
  },
];

export const pastEvents: ClubEvent[] = [
  // Nothing has happened yet — do not fabricate past events.
];

export const allEvents: ClubEvent[] = [
  ...upcomingEvents,
  ...ongoingInitiatives,
  ...pastEvents,
];