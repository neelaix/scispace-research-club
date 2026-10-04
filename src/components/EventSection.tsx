import { motion } from "framer-motion";
import { ArrowUpRight, Atom, ChevronRight, FlaskConical } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { upcomingEvents, pastEvents } from "../data/events";
import { QCONNECT } from "../config/qconnect";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { InterstellarInteractiveCard } from "./InterstellarInteractiveCard";

function QConnectOpenCard() {
  const navigate = useNavigate();
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="group relative flex w-full flex-col justify-between gap-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[#070b1d] p-7 text-left shadow-card-hover sm:p-8 lg:flex-row lg:items-center lg:p-10"
      aria-label="Q-Connect 2026 — our second event, open for registration"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(640px 300px at 10% 0%, rgba(34,211,238,0.22), transparent 60%), radial-gradient(560px 300px at 95% 100%, rgba(212,175,55,0.16), transparent 60%), linear-gradient(160deg, #070b1d, #0b1230 55%, #120b2e)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,197,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(148,197,255,0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <span className="relative flex flex-1 flex-col">
        <span className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold tracking-widest text-cyan-200">
            <Atom className="h-3.5 w-3.5" /> EPISODE 02 · SECOND EVENT
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold tracking-widest text-amber-200">
            <FlaskConical className="h-3.5 w-3.5" /> RESEARCH-FOCUSED · QUANTUM COMPUTING
          </span>
        </span>
        <span className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Q-Connect 2026
        </span>
        <span className="mt-1 font-display text-sm font-semibold tracking-wide text-cyan-100/90">
          {QCONNECT.TAGLINE} · {QCONNECT.SUBTITLE}
        </span>
        <span className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">
          Our 2nd event — a research-focused session on quantum computing and the Reference Quantum Computer at {QCONNECT.EVENT_VENUE}. {QCONNECT.EVENT_DATE} · {QCONNECT.EVENT_TIME} · ₹{QCONNECT.TICKET_PRICE}/person · {QCONNECT.MAX_PARTICIPANTS} seats.
        </span>
      </span>
      <span className="relative flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
        <button
          type="button"
          onClick={() => navigate(QCONNECT.EVENT_PATH)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:border-cyan-300/50 hover:text-cyan-100"
        >
          View Event <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => navigate(`${QCONNECT.EVENT_PATH}/register`)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 to-amber-200 px-7 py-3.5 text-sm font-bold text-[#050816] shadow-lg shadow-cyan-500/20 transition hover:brightness-110"
        >
          Book Now · ₹{QCONNECT.TICKET_PRICE} <ChevronRight className="h-4 w-4" />
        </button>
      </span>
    </motion.div>
  );
}

export function EventSection() {
  const upcoming = upcomingEvents.find((e) => e.id === "qconnect-2026") ?? upcomingEvents[0];
  const pastInterstellar = pastEvents.find((e) => e.id === "research-reels-ep01");
  if (!pastInterstellar && !upcoming) return null;

  return (
    <section id="events" className="relative bg-brand-canvas py-16 md:py-24">
      <div className="container-site">
        <SectionHeading
          eyebrow="Events"
          title={
            <>
              Past <span className="text-gradient-brand">completed</span> & upcoming <span className="text-gradient-brand">research</span>
            </>
          }
          subtitle="Interstellar — Completed. Q-Connect 2026 — our second event, a research-focused deep-dive into quantum computing."
        />

        <div className="mt-10 flex flex-col gap-6 md:gap-8">
          {pastInterstellar && (
            <Reveal delay={0.08} className="w-full">
              <InterstellarInteractiveCard />
            </Reveal>
          )}

          {upcoming && (
            <Reveal delay={0.14} className="w-full">
              <QConnectOpenCard />
            </Reveal>
          )}
        </div>

        <Reveal delay={0.18} className="mt-8 text-center">
          <Link
            to="/events"
            className="group inline-flex items-center gap-2 font-semibold text-brand-blue-dark transition-colors hover:text-brand-orange-dark"
          >
            See all events &amp; initiatives
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
