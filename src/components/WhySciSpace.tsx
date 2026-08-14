import {
  FlaskConical,
  GraduationCap,
  Users,
  Lightbulb,
  Newspaper,
  Compass,
} from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeading } from "./SectionHeading";
import { Stagger, itemVariants } from "./Reveal";

const reasons = [
  {
    icon: FlaskConical,
    title: "Do real research",
    body: "Explore questions beyond the syllabus with structured guidance and a community that takes research seriously.",
  },
  {
    icon: GraduationCap,
    title: "Build skills that matter",
    body: "AI, ML, technical writing, public speaking, design and event management — learn by doing, not by watching.",
  },
  {
    icon: Users,
    title: "Collaborate with peers",
    body: "Work alongside researchers, developers, designers and communicators on shared experiments and projects.",
  },
  {
    icon: Lightbulb,
    title: "Ship student projects",
    body: "Turn ideas into prototypes, demos and documented work that live on long after the semester ends.",
  },
  {
    icon: Newspaper,
    title: "Learn to communicate research",
    body: "Papers, articles, talks and reels — practice turning technical work into something everyone can understand.",
  },
  {
    icon: Compass,
    title: "Connect beyond campus",
    body: "Through outreach, partnerships and collaborations with researchers and organizations as we grow.",
  },
];

export function WhySciSpace() {
  return (
    <section id="why" className="relative bg-white py-24 md:py-32">
      <div className="container-site">
        <SectionHeading
          eyebrow="Why SciSpace"
          title={
            <>
              What you get when you{" "}
              <span className="text-gradient-brand">join</span>
            </>
          }
          subtitle="Whether you're an experienced researcher or simply curious, SciSpace is designed to help you grow."
        />

        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r) => (
            <motion.div
              key={r.title}
              variants={itemVariants}
              className="card-surface group p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-blue/12 text-brand-blue-dark transition-colors duration-300 group-hover:bg-brand-orange/15 group-hover:text-brand-orange-dark">
                <r.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-brand-dark">
                {r.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-dark/60">
                {r.body}
              </p>
            </motion.div>
          ))}
        </Stagger>

        <p className="mt-10 text-center text-sm text-brand-dark/55">
          No title, no prerequisite, no prior experience required —{" "}
          <span className="font-semibold text-brand-dark">only curiosity.</span>
        </p>
      </div>
    </section>
  );
}