import { ArrowRight, CalendarX2, Hourglass, Layers, Ticket, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { PageHero } from "../components/PageHero";
import { EventCard } from "../components/EventCard";
import { JoinSection } from "../components/JoinSection";
import { SectionHeading } from "../components/SectionHeading";
import { Reveal, Stagger, itemVariants } from "../components/Reveal";
import { upcomingEvents, ongoingInitiatives, pastEvents } from "../data/events";
import type { ClubEvent } from "../data/events";

function InitiativeCard({ event }: { event: ClubEvent }) {
  return (
    <motion.div
      variants={itemVariants}
      className="card-surface group flex flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="chip bg-brand-orange/12 text-brand-orange-dark">
          <Hourglass className="h-3.5 w-3.5" aria-hidden="true" />
          {event.badge ?? "In progress"}
        </span>
        <span className="font-mono text-xs uppercase tracking-widest text-brand-dark/35">
          {event.series}
        </span>
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-brand-dark">
        {event.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-dark/65">
        {event.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {event.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-medium text-brand-blue-dark"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export function EventsPage() {
  const featured = upcomingEvents[0];

  return (
    <Layout>
      <PageHero
        eyebrow="Events · Research Reels & beyond"
        title={
          <>
            Where research meets{" "}
            <span className="text-gradient-brand">real experience</span>
          </>
        }
        subtitle="Screenings, talks, workshops and discussions — every SciSpace event is designed to move you from watching to thinking, and from thinking to doing."
      />

      {/* Upcoming */}
      <section className="bg-white py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="Upcoming"
            title="What's launching soon"
            subtitle="Planned, not fabricated — we list an event only when it's real."
            align="left"
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {upcomingEvents.map((ev) => (
              <Reveal key={ev.id}>
                <EventCard event={ev} />
              </Reveal>
            ))}
          </div>

          {featured && featured.title === "Interstellar" && (
            <Reveal delay={0.08} className="mt-8">
              <div className="rounded-3xl border border-brand-dark/10 bg-white p-7 shadow-card md:p-8">
                <div className="flex items-center gap-3">
                  <Ticket className="h-5 w-5 text-brand-orange" />
                  <h3 className="font-display text-lg font-semibold text-brand-dark">Ticketing — Interstellar</h3>
                  <span className="chip bg-brand-dark text-white">₹25 per person</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-brand-dark/60">
                  Paid event — No discounted group ticket. Group booking means one booking can contain multiple attendees. Pricing: 1=₹25 · 2=₹50 · 3=₹75 · 5=₹125 · 10=₹250. Formula: <span className="font-mono font-semibold">TOTAL = ATTENDEES × ₹25</span>. General Admission · Open Seating — Choose any available seat at the venue. No seat map, no seat numbers, no reserved seating, no attendee limit.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="chip bg-emerald-100 text-emerald-700"><Info className="h-3.5 w-3.5" /> Open Seating</span>
                  <span className="chip bg-brand-blue/10 text-brand-blue-dark">General Admission</span>
                </div>
                <Link to="/booking" className="btn-accent mt-6 inline-flex px-6 py-3 text-sm">
                  Book Tickets — Interstellar <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          )}

          {featured && featured.themes && (
            <Reveal delay={0.1} className="mt-8">
              <div className="rounded-3xl border border-brand-dark/8 bg-brand-canvas p-7 md:p-9">
                <div className="flex items-center gap-3">
                  <Layers className="h-5 w-5 text-brand-blue-dark" aria-hidden="true" />
                  <h3 className="font-display text-lg font-semibold text-brand-dark">
                    Discussion themes — {featured.title} ({featured.episode})
                  </h3>
                </div>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {featured.themes.map((t) => (
                    <li
                      key={t}
                      className="flex items-center gap-2.5 rounded-xl bg-white px-4 py-3 text-sm font-medium text-brand-dark/80 shadow-sm ring-1 ring-brand-dark/5"
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full bg-brand-orange" aria-hidden="true" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* Ongoing */}
      <section className="bg-brand-mist py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="Ongoing"
            title="Initiatives in motion"
            subtitle="The work that keeps the community moving between events."
            align="left"
          />
          <Stagger className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {ongoingInitiatives.map((ev) => (
              <InitiativeCard key={ev.id} event={ev} />
            ))}
          </Stagger>
        </div>
      </section>

      {/* Past */}
      <section className="bg-white py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="Past events"
            title="The archive"
            subtitle="We only record what actually happened. Our first events will appear here."
            align="left"
          />
          {pastEvents.length === 0 ? (
            <Reveal delay={0.08}>
              <div className="mt-10 grid place-items-center rounded-3xl border border-dashed border-brand-dark/15 bg-brand-canvas px-6 py-16 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-brand-dark/40 shadow-card">
                  <CalendarX2 className="h-7 w-7" aria-hidden="true" />
                </span>
                <p className="mt-5 font-display text-xl font-semibold text-brand-dark">
                  No past events yet
                </p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-brand-dark/60">
                  SciSpace is brand new. This archive fills up as we run our
                  first screenings, talks and workshops — watch this space.
                </p>
              </div>
            </Reveal>
          ) : (
            <Stagger className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((ev) => (
                <InitiativeCard key={ev.id} event={ev} />
              ))}
            </Stagger>
          )}
        </div>
      </section>

      {/* Organizer CTA */}
      <section className="bg-brand-canvas py-16">
        <div className="container-site">
          <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-brand-dark/8 bg-white p-8 text-center shadow-card md:flex-row md:text-left">
            <div>
              <h2 className="font-display text-2xl font-semibold text-brand-dark">
                Want to shape what we run next?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-brand-dark/60">
                Events &amp; Workshops, Design, Content, Marketing and Outreach
                teams all help design every SciSpace event. Join the team that
                makes it happen.
              </p>
            </div>
            <Link
              to="/join"
              className="btn-accent shrink-0 inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white"
            >
              Join the team <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <JoinSection />
    </Layout>
  );
}