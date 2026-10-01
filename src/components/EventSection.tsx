import { motion } from "framer-motion";
import { ArrowUpRight, Lock, Fingerprint, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { upcomingEvents, pastEvents } from "../data/events";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { InterstellarInteractiveCard } from "./InterstellarInteractiveCard";

function SecretTeaser() {
  const navigate = useNavigate();
  return (
    <motion.button
      type="button"
      onClick={() => navigate("/transmission")}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="group relative flex w-full flex-col justify-between gap-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[#070b1d] p-7 text-left shadow-card-hover sm:p-8 lg:flex-row lg:items-center lg:p-10"
      aria-label="Open the secret event"
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
            <Lock className="h-3.5 w-3.5" /> CLASSIFIED
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold tracking-widest text-amber-200">
            <Fingerprint className="h-3.5 w-3.5" /> EPISODE 02 · SECOND EVENT
          </span>
        </span>
        <span className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          SECRET EVENT
        </span>
        <span className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">
          A classified SciSpace transmission is inbound. Signal locked — tap to decrypt. Details unlock only inside.
        </span>
      </span>
      <span className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 to-amber-200 px-7 py-3.5 text-sm font-bold text-[#050816] shadow-lg shadow-cyan-500/20 transition group-hover:brightness-110">
        Decrypt Transmission <ChevronRight className="h-4 w-4" />
      </span>
    </motion.button>
  );
}

export function EventSection() {
  const secret = upcomingEvents.find((e) => e.id === "qconnect-secret") ?? upcomingEvents[0];
  const pastInterstellar = pastEvents.find((e) => e.id === "research-reels-ep01");
  if (!pastInterstellar && !secret) return null;

  return (
    <section id="events" className="relative bg-brand-canvas py-16 md:py-24">
      <div className="container-site">
        <SectionHeading
          eyebrow="Events"
          title={
            <>
              Past <span className="text-gradient-brand">completed</span> & next <span className="text-gradient-brand">secret</span>
            </>
          }
          subtitle="Interstellar — Completed. Our second event is locked as a classified transmission."
        />

        <div className="mt-10 flex flex-col gap-6 md:gap-8">
          {pastInterstellar && (
            <Reveal delay={0.08} className="w-full">
              <InterstellarInteractiveCard />
            </Reveal>
          )}

          {secret && (
            <Reveal delay={0.14} className="w-full">
              <SecretTeaser />
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
