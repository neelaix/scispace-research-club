import type { LucideIcon } from "lucide-react";
import {
  FlaskConical,
  BookOpen,
  Compass,
  Braces,
  Blocks,
  FileText,
} from "lucide-react";

export interface ResearchCategory {
  id: string;
  title: string;
  short: string;
  icon: LucideIcon;
  status: "coming-soon";
}

export const researchCategories: ResearchCategory[] = [
  {
    id: "projects",
    title: "Research Projects",
    short:
      "Active explorations led by SciSpace students. Our first projects are being shaped — details will appear here as they take form.",
    icon: FlaskConical,
    status: "coming-soon",
  },
  {
    id: "paper-discussions",
    title: "Paper Discussions",
    short:
      "Structured sessions to read, unpack and debate influential research papers together.",
    icon: BookOpen,
    status: "coming-soon",
  },
  {
    id: "opportunities",
    title: "Research Opportunities",
    short:
      "Internships, programs, grants and calls for participation that emerge for our community.",
    icon: Compass,
    status: "coming-soon",
  },
  {
    id: "technical-explorations",
    title: "Technical Explorations",
    short:
      "Guided experiments and write-ups across AI, ML, generative AI and emerging technologies.",
    icon: Braces,
    status: "coming-soon",
  },
  {
    id: "student-projects",
    title: "Student Projects",
    short:
      "Student-led builds where curiosity becomes code, and code becomes something demonstrable.",
    icon: Blocks,
    status: "coming-soon",
  },
  {
    id: "publications",
    title: "Publications",
    short:
      "Articles and papers produced by the community. We publish only real, finished work here.",
    icon: FileText,
    status: "coming-soon",
  },
];