import type { LucideIcon } from "lucide-react";
import { Users, UserCheck, MessageSquare, Clapperboard, Sparkles, Atom } from "lucide-react";

export interface JourneyStep {
  id: string;
  phase: string;
  title: string;
  description: string;
  icon: LucideIcon;
  status: "done" | "active" | "planned";
}

export const journeySteps: JourneyStep[] = [
  {
    id: "recruitment",
    phase: "Phase 01",
    title: "Recruitment",
    description:
      "We opened recruitment for students interested in research, AI, technology, creativity, events, outreach and management.",
    icon: Users,
    status: "done",
  },
  {
    id: "team-selection",
    phase: "Phase 02",
    title: "Team Selection",
    description:
      "We conducted interviews to understand students' interests, strengths and capabilities, and assigned suitable responsibilities.",
    icon: UserCheck,
    status: "done",
  },
  {
    id: "community",
    phase: "Phase 03",
    title: "Community Building",
    description:
      "We welcomed selected students into the SciSpace community and established communication channels for future coordination.",
    icon: MessageSquare,
    status: "done",
  },
  {
    id: "research-events",
    phase: "Phase 04",
    title: "Research-Oriented Events",
    description:
      "Completed our first research-focused activities connecting entertainment, technology and academic discussion.",
    icon: Clapperboard,
    status: "done",
  },
  {
    id: "research-reels",
    phase: "Phase 05",
    title: "Research Reels",
    description:
      "Completed Episode 01: Interstellar — a research-oriented movie screening and discussion on space, astrophysics, relativity and discovery.",
    icon: Sparkles,
    status: "done",
  },
  {
    id: "qconnect-2026",
    phase: "Phase 06",
    title: "Q-Connect 2026",
    description:
      "Live now — our second event, a research session on the Reference Quantum Computer at SRM-AP University. Registrations are open.",
    icon: Atom,
    status: "active",
  },
];