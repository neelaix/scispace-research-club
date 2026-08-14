import { ArrowRight, ClipboardCheck, MessagesSquare, PartyPopper, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { config } from "../config/config";
import { openExternal } from "../lib/open";
import { Layout } from "../components/Layout";
import { PageHero } from "../components/PageHero";
import { JoinSection } from "../components/JoinSection";
import { SectionHeading } from "../components/SectionHeading";
import { Reveal, Stagger, itemVariants } from "../components/Reveal";
import { Magnetic } from "../components/Magnetic";

const profiles = [
  "researcher",
  "developer",
  "designer",
  "writer",
  "organizer",
  "communicator",
];

const steps = [
  {
    icon: ClipboardCheck,
    title: "Tell us about you",
    body: "Share your interests and what you'd love to explore through our form.",
  },
  {
    icon: MessagesSquare,
    title: "We find your fit",
    body: "Our team reviews responses and helps place you where your strengths shine.",
  },
  {
    icon: PartyPopper,
    title: "Welcome to SciSpace",
    body: "You join the community and start doing — events, projects and research.",
  },
];

export function JoinPage() {
  return (
    <Layout>
      <PageHero
        eyebrow={`Join · ${config.CLUB_NAME_FULL}`}
        title={
          <>
            Want to be part of{" "}
            <span className="text-gradient-brand">SciSpace?</span>
          </>
        }
        subtitle="Whether you're a researcher, developer, designer, writer, organizer, communicator, or simply someone curious about technology — there is a place for you at SciSpace."
      />

      {/* Profiles strip */}
      <section className="bg-white py-20">
        <div className="container-site">
          <SectionHeading
            eyebrow="Anyone can join"
            title="Whatever you bring, it fits"
            subtitle="Curiosity is the only requirement."
          />
          <Stagger className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-3">
            {profiles.map((p, i) => (
              <motion.span
                key={p}
                variants={itemVariants}
                className={`rounded-full px-6 py-3 font-display text-sm font-semibold tracking-wide ${
                  i % 2 === 0
                    ? "bg-brand-blue/12 text-brand-blue-dark"
                    : "bg-brand-orange/12 text-brand-orange-dark"
                }`}
              >
                {p}
              </motion.span>
            ))}
            <motion.span
              variants={itemVariants}
              className="rounded-full bg-brand-dark px-6 py-3 font-display text-sm font-semibold tracking-wide text-white"
            >
              or simply curious
            </motion.span>
          </Stagger>

          <Reveal delay={0.1} className="mt-14 text-center">
            <Magnetic>
              <button
                type="button"
                onClick={() => openExternal(config.GOOGLE_FORM_URL, "Join form not yet available. Update GOOGLE_FORM_URL in config.ts.")}
                className="btn-accent px-10 py-4 text-base"
              >
                Join SciSpace <ArrowRight className="h-5 w-5" />
              </button>
            </Magnetic>
            <p className="mt-4 text-xs uppercase tracking-widest text-brand-dark/40">
              Opens in a new tab · {config.INSTITUTION} students
            </p>
          </Reveal>
        </div>
      </section>

      {/* After joining */}
      <section className="bg-brand-mist py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="What happens next"
            title={
              <>
                From sign-up to <span className="text-gradient-brand">set-up</span>
              </>
            }
          />
          <Stagger className="mt-14 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                variants={itemVariants}
                className="card-surface relative flex flex-col gap-4 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <span className="absolute right-6 top-6 font-mono text-sm text-brand-dark/25">
                  0{i + 1}
                </span>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-blue/12 text-brand-blue-dark">
                  <s.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="font-display text-lg font-semibold text-brand-dark">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-brand-dark/60">{s.body}</p>
              </motion.div>
            ))}
          </Stagger>

          <Reveal delay={0.1} className="mt-12 text-center">
            <p className="inline-flex items-center gap-2 text-sm text-brand-dark/55">
              <Sparkles className="h-4 w-4 text-brand-orange" aria-hidden="true" />
              No prior experience. No title. No barrier — just a desire to learn.
            </p>
          </Reveal>
        </div>
      </section>

      <JoinSection />
    </Layout>
  );
}