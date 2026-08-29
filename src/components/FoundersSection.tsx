import { Crown, Mail } from "lucide-react";
import { founders } from "../data/founders";
import { SectionHeading } from "./SectionHeading";
import { Reveal, Stagger, itemVariants } from "./Reveal";
import { motion } from "framer-motion";

export function FoundersSection() {
  return (
    <section className="relative overflow-hidden bg-white py-24 md:py-28">
      <div className="container-site">
        <SectionHeading
          eyebrow="Founders"
          title={
            <>
              Built by founders, <span className="text-gradient-brand">for the curious</span>
            </>
          }
          subtitle="SciSpace Research Club was founded by students who wanted research to feel accessible from day one. Meet the founders."
        />

        <Stagger className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
          {founders.map((f) => (
            <motion.div
              key={f.id}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="group relative flex flex-col items-center gap-5 overflow-hidden rounded-3xl border border-brand-dark/8 bg-brand-canvas p-8 text-center shadow-card transition-all duration-300 hover:shadow-card-hover"
            >
              <span className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-brand-orange/12 text-brand-orange">
                <Crown className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="grid h-24 w-24 place-items-center rounded-3xl bg-brand-dark text-white shadow-card">
                <span className="font-display text-2xl font-bold tracking-tight">{f.initials}</span>
              </span>
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
                  <Crown className="h-3.5 w-3.5" aria-hidden="true" /> {f.role}
                </p>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-brand-dark">
                  {f.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-brand-dark/60">{f.note}</p>
              </div>
              <a
                href="mailto:spaceresearch.club@vitap.ac.in"
                className="inline-flex items-center gap-2 rounded-full border border-brand-dark/10 bg-white px-4 py-2 text-xs font-semibold text-brand-dark transition-colors hover:border-brand-blue/30 hover:text-brand-blue-dark"
              >
                <Mail className="h-3.5 w-3.5" aria-hidden="true" /> spaceresearch.club@vitap.ac.in
              </a>
            </motion.div>
          ))}
        </Stagger>

        <Reveal delay={0.15} className="mx-auto mt-8 max-w-4xl">
          <div className="rounded-2xl border border-brand-dark/8 bg-brand-dark px-6 py-4 text-center text-sm leading-relaxed text-white/70">
            Founded at <span className="font-semibold text-white">VIT-AP University</span> — SciSpace is student-driven, research-first, and open to everyone curious.
          </div>
        </Reveal>
      </div>
    </section>
  );
}
