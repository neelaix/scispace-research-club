import type { LucideIcon } from "lucide-react";
import { Users, UserCheck, MessageSquare, Clapperboard, Sparkles } from "lucide-react";

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
      "We are planning research-focused activities that connect entertainment, technology and academic discussion.",
    icon: Clapperboard,
    status: "active",
  },
  {
    id: "whats-next",
    phase: "What's next",
    title: "Research Reels",
    description:
      "Launching soon — a research-oriented movie screening and discussion series. Episode 01: Interstellar — A SciSpace Research Club Movie Experience exploring space, astrophysics, relativity and discovery.",
    icon: Sparkles,
    status: "planned",
  },
];