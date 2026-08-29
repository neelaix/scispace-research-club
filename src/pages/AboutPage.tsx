import { Crown, Globe2, Lightbulb, Rocket, Target } from "lucide-react";
import { motion } from "framer-motion";
import { config } from "../config/config";
import { Layout } from "../components/Layout";
import { PageHero } from "../components/PageHero";
import { PhilosophySection } from "../components/PhilosophySection";
import { JoinSection } from "../components/JoinSection";
import { SectionHeading } from "../components/SectionHeading";
import { Reveal, Stagger, itemVariants } from "../components/Reveal";

const columns = [
  {
    icon: Rocket,
    title: "Who we are",
    body: "SciSpace is a student-driven research and technology community at VIT-AP University. We are researchers, writers, designers, organizers and learners who believe that the most interesting work happens when curiosity leads.",
  },
  {
    icon: Lightbulb,
    title: "What we believe",
    body: "Curiosity matters more than prior experience. Research isn't something you have to be 'ready' for — it's something you grow into, and we build the environment to do exactly that.",
  },
  {
    icon: Target,
    title: "What we do",
    body: "We run research-oriented events, workshops, paper discussions and technical explorations, publish what we learn, and support student-led projects from first idea to final output.",
  },
  {
    icon: Globe2,
    title: "Why SciSpace exists",
    body: "To create a strong student research ecosystem at VIT-AP — one where curiosity becomes research, research becomes innovation, and innovation creates meaningful impact that extends beyond campus.",
  },
];

const audience = [
  {
    label: "Already exploring",
    text: "Students with research or technical experience get collaborators, structure and a platform to go further.",
  },
  {
    label: "Getting started",
    text: "Students who are simply curious get guidance, resources and a community that starts from zero with them.",
  },
];

export function AboutPage() {
  return (
    <Layout>
      <PageHero
        eyebrow={`About · ${config.INSTITUTION}`}
        title={
          <>
            The science of{" "}
            <span className="text-gradient-brand">what's possible</span>
          </>
        }
        subtitle={`${config.CLUB_NAME_FULL} is a student community where research, AI and emerging technology come together — and where curiosity is the only prerequisite.`}
      />

      {/* What / why columns */}
      <section className="bg-white py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="The basics"
            title="A community with purpose"
            align="left"
          />
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2">
            {columns.map((c) => (
              <motion.div
                key={c.title}
                variants={itemVariants}
                className="card-surface group flex flex-col gap-4 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-blue/12 text-brand-blue-dark transition-colors group-hover:bg-brand-orange/12 group-hover:text-brand-orange-dark">
                  <c.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="font-display text-xl font-semibold text-brand-dark">
                  {c.title}
                </h3>
                <p className="text-sm leading-relaxed text-brand-dark/65">
                  {c.body}
                </p>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Audience */}
      <section className="bg-brand-canvas py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="Who it's for"
            title={
              <>
                Two journeys,{" "}
                <span className="text-gradient-brand">one community</span>
              </>
            }
            subtitle="Whatever your starting point, the door to SciSpace is open."
          />
          <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-2">
            {audience.map((a, i) => (
              <Reveal key={a.label} delay={i * 0.08}>
                <div className="rounded-2xl border border-brand-dark/8 bg-white p-7 shadow-card">
                  <span className="font-display text-sm font-semibold uppercase tracking-widest text-brand-orange">
                    {a.label}
                  </span>
                  <p className="mt-3 text-sm leading-relaxed text-brand-dark/65">
                    {a.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Founders — visible for new visitors */}
      <section className="bg-white py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="Founders"
            title={
              <>
                Meet the <span className="text-gradient-brand">founders</span>
              </>
            }
            subtitle="Manda Neelaksh and Mithinti Ramani founded SciSpace Research Club at VIT-AP University."
          />
          <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
            {[
              { name: "Manda Neelaksh", initials: "MN", role: "Founder & Student Ambassador", note: "Founder • Student Ambassador" },
              { name: "Mithinti Ramani", initials: "MR", role: "Founder, Campus Ambassador & Star Student", note: "Founder • Campus Ambassador • Star Student" },
            ].map((f) => (
              <div
                key={f.name}
                className="group relative flex flex-col items-center gap-4 rounded-3xl border border-brand-dark/8 bg-brand-canvas p-8 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <span className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-brand-orange/12 text-brand-orange">
                  <Crown className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="grid h-24 w-24 place-items-center rounded-3xl bg-brand-dark text-white shadow-card">
                  <span className="font-display text-2xl font-bold">{f.initials}</span>
                </span>
                <div>
                  <p className="inline-flex flex-wrap justify-center rounded-full bg-brand-orange px-3 py-1 text-center text-xs font-bold uppercase tracking-widest text-white">{f.role}</p>
                  <h3 className="mt-3 font-display text-xl font-bold text-brand-dark">{f.name}</h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-widest text-brand-dark/50">{f.note}</p>
                  <a href="mailto:spaceresearch.club@vitap.ac.in" className="mt-3 inline-flex text-xs font-semibold text-brand-blue-dark underline decoration-brand-blue/20 underline-offset-4 hover:text-brand-orange-dark">
                    spaceresearch.club@vitap.ac.in
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PhilosophySection />
      <JoinSection />
    </Layout>
  );
}