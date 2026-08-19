import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { config } from "../config/config";
import { AnimatedBackground } from "./AnimatedBackground";
import { Magnetic } from "./Magnetic";
import { scrollToId } from "../lib/scroll";

const marqueeWords = [
  "Research",
  "Artificial Intelligence",
  "AGI",
  "Machine Learning",
  "Emerging Technology",
  "Innovation",
  "Collaboration",
  "Knowledge Sharing",
  "Experimentation",
  "Impact",
];

export function Hero() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();

  const goJoin = () => navigate("/join");

  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* Background */}
      <div aria-hidden="true" className="absolute inset-0 bg-brand-mist" />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 520px at 12% -8%, rgba(117,193,217,0.28), transparent 60%), radial-gradient(900px 500px at 88% 8%, rgba(253,128,44,0.16), transparent 55%), linear-gradient(180deg, #f2fafd 0%, #f6f8fa 60%, #f6f8fa 100%)",
        }}
      />
      <AnimatedBackground />

      {/* Content */}
      <div className="container-site relative z-10 flex flex-1 flex-col items-center justify-center pb-10 pt-40 text-center sm:pt-44">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="eyebrow mb-7 bg-white/80 text-brand-blue-dark ring-1 ring-brand-blue/25 backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" aria-hidden="true" />
          Student research &amp; technology community
          <span className="hidden sm:inline"> · {config.INSTITUTION}</span>
        </motion.div>

        <motion.h1
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display leading-[0.9] tracking-tight"
        >
          <span className="block text-[19vw] font-bold text-brand-dark sm:text-8xl md:text-9xl">
            SCISPACE
          </span>
          <span className="mt-3 block text-[7.5vw] font-semibold uppercase tracking-[0.34em] text-brand-orange sm:text-xl md:text-2xl lg:text-3xl">
            Research Club
          </span>
        </motion.h1>

        <motion.p
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 font-display text-xl font-semibold tracking-tight text-brand-dark md:text-2xl"
        >
          <span className="text-brand-blue-dark">Explore.</span>{" "}
          <span className="text-brand-dark">Research.</span>{" "}
          <span className="text-brand-orange">Innovate.</span>{" "}
          <span className="text-brand-dark">Impact.</span>
        </motion.p>

        <motion.p
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 max-w-xl text-base leading-relaxed text-brand-dark/65 md:text-lg"
        >
          {config.SHORT_DESCRIPTION} A community where curiosity becomes
          research, research becomes innovation, and innovation creates impact.
        </motion.p>

        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Magnetic>
            <button
              type="button"
              onClick={() => scrollToId("about")}
              className="btn-primary px-7 py-3.5 text-base shadow-lg"
            >
              Explore SciSpace
              <ArrowRight className="h-5 w-5" />
            </button>
          </Magnetic>
          <button
            type="button"
            onClick={goJoin}
            className="btn-ghost px-7 py-3.5 text-base hover:border-brand-orange/60 hover:text-brand-orange-dark"
          >
            Join the Community
          </button>
        </motion.div>
      </div>

      {/* Marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="relative z-10 border-y border-brand-dark/5 bg-white/60 backdrop-blur-sm"
      >
        <div
          className="flex w-max animate-marquee items-center gap-8 py-3.5"
          aria-hidden="true"
        >
          {[...marqueeWords, ...marqueeWords].map((word, i) => (
            <span key={i} className="flex items-center gap-8 whitespace-nowrap">
              <span className="font-display text-sm font-medium uppercase tracking-[0.2em] text-brand-dark/55">
                {word}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-orange/70" />
            </span>
          ))}
        </div>
      </motion.div>

      {/* Scroll hint */}
      <div className="relative z-10 flex justify-center pb-8">
        <motion.button
          type="button"
          onClick={() => scrollToId("about")}
          aria-label="Scroll down"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="rounded-full p-2 text-brand-dark/50 transition-colors hover:text-brand-orange"
        >
          <ChevronDown className="h-6 w-6 animate-float-slow" />
        </motion.button>
      </div>
    </section>
  );
}