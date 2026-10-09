import { ArrowRight, Atom, Clapperboard, FlaskConical, Sparkles } from "lucide-react";
import { QCONNECT } from "../config/qconnect";
import { useNavigate } from "react-router-dom";
import { openExternal } from "../lib/open";
import type { ClubEvent } from "../data/events";
import { Magnetic } from "./Magnetic";
import { InterstellarInteractiveCard } from "./InterstellarInteractiveCard";

const VTAPP_URL = "https://vtapp.vitap.ac.in/events/interstellar-a-journey-beyond-limits";

export function EventCard({ event }: { event: ClubEvent }) {
  const navigate = useNavigate();
  const registerUrl = event.registerUrl;
  const isInterstellar = event.id === "research-reels-ep01" || event.title.toLowerCase() === "interstellar";
  const vtappUrl = registerUrl || VTAPP_URL;
  const openRegister = () => {
    if (isInterstellar) {
      openExternal(vtappUrl);
      return;
    }
    if (registerUrl && registerUrl.startsWith("/") && !registerUrl.startsWith("//")) {
      navigate(registerUrl);
      return;
    }
    if (registerUrl && !registerUrl.startsWith("#TODO")) {
      openExternal(registerUrl);
      return;
    }
    navigate("/join");
  };
  // Interstellar: premium interactive poster — hover compress + cinematic panel
  if (isInterstellar) {
    return <InterstellarInteractiveCard />;
  }
  // Q-Connect — open 2nd event, presented just like Interstellar (open title + research positioning).
  // Quantum dark design kept; only the secrecy is removed.
  if (event.id === "qconnect-2026") {
    const detail = event.detailPath ?? QCONNECT.EVENT_PATH;
    const register = event.registerUrl ?? `${QCONNECT.EVENT_PATH}/register`;
    return (
      <article className="group relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-[#070b1d] text-white shadow-card-hover">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(640px 300px at 10% 0%, rgba(34,211,238,0.20), transparent 60%), radial-gradient(560px 300px at 95% 100%, rgba(212,175,55,0.14), transparent 60%), linear-gradient(160deg, #070b1d, #0b1230 60%, #130c30)",
          }}
        />
        <div className="relative z-10 flex flex-col gap-6 p-7 sm:p-9 lg:flex-row lg:items-center">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
                <Atom className="h-3.5 w-3.5" aria-hidden="true" /> {event.episode} · Second Event
              </span>
              <span className="chip border border-amber-300/30 bg-amber-300/10 text-amber-200">
                <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" /> Research-Focused
              </span>
              {event.badge && <span className="chip bg-white/5 text-white/60">{event.badge}</span>}
            </div>
            <h3 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{event.title}</h3>
            <p className="mt-1 text-sm font-semibold text-cyan-100/80">{QCONNECT.TAGLINE} · {QCONNECT.SUBTITLE}</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">{event.description}</p>
            {event.themes && event.themes.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {event.themes.slice(0, 6).map((t) => (
                  <span key={t} className="rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1 text-xs font-medium text-cyan-100/80">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
            <Magnetic>
              <button type="button" onClick={() => navigate(detail)} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:border-cyan-300/50 hover:text-cyan-100">
                View Event <ArrowRight className="h-4 w-4" />
              </button>
            </Magnetic>
            <Magnetic>
              <button type="button" onClick={() => navigate(register)} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 to-amber-200 px-6 py-3 text-sm font-bold text-[#050816]">
                Book Now <ArrowRight className="h-4 w-4" />
              </button>
            </Magnetic>
          </div>
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