import { ArrowUpRight, Hourglass } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { researchCategories } from "../data/research";
import { SectionHeading } from "./SectionHeading";
import { Reveal, Stagger, itemVariants } from "./Reveal";

export function ResearchSection() {
  return (
    <section id="research-home" className="relative overflow-hidden bg-brand-mist py-24 md:py-32">
      <div aria-hidden="true" className="absolute inset-0 bg-brand-soft" />
      <div className="container-site relative z-10">
        <SectionHeading
          eyebrow="Research focus"
          title={
            <>
              A research side of the club that's{" "}
              <span className="text-gradient-brand">taking shape</span>
            </>
          }
          subtitle="We don't fake progress. These areas are being built right now — real content lands here as soon as it exists."
        />

        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {researchCategories.map((cat) => (
            <motion.div
              key={cat.id}
              variants={itemVariants}
              className="card-surface group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <span
                aria-hidden="true"
                className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-orange/8 transition-transform duration-500 group-hover:scale-125"
              />
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-blue/12 text-brand-blue-dark">
                  <cat.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="chip bg-brand-dark/5 text-brand-dark/55">
                  <Hourglass className="h-3.5 w-3.5" aria-hidden="true" />
                  Coming soon
                </span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-brand-dark">
                {cat.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-dark/60">
                {cat.short}
              </p>
            </motion.div>
          ))}
        </Stagger>

        <Reveal delay={0.15} className="mt-12 text-center">
          <Link
            to="/research"
            className="group inline-flex items-center gap-2 rounded-full border border-brand-dark/12 bg-white px-7 py-3 text-sm font-semibold text-brand-dark transition-colors hover:border-brand-blue/50 hover:text-brand-blue-dark"
          >
            Explore our research roadmap
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}