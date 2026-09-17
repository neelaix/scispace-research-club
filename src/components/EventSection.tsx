import { ArrowUpRight, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { upcomingEvents, pastEvents } from "../data/events";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { InterstellarInteractiveCard } from "./InterstellarInteractiveCard";

export function EventSection() {
  const secret = upcomingEvents[0];
  const pastInterstellar = pastEvents.find((e) => e.id === "research-reels-ep01");
  if (!pastInterstellar && !secret) return null;

  return (
    <section id="events" className="relative bg-brand-canvas py-24 md:py-32">
      <div className="container-site">
        <SectionHeading
          eyebrow="Research Reels"
          title={
            <>
              Past <span className="text-gradient-brand">completed</span> & next <span className="text-gradient-brand">secret</span>
            </>
          }
          subtitle="510 students joined Interstellar — Completed. Next transmission is locked as secret."
        />

        <div className="mt-12 flex flex-col gap-8">
          {pastInterstellar && (
            <Reveal delay={0.1} className="w-full">
              <InterstellarInteractiveCard />
            </Reveal>
          )}

          {secret && (
            <Reveal delay={0.18} className="w-full">
              <div className="relative flex w-full flex-col justify-between overflow-hidden rounded-[2rem] border border-brand-dark/8 bg-white shadow-card lg:flex-row lg:items-center">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-mist via-white to-brand-canvas" aria-hidden="true" />
                <div className="absolute inset-0 opacity-[0.04]" aria-hidden="true" style={{ backgroundImage: "linear-gradient(rgba(42,42,52,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(42,42,52,0.8) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
                <div className="relative flex flex-1 flex-col p-7 sm:p-8 lg:p-9">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-dark px-3 py-1 text-xs font-semibold tracking-wide text-white">
                      <Lock className="h-3.5 w-3.5" /> {secret.series}
                    </span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">Secret</span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">{secret.title}</h3>
                  <p className="mt-1.5 text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">{secret.badge}</p>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-brand-dark/60">{secret.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {secret.tags.map((t) => (
                      <span key={t} className="rounded-full bg-brand-dark/5 px-3 py-1 text-xs font-medium text-brand-dark/70 ring-1 ring-brand-dark/5">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="relative p-7 pt-0 sm:p-8 sm:pt-0 lg:p-9 lg:pl-0 lg:pt-9">
                  <span className="inline-flex whitespace-nowrap items-center justify-center gap-2 rounded-full bg-brand-dark/5 px-6 py-3.5 text-sm font-semibold text-brand-dark/40 ring-1 ring-brand-dark/10">
                    <Lock className="h-4 w-4" /> Locked — Reveal Soon
                  </span>
                </div>
              </div>
            </Reveal>
          )}
        </div>

        <Reveal delay={0.2} className="mt-10 text-center">
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