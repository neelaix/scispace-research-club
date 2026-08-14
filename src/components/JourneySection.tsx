import { motion, useReducedMotion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { journeySteps } from "../data/journey";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { Link } from "react-router-dom";

const statusMeta: Record<
  string,
  { label: string; cls: string; Icon: typeof Check }
> = {
  done: { label: "Done", cls: "bg-brand-blue/12 text-brand-blue-dark", Icon: Check },
  active: {
    label: "In progress",
    cls: "bg-brand-orange/12 text-brand-orange-dark",
    Icon: Loader2,
  },
  planned: { label: "Planned", cls: "bg-brand-dark/8 text-brand-dark/70", Icon: Sparkles },
};

export function JourneySection() {
  const reduce = useReducedMotion();
  return (
    <section id="journey" className="relative bg-white py-24 md:py-32">
      <div className="container-site">
        <SectionHeading
          eyebrow="Our journey"
          title={
            <>
              What we've been <span className="text-gradient-brand">building</span>
            </>
          }
          subtitle="SciSpace is young but moving fast. Here is the foundation we've laid — and what's launching next."
        />

        <div className="relative mt-16">
          {/* vertical spine */}
          <div
            aria-hidden="true"
            className="absolute left-[22px] top-2 bottom-2 w-px bg-gradient-to-b from-brand-blue via-brand-blue/50 to-brand-orange md:left-[222px]"
          />

          <ol className="space-y-12">
            {journeySteps.map((step, i) => {
              const meta = statusMeta[step.status];
              return (
                <li key={step.id} className="relative pl-16 md:pl-72">
                  <motion.div
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.7, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-start gap-5"
                  >
                    <span className="absolute left-0 top-0 grid h-11 w-11 place-items-center rounded-full bg-white shadow-card ring-1 ring-brand-dark/10 md:left-[182px] md:top-1">
                      <step.icon className="h-5 w-5 text-brand-blue-dark" aria-hidden="true" />
                    </span>

                    <div className="w-full rounded-2xl border border-brand-dark/5 bg-brand-canvas p-6 transition-all duration-300 hover:border-brand-blue/30 hover:bg-white hover:shadow-card">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs uppercase tracking-widest text-brand-dark/40">
                          {step.phase}
                        </span>
                        <span className={`chip ${step.status === "done" ? "bg-brand-blue/12 text-brand-blue-dark" : step.status === "active" ? "bg-brand-orange/12 text-brand-orange-dark" : "bg-brand-dark/8 text-brand-dark/60"}`}>
                          <meta.Icon className="h-3.5 w-3.5" aria-hidden="true" />
                          {meta.label}
                        </span>
                      </div>
                      <h3 className="mt-3 font-display text-xl font-semibold text-brand-dark">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-brand-dark/65">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                </li>
              );
            })}
          </ol>
        </div>

        <Reveal delay={0.2} className="mt-14 text-center">
          <p className="text-sm text-brand-dark/55">
            See the full picture on the{" "}
            <Link to="/about" className="font-semibold text-brand-blue-dark underline decoration-brand-blue/40 underline-offset-4 hover:text-brand-orange-dark">
              About page
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}