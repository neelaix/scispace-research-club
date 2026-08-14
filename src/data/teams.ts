import type { LucideIcon } from "lucide-react";
import {
  FlaskConical,
  Cpu,
  PenTool,
  Palette,
  CalendarDays,
  Megaphone,
  Handshake,
  Settings2,
} from "lucide-react";

export interface Team {
  id: string;
  number: string;
  name: string;
  short: string;
  description: string;
  icon: LucideIcon;
  color: "blue" | "orange";
}

export const teams: Team[] = [
  {
    id: "research",
    number: "01",
    name: "Research Team",
    short: "Research exploration, literature reviews and research projects.",
    description:
      "Research exploration, literature reviews, research projects, paper discussions, experimentation and research initiatives.",
    icon: FlaskConical,
    color: "blue",
  },
  {
    id: "ai-technology",
    number: "02",
    name: "AI & Technology Team",
    short: "AI, ML, generative AI and experimentation with emerging tech.",
    description:
      "Artificial Intelligence, Machine Learning, Generative AI, emerging technologies, technical projects and experimentation.",
    icon: Cpu,
    color: "orange",
  },
  {
    id: "content-publications",
    number: "03",
    name: "Content & Publications Team",
    short: "Technical writing, research communication and knowledge sharing.",
    description:
      "Technical writing, research communication, articles, publications, documentation and knowledge sharing.",
    icon: PenTool,
    color: "blue",
  },
  {
    id: "design-creative",
    number: "04",
    name: "Design & Creative Team",
    short: "Visual identity, event creatives, presentations and branding.",
    description:
      "Visual identity, posters, event creatives, presentations, branding and creative communication.",
    icon: Palette,
    color: "blue",
  },
  {
    id: "events-workshops",
    number: "05",
    name: "Events & Workshops Team",
    short: "Research talks, technical sessions and student activities.",
    description:
      "Research talks, workshops, movie/research screenings, technical sessions and student activities.",
    icon: CalendarDays,
    color: "orange",
  },
  {
    id: "marketing-social",
    number: "06",
    name: "Marketing & Social Media Team",
    short: "Digital campaigns, content strategy and community growth.",
    description:
      "Digital campaigns, LinkedIn, social media, content strategy, announcements and community growth.",
    icon: Megaphone,
    color: "blue",
  },
  {
    id: "pr-outreach",
    number: "07",
    name: "Public Relations & Outreach Team",
    short: "Speaker outreach, partnerships, networking and communication.",
    description:
      "External collaborations, speaker outreach, partnerships, networking and communication.",
    icon: Handshake,
    color: "orange",
  },
  {
    id: "operations-management",
    number: "08",
    name: "Operations & Management Team",
    short: "Planning, scheduling, logistics and internal systems.",
    description:
      "Planning, coordination, scheduling, logistics, internal systems and execution.",
    icon: Settings2,
    color: "blue",
  },
];