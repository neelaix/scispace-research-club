/**
 * ============================================================
 *  SCISPACE CENTRAL CONFIGURATION
 * ------------------------------------------------------------
 *  Every site-wide value lives here. Edit this one file to
 *  update the whole website. Values not yet known use clear
 *  placeholders (#TODO) so they can be filled in later.
 * ============================================================
 */

/**
 * ============================================================
 *  APPLICATION FORM BACKEND (Google Apps Script Web App)
 * ------------------------------------------------------------
 *  The "Join SciSpace" application form POSTs to this Apps
 *  Script Web App, which writes rows into Google Sheets.
 *
 *  👉 Paste your deployed Web App URL here (the /exec URL):
 *       https://script.google.com/macros/s/XXXXXXXX/exec
 *
 *  The Apps Script must accept exactly these POST fields:
 *       fullName, registrationNumber, email, phone, domain,
 *       skills, linkedin, github
 *  (`domain` is the applicant's chosen team, sent as the team name.)
 * ============================================================
 */
export const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxcI761Txew34lwy6LLjZSMKHxGaM4ubp1_RI6rRXIvq8iW_ihJxU9UEFZdaDNKpSHx_g/exec";

export const config = {
  /** Official club name */
  CLUB_NAME: "SciSpace",
  /** Full official name */
  CLUB_NAME_FULL: "SciSpace Research Club",

  /** Institution */
  INSTITUTION: "VIT-AP University",

  /** Core tagline */
  TAGLINE: "Explore. Research. Innovate. Impact.",
  TAGLINE_PHRASES: ["Explore.", "Research.", "Innovate.", "Impact."] as const,

  /** Short one-line description (meta + hero) */
  SHORT_DESCRIPTION:
    "A student-driven research and technology community at VIT-AP University.",

  /** Social & contact */
  LINKEDIN_URL: "https://www.linkedin.com/company/scispace-research-club/",
  INSTAGRAM_URL: "https://www.instagram.com/scispace_vitap/",
  GITHUB_URL: "#TODO",
  EMAIL: "#TODO",

  /** Path to the official SciSpace logo asset */
  LOGO_PATH: "./scispace-logo.jpg",

  /** Website meta — update once the real domain is live. */
  SITE_URL: "https://scispace.in/", // placeholder domain
  SITE_TITLE: "SciSpace Research Club | VIT-AP University",
  SITE_DESCRIPTION:
    "SciSpace Research Club is a student-driven research and technology community at VIT-AP University focused on research, AI, emerging technologies, innovation and collaboration.",
} as const;

export type SiteConfig = typeof config;
