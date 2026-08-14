import { ArrowRight, Clapperboard, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { config } from "../config/config";
import { openExternal } from "../lib/open";
import type { ClubEvent } from "../data/events";
import { Magnetic } from "./Magnetic";

export function EventCard({ event }: { event: ClubEvent }) {
  const navigate = useNavigate();
  const registerUrl = event.registerUrl || config.GOOGLE_FORM_URL;
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
              onClick={() => openExternal(registerUrl, "Register form not yet available. Update the event's registerUrl or GOOGLE_FORM_URL in config.ts.")}
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