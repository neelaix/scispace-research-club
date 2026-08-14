/**
 * Leadership & members.
 * Actual member names have not been provided — we do not invent names,
 * so leadership entries use clear placeholders until real data arrives.
 */

export type Member = {
  id: string;
  role: string;
  group: "leadership" | "team-leads" | "core" | "members";
  /** Placeholder unless the real name is provided. */
  name: string;
  note: string;
};

export const leadership: Member[] = [
  {
    id: "president",
    role: "President",
    group: "leadership",
    name: "—",
    note: "To be announced",
  },
  {
    id: "vice-president",
    role: "Vice President",
    group: "leadership",
    name: "—",
    note: "To be announced",
  },
];

export const teamLeadRoles: string[] = [
  "Research Team Lead",
  "AI & Technology Team Lead",
  "Content & Publications Lead",
  "Design & Creative Lead",
  "Events & Workshops Lead",
  "Marketing & Social Media Lead",
  "Public Relations & Outreach Lead",
  "Operations & Management Lead",
];

export const coreTeamNote =
  "Core team members will be listed here once formal onboarding is complete.";

export interface GroupBlock {
  key: string;
  label: string;
  description: string;
}

export const memberGroups: GroupBlock[] = [
  {
    key: "leadership",
    label: "Leadership",
    description:
      "The students steering the community: President, Vice President and the founding leadership.",
  },
  {
    key: "team-leads",
    label: "Team Leads",
    description:
      "Leads for each of our eight domains. Names are confirmed as teams finalize.",
  },
  {
    key: "core",
    label: "Core Team",
    description: coreTeamNote,
  },
  {
    key: "members",
    label: "Members",
    description:
      "Every curious student who joins the SciSpace community — listed here soon.",
  },
];

export const doesNotSupportUnknown = true; // placeholder guard; remove when actual data is added