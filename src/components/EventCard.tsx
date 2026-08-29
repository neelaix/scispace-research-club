import { ArrowRight, Clapperboard, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { openExternal } from "../lib/open";
import type { ClubEvent } from "../data/events";
import { Magnetic } from "./Magnetic";

const VTAPP_URL = "https://vtapp.vitap.ac.in/events/interstellar-a-journey-beyond-limits";

export function EventCard({ event }: { event: ClubEvent }) {
  const navigate = useNavigate();
  const registerUrl = event.registerUrl;
  const isInterstellar = event.title.toLowerCase() === "interstellar";
  const vtappUrl = registerUrl || VTAPP_URL;
  const openRegister = () => {
    if (isInterstellar) {
      openExternal(vtappUrl);
      return;
    }
    if (registerUrl && !registerUrl.startsWith("#TODO")) {
      openExternal(registerUrl);
      return;
    }
    navigate("/join");
  };
  // Interstellar: poster + details in SAME box
  if (isInterstellar) {
    return (
      <article className="group relative overflow-hidden rounded-3xl border border-brand-dark/8 bg-brand-dark text-white shadow-card-hover">
        {/* backdrop */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(720px 340px at 8% -5%, rgba(117,193,217,0.32), transparent 60%), radial-gradient(620px 300px at 96% 110%, rgba(253,128,44,0.30), transparent 60%), linear-gradient(160deg, #23232d, #1c1c24)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="relative z-10 grid lg:grid-cols-[1.15fr_380px]">
          {/* Left: details */}
          <div className="p-7 sm:p-9">
            <div className="flex flex-wrap items-center gap-3">
              <span className="chip bg-white/10 text-brand-blue ring-1 ring-white/10">
                <Clapperboard className="h-3.5 w-3.5" aria-hidden="true" />
                {event.series}
              </span>
              {event.episode && (
                <span className="chip bg-white/5 text-white/60">{event.episode}</span>
              )}
              {event.badge && (
                <span className="chip bg-brand-orange/90 text-white">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  {event.badge}
                </span>
              )}
            </div>

            <h3 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              {event.title}
            </h3>

            <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-display text-sm font-semibold uppercase tracking-[0.22em] text-brand-orange">
              {event.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </p>

            <p className="mt-4 max-w-xl leading-relaxed text-white/65">
              {event.description}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Magnetic>
                <button
                  type="button"
                  onClick={openRegister}
                  className="btn-accent px-6 py-3 text-sm"
                >
                  Register on VTApp <ArrowRight className="h-4 w-4" />
                </button>
              </Magnetic>
            </div>
          </div>

          {/* Right: poster in SAME box */}
          <button
            type="button"
            onClick={openRegister}
            className="relative overflow-hidden border-t border-white/10 lg:border-l lg:border-t-0"
            aria-label="Register for Interstellar on VTApp — open official VTApp page"
          >
            <img
              src="/interstellar-poster.png"
              alt="Interstellar — A Journey Beyond Limits — Official Poster by SciSpace Research Club, VIT-AP University"
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02] lg:min-h-[420px]"
              loading="lazy"
            />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 text-left lg:hidden">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-brand-dark shadow">
                Register on VTApp <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </span>
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-brand-dark/8 bg-brand-dark text-white shadow-card-hover">
      {/* backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(720px 340px at 8% -5%, rgba(117,193,217,0.32), transparent 60%), radial-gradient(620px 300px at 96% 110%, rgba(253,128,44,0.30), transparent 60%), linear-gradient(160deg, #23232d, #1c1c24)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 p-7 sm:p-9">
        <div className="flex flex-wrap items-center gap-3">
          <span className="chip bg-white/10 text-brand-blue ring-1 ring-white/10">
            <Clapperboard className="h-3.5 w-3.5" aria-hidden="true" />
            {event.series}
          </span>
          {event.episode && (
            <span className="chip bg-white/5 text-white/60">{event.episode}</span>
          )}
          {event.badge && (
            <span className="chip bg-brand-orange/90 text-white">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {event.badge}
            </span>
          )}
        </div>

        <h3 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {event.title}
        </h3>

        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-display text-sm font-semibold uppercase tracking-[0.22em] text-brand-orange">
          {event.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </p>

        <p className="mt-4 max-w-xl leading-relaxed text-white/65">
          {event.description}
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Magnetic>
            <button
              type="button"
              onClick={openRegister}
              className="btn-accent px-6 py-3 text-sm"
            >
              Register <ArrowRight className="h-4 w-4" />
            </button>
          </Magnetic>
          <button
            type="button"
            onClick={() => navigate("/events")}
            className="btn border border-white/15 bg-white/5 px-6 py-3 text-sm text-white backdrop-blur transition-colors hover:border-brand-blue/60 hover:text-brand-blue"
          >
            View Event
          </button>
        </div>
      </div>
    </article>
  );
}