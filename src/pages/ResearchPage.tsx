import { ArrowRight, Hourglass, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { PageHero } from "../components/PageHero";
import { JoinSection } from "../components/JoinSection";
import { SectionHeading } from "../components/SectionHeading";
import { Stagger, itemVariants, Reveal } from "../components/Reveal";
import { researchCategories } from "../data/research";

const pipeline = [
  { step: "Question", note: "Start with genuine curiosity — no answer required." },
  { step: "Investigate", note: "Read, run experiments, and learn the methods." },
  { step: "Build", note: "Prototype, iterate and turn findings into work." },
  { step: "Share", note: "Publish, present and teach what you discovered." },
];

export function ResearchPage() {
  return (
    <Layout>
      <PageHero
        eyebrow="Research · The core of SciSpace"
        title={
          <>
            A place where{" "}
            <span className="text-gradient-brand">curiosity becomes research</span>
          </>
        }
        subtitle="Research at SciSpace is practical, student-led and honest. Below are the areas we're building — each will publish real content as it comes to life."
      />

      {/* Categories */}
      <section className="bg-white py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="Focus areas"
            title="Where we'll dig in"
            subtitle="None of this is pretend. Each area is actively taking shape and will publish work here the moment it's real."
          />

          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {researchCategories.map((cat) => (
              <motion.div
                key={cat.id}
                variants={itemVariants}
                className="card-surface group relative flex flex-col overflow-hidden p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <span
                  aria-hidden="true"
                  className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-brand-blue/10 transition-transform duration-500 group-hover:scale-125"
                />
                <span className="grid h-[52px] w-[52px] place-items-center rounded-2xl bg-brand-blue/12 text-brand-blue-dark">
                  <cat.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-brand-dark">
                  {cat.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-dark/65">
                  {cat.short}
                </p>
                <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-orange/12 px-3.5 py-1.5 text-xs font-semibold text-brand-orange-dark">
                  <Hourglass className="h-3.5 w-3.5" aria-hidden="true" />
                  Coming soon
                </span>
              </motion.div>
            ))}
          </Stagger>

          <Reveal delay={0.12} className="mt-10">
            <div className="flex items-start gap-3 rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue-dark" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-brand-dark/70">
                <span className="font-semibold text-brand-dark">A note on accuracy:</span>{" "}
                we will never publish fabricated papers, projects or achievements.
                Sections marked "Coming soon" exist exactly because the work
                behind them is still being done.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pipeline */}
      <section className="bg-brand-dark py-24 text-white">
        <div className="container-site">
          <SectionHeading
            eyebrow="How it works"
            title={
              <>
                From question to{" "}
                <span className="text-gradient-brand">impact</span>
              </>
            }
            light
            subtitle="A simple loop we apply to everything we explore."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pipeline.map((p, i) => (
              <Reveal key={p.step} delay={i * 0.08}>
                <div className="relative h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-brand-blue/40">
                  <span className="font-mono text-sm text-brand-orange">
                    0{i + 1}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold">
                    {p.step}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">
                    {p.note}
                  </p>
                  {i < pipeline.length - 1 && (
                    <ArrowRight
                      className="absolute -right-3.5 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-brand-blue/70 lg:block"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20">
        <div className="container-site text-center">
          <h2 className="font-display text-2xl font-semibold text-brand-dark md:text-3xl">
            Want to be part of this research from day one?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-dark/60">
            The Research and AI &amp; Technology teams are the fastest way to
            start doing real work — join SciSpace and find your lab.
          </p>
          <Link
            to="/join"
            className="btn-accent mt-7 inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white"
          >
            Join SciSpace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <JoinSection />
    </Layout>
  );
}