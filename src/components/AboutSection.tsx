import { ArrowUpRight, Target, Sparkles, Layers, LifeBuoy } from "lucide-react";
import { motion } from "framer-motion";
import { config } from "../config/config";
import { SectionHeading } from "./SectionHeading";
import { Reveal, Stagger, itemVariants } from "./Reveal";
import { useNavigate } from "react-router-dom";

const pillars = [
  {
    icon: Layers,
    title: "Who we are",
    body: "A student-driven research and technology community at VIT-AP University. We move beyond classroom learning into real research, emerging technologies and experimentation.",
  },
  {
    icon: Sparkles,
    title: "What we believe",
    body: "Curiosity matters more than prior experience. Whether you already do research — or you're simply curious — there is a place for you here.",
  },
  {
    icon: Target,
    title: "What we do",
    body: "We run research events, workshops, paper discussions, technical explorations and student-led projects — while collaborating across communities.",
  },
  {
    icon: LifeBuoy,
    title: "Why SciSpace exists",
    body: "To build a strong student research ecosystem where curiosity becomes research, research becomes innovation, and innovation creates meaningful impact.",
  },
];

export function AboutSection() {
  const navigate = useNavigate();
  return (
    <section id="about" className="relative py-24 md:py-32">
      <div className="container-site">
        <SectionHeading
          eyebrow="About SciSpace"
          title={
            <>
              The official research club of{" "}
              <span className="text-gradient-brand">{config.INSTITUTION}</span>
            </>
          }
          subtitle="We bring together students who are curious about research, artificial intelligence and emerging technologies — and give them a place to explore, experiment and grow."
        />

        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <motion.div key={p.title} variants={itemVariants} className="card-surface group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
              <span
                aria-hidden="true"
                className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-blue/10 transition-transform duration-500 group-hover:scale-125"
              />
              <p.icon
                className="h-6 w-6 text-brand-blue-dark"
                aria-hidden="true"
              />
              <h3 className="mt-4 font-display text-lg font-semibold text-brand-dark">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-dark/60">
                {p.body}
              </p>
            </motion.div>
          ))}
        </Stagger>

        <Reveal delay={0.15} className="mt-14">
          <div className="relative overflow-hidden rounded-3xl bg-brand-dark p-8 text-white md:p-12">
            <div aria-hidden="true" className="absolute inset-0 bg-brand-soft opacity-70" />
            <div className="relative z-10 grid items-center gap-8 md:grid-cols-[1.5fr_auto]">
              <div>
                <h3 className="font-display text-2xl font-semibold md:text-3xl">
                  Two kinds of students find a home here.
                </h3>
                <p className="mt-3 max-w-2xl leading-relaxed text-white/70">
                  Researchers and builders with experience — and learners who
                  are simply curious. SciSpace is designed for both: one grows
                  their craft, the other discovers it.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/about")}
                className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-brand-orange/60 hover:text-brand-orange"
              >
                Learn more about us
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}