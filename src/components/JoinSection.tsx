import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { config } from "../config/config";
import { Magnetic } from "./Magnetic";
import { Reveal } from "./Reveal";

export function JoinSection() {
  const navigate = useNavigate();
  return (
    <section id="join" className="relative overflow-hidden bg-brand-dark py-24 text-white md:py-36">
      <div aria-hidden="true" className="absolute inset-0 bg-brand-soft opacity-90" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="container-site relative z-10 text-center">
        <Reveal>
          <span className="eyebrow mx-auto bg-white/10 text-brand-orange">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Join the community
          </span>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="mx-auto mt-6 max-w-4xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            YOUR CURIOSITY HAS{" "}
            <span className="text-gradient-brand">A PLACE HERE.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
            Whether you want to investigate a research question, experiment with
            AI, write about technology, design something meaningful, organize an
            event, build partnerships, or simply learn —{" "}
            <span className="font-semibold text-white">
              SciSpace is where you can start.
            </span>
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Magnetic>
              <button
                type="button"
                onClick={() => navigate("/join")}
                className="btn-accent px-9 py-4 text-base shadow-[0_16px_44px_-12px_rgba(253,128,44,0.65)]"
              >
                Join SciSpace <ArrowRight className="h-5 w-5" />
              </button>
            </Magnetic>
            <span className="text-sm text-white/45">
              {config.INSTITUTION} students · no prior experience needed
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}