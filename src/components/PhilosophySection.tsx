import { motion, useReducedMotion } from "framer-motion";

const steps = [
  {
    word: "EXPLORE.",
    meaning: "Discover new questions.",
    hint: "From the literature to the unknown.",
  },
  {
    word: "RESEARCH.",
    meaning: "Turn curiosity into knowledge.",
    hint: "Read, question, experiment, and document.",
  },
  {
    word: "INNOVATE.",
    meaning: "Build solutions and experiment with ideas.",
    hint: "Prototype, iterate and ship what you learn.",
  },
  {
    word: "IMPACT.",
    meaning: "Create something meaningful.",
    hint: "Share it, publish it, and let it travel further than you.",
  },
];

export function PhilosophySection() {
  const reduce = useReducedMotion();
  return (
    <section id="philosophy" className="relative overflow-hidden bg-brand-dark py-24 text-white md:py-36">
      <div aria-hidden="true" className="absolute inset-0 bg-brand-soft opacity-80" />
      {/* faint grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div className="container-site relative z-10">
        <motion.p
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="eyebrow bg-white/10 text-brand-blue"
        >
          Core philosophy
        </motion.p>
        <motion.h2
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white/90 sm:text-4xl md:text-5xl"
        >
          Everything we do hangs on one simple loop.
        </motion.h2>

        <div className="mt-16 space-y-4">
          {steps.map((s, i) => {
            const accent = i % 2 === 0 ? "text-brand-blue" : "text-brand-orange";
            return (
              <motion.div
                key={s.word}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 48, x: i % 2 ? 40 : -40 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="group flex flex-col gap-2 border-t border-white/10 py-8 md:flex-row md:items-baseline md:gap-10 md:py-10"
              >
                <span className="w-20 shrink-0 font-mono text-sm text-white/40">
                  0{i + 1}
                </span>
                <h3
                  className={`font-display text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-[6.5rem] ${accent} transition-transform duration-500 group-hover:translate-x-2`}
                >
                  {s.word}
                </h3>
                <div className="md:ml-auto md:max-w-xs md:text-right">
                  <p className={`text-lg font-medium leading-snug ${i % 2 ? "text-white/85" : "text-white/85"}`}>
                    {s.meaning}
                  </p>
                  <p className="mt-1.5 text-sm text-white/45">{s.hint}</p>
                </div>
              </motion.div>
            );
          })}
          <div className="border-t border-white/10" />
        </div>
      </div>
    </section>
  );
}