# SciSpace Research Club — Official Website

The official digital home of **SciSpace Research Club, VIT-AP University**.

> Explore. Research. Innovate. Impact.

## Stack

- **React 18** + **TypeScript**
- **Vite 6**
- **Tailwind CSS 3**
- **Framer Motion** (animations)
- **Lucide React** (icons)
- **React Router** (hash-based routing, works on any static host)

## Getting started

```bash
npm install
npm run dev       # local dev server → http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview the production build
npm run lint      # TypeScript check (no emit)
```

## Where to update things

Everything content-driven lives in **one of two places**:

### 1. Central configuration — `src/config/config.ts`

Edit this single file to change site-wide values:

```ts
CLUB_NAME, CLUB_NAME_FULL, INSTITUTION, TAGLINE, SHORT_DESCRIPTION
GOOGLE_APPS_SCRIPT_URL  // ← the JOIN SCISPACE application form backend
                        //   (Google Apps Script Web App /exec URL)
GOOGLE_FORM_URL         // legacy external Google Form, used only as the
                        // fallback register link on event cards
LINKEDIN_URL, INSTAGRAM_URL, GITHUB_URL, EMAIL
LOGO_PATH         // official SciSpace logo asset
```

Unknown values use `#TODO` — buttons/social chips for those automatically
render a graceful "Coming soon" state instead of opening broken links.

The **Join SciSpace** page (`/join`) hosts the in-site application form
(`src/components/SciSpaceApplicationForm.tsx`). It posts these fields to
`GOOGLE_APPS_SCRIPT_URL` via a native HTML form POST into a hidden iframe:

```
fullName, registrationNumber, email, phone, domain, skills, linkedin, github
```

`domain` is the applicant's chosen team (Step 3), sent as the team name.
**Application ID is not sent from the form** — it is generated server-side by
Apps Script. `doPost` must append rows in the same order as the sheet columns:

| # | Column | Source |
| --- | --- | --- |
| 1 | Timestamp | `new Date()` |
| 2 | Application ID | auto-generated (unique, server-side) |
| 3 | Full Name | `e.parameter.fullName` |
| 4 | Registration Number | `e.parameter.registrationNumber` |
| 5 | Email | `e.parameter.email` |
| 6 | Phone | `e.parameter.phone` |
| 7 | Domain | `e.parameter.domain` |
| 8 | Skills | `e.parameter.skills` |
| 9 | LinkedIn | `e.parameter.linkedin` |
| 10 | Github | `e.parameter.github` |

```js
function generateAppId() {
  return "SCSP-" + Utilities.getUuid().slice(0, 8).toUpperCase();
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow([
    new Date(),                       // Timestamp
    generateAppId(),                  // Application ID (auto, unique)
    e.parameter.fullName,             // Full Name
    e.parameter.registrationNumber,   // Registration Number
    e.parameter.email,                // Email
    e.parameter.phone,                // Phone
    e.parameter.domain ?? "",         // Domain
    e.parameter.skills,               // Skills
    e.parameter.linkedin,             // LinkedIn
    e.parameter.github,               // Github
  ]);
  return ContentService.createTextOutput("OK");
}
```

### 2. Data files — `src/data/`

| File | Controls |
| --- | --- |
| `teams.ts` | The 8 domains shown on Home + Teams page |
| `events.ts` | Upcoming / ongoing / past events. Add an object and it appears on Home + Events page |
| `journey.ts` | The "Our Journey" timeline steps |
| `research.ts` | Research focus areas (all "Coming soon" until real work exists) |
| `members.ts` | Leadership / team leads / members (placeholders until real names) |
| `nav.ts` | Navbar links |

To add an event, append to `upcomingEvents`/`ongoingInitiatives`/`pastEvents`:

```ts
{
  id: "my-event",
  series: "Research Reels",
  episode: "Episode 02",
  title: "Blade Runner 2049",
  tags: ["AI", "Ethics"],
  description: "...",
  status: "upcoming",
  badge: "Upcoming",
  registerUrl: "https://forms.gle/...", // optional, falls back to GOOGLE_FORM_URL
  themes: ["...", "..."],               // optional
}
```

## Structure

```
src/
  config/config.ts      ← central configuration (incl. GOOGLE_APPS_SCRIPT_URL)
  data/                 ← all content (teams, events, journey, research, members, nav)
  components/           ← reusable UI + sections
    Navbar, Hero, Footer, EventCard, TeamCard, AnimatedBackground, Magnetic,
    SciSpaceApplicationForm, ...
  pages/                ← routed pages
    Home, About, Research, Teams, Events, Members, Join
  lib/                  ← scroll helpers, openExternal guard
```

## Accuracy rule

We never fabricate research, publications, achievements, names, or past events.
Where content does not yet exist, the site shows a tasteful **Coming Soon**
state. Keep it that way — real work appears here only when it is real.

## Brand

- Primary blue `#75C1D9` · Primary orange `#FD802C` · Dark `#2A2A34` · White
- Logo: `public/scispace-logo.jpg` (official asset — do not redesign or replace)
