import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type SectionHeadingProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  light = false,
  className = "",
}: SectionHeadingProps) {
  const alignCls =
    align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <div className={`flex flex-col gap-4 ${alignCls} ${className}`}>
      <Reveal>
        <span
          className={`eyebrow ${
            light
              ? "bg-white/10 text-brand-blue"
              : "bg-brand-blue/10 text-brand-blue-dark"
          }`}
        >
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.05}>
        <h2
          className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight ${
            light ? "text-white" : "text-brand-dark"
          }`}
        >
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.1}>
          <p
            className={`max-w-2xl text-base sm:text-lg leading-relaxed ${
              light ? "text-white/65" : "text-brand-dark/65"
            } ${align === "center" ? "mx-auto" : ""}`}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}