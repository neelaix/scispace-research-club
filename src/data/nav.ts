export interface NavLink {
  label: string;
  /** Route path */
  to: string;
  /** Optional section id on the Home page (deep scroll target) */
  hash?: string;
}

export const navLinks: NavLink[] = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Research", to: "/research" },
  { label: "Teams", to: "/teams" },
  { label: "Events", to: "/events" },
  { label: "Our Journey", to: "/", hash: "journey" },
  { label: "Join Us", to: "/join" },
];