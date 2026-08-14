import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
};

export function PageHero({ eyebrow, title, subtitle }: PageHeroProps) {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden bg-brand-mist pb-16 pt-36 md:pb-20 md:pt-44">
      <div aria-hidden="true" className="absolute inset-0 bg-brand-soft" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(42,42,52,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(42,42,52,0.8) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <div className="container-site relative z-10">
        <motion.span
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="eyebrow bg-white/80 text-brand-blue-dark ring-1 ring-brand-blue/25"
        >
          {eyebrow}
        </motion.span>
        <motion.h1
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 max-w-4xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-brand-dark sm:text-6xl"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-2xl text-base leading-relaxed text-brand-dark/65 md:text-lg"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}