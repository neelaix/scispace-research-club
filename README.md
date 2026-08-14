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
GOOGLE_FORM_URL   // ← the JOIN SCISPACE form, opened in a new tab
LINKEDIN_URL, INSTAGRAM_URL, GITHUB_URL, EMAIL
LOGO_PATH         // official SciSpace logo asset
```

Unknown values use `#TODO` — buttons/social chips for those automatically
render a graceful "Coming soon" state instead of opening broken links.

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
  config/config.ts      ← central configuration
  data/                 ← all content (teams, events, journey, research, members, nav)
  components/           ← reusable UI + sections
    Navbar, Hero, Footer, EventCard, TeamCard, AnimatedBackground, Magnetic, ...
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
