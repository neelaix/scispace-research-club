import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Team } from "../data/teams";
import { itemVariants } from "./Reveal";

export function TeamCard({ team }: { team: Team }) {
  const Icon = team.icon;
  const isBlue = team.color === "blue";

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="card-surface group relative flex flex-col overflow-hidden p-6 transition-shadow duration-300 hover:shadow-card-hover"
    >
      {/* glow on hover */}
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 ${
          isBlue ? "bg-brand-blue" : "bg-brand-orange"
        }`}
      />
      <span
        aria-hidden="true"
        className={`absolute -right-12 -top-12 h-36 w-36 rounded-full transition-transform duration-500 group-hover:scale-150 ${
          isBlue ? "bg-brand-blue/10" : "bg-brand-orange/10"
        }`}
      />

      <div className="flex items-start justify-between">
        <span className="font-display text-sm font-semibold tracking-widest text-brand-dark/30">
          {team.number}
        </span>
        <span
          className={`grid h-11 w-11 place-items-center rounded-xl transition-colors duration-300 ${
            isBlue
              ? "bg-brand-blue/12 text-brand-blue-dark group-hover:bg-brand-blue group-hover:text-white"
              : "bg-brand-orange/12 text-brand-orange-dark group-hover:bg-brand-orange group-hover:text-white"
          }`}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      </div>

      <h3 className="mt-5 font-display text-xl font-semibold text-brand-dark">
        {team.name}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-dark/60">
        {team.short}
      </p>

      <Link
        to="/teams"
        aria-label={`${team.name} — view details`}
        className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${
          isBlue
            ? "text-brand-blue-dark group-hover:text-brand-orange-dark"
            : "text-brand-orange-dark group-hover:text-brand-blue-dark"
        }`}
      >
        Learn more
        <ArrowUpRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </Link>
    </motion.div>
  );
}