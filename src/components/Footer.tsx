import { Link, useNavigate } from "react-router-dom";
import { Linkedin, Instagram, Github, Mail, ArrowUpRight } from "lucide-react";
import { config } from "../config/config";

const footers = [
  { label: "About", to: "/about" },
  { label: "Research", to: "/research" },
  { label: "Teams", to: "/teams" },
  { label: "Events", to: "/events" },
  { label: "Join Us", to: "/join" },
];

const socials = [
  { label: "LinkedIn", icon: Linkedin, url: config.LINKEDIN_URL },
  { label: "Instagram", icon: Instagram, url: config.INSTAGRAM_URL },
  { label: "GitHub", icon: Github, url: config.GITHUB_URL },
  { label: "Email", icon: Mail, url: config.EMAIL },
];

function isPlaceholder(value: string) {
  return value === "#TODO" || value.startsWith("#TODO");
}

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="relative overflow-hidden bg-brand-dark text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-brand-soft opacity-60"
      />
      <div className="container-site relative z-10 py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div className="max-w-sm">
            <button
              type="button"
              onClick={() => {
                navigate("/");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-3 text-left"
            >
              <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/15">
                <img
                  src={config.LOGO_PATH}
                  alt="SciSpace logo"
                  width={44}
                  height={44}
                  loading="lazy"
                  className="h-11 w-11 object-cover"
                />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-display text-lg font-bold tracking-[0.08em]">
                  SCISPACE
                </span>
                <span className="text-[11px] font-medium tracking-[0.24em] text-brand-orange">
                  RESEARCH CLUB
                </span>
              </span>
            </button>
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              {config.INSTITUTION}
            </p>
            <p className="mt-3 font-display text-base font-semibold tracking-wide text-brand-blue">
              {config.TAGLINE}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              A student-driven research and technology community. Curiosity
              matters more than prior experience.
            </p>
          </div>

          {/* Links */}
          <nav aria-label="Footer">
            <h3 className="text-xs font-semibold uppercase tracking-widest2 text-white/40">
              Explore
            </h3>
            <ul className="mt-5 space-y-3">
              {footers.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="group inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-brand-blue"
                  >
                    {item.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Socials */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest2 text-white/40">
              Connect
            </h3>
            <ul className="mt-5 flex flex-wrap gap-3">
              {socials.map((s) =>
                isPlaceholder(s.url) ? (
                  <li key={s.label}>
                    <span
                      title="Coming soon"
                      aria-disabled="true"
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/45"
                    >
                      <s.icon className="h-4 w-4 opacity-60" aria-hidden="true" />
                      Coming soon
                    </span>
                  </li>
                ) : (
                  <li key={s.label}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition-all hover:border-brand-orange/50 hover:text-white"
                    >
                      <s.icon className="h-4 w-4 text-brand-orange" aria-hidden="true" />
                      {s.label}
                    </a>
                  </li>
                )
              )}
            </ul>
            <p className="mt-6 text-xs text-white/35">
              Official digital home of {config.CLUB_NAME_FULL}.
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {config.CLUB_NAME_FULL}. All rights
            reserved.
          </p>
          <p className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
            {config.INSTITUTION}
          </p>
        </div>
      </div>
    </footer>
  );
}