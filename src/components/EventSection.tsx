import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { upcomingEvents } from "../data/events";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { EventCard } from "./EventCard";

export function EventSection() {
  const featured = upcomingEvents[0];
  if (!featured) return null;

  return (
    <section id="events" className="relative bg-brand-canvas py-24 md:py-32">
      <div className="container-site">
        <SectionHeading
          eyebrow="Featured event"
          title={
            <>
              Up next — <span className="text-gradient-brand">Research Reels</span>
            </>
          }
          subtitle="Movie screenings with a research lens: watch, discuss and dig into the science behind the story."
        />

        <Reveal delay={0.1} className="mt-12">
          <EventCard event={featured} />
        </Reveal>

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