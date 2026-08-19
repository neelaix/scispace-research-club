import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { config } from "../config/config";
import { Layout } from "../components/Layout";
import { PageHero } from "../components/PageHero";
import { JoinSection } from "../components/JoinSection";
import { SectionHeading } from "../components/SectionHeading";
import { Stagger, itemVariants } from "../components/Reveal";
import { teams } from "../data/teams";

export function TeamsPage() {
  return (
    <Layout>
      <PageHero
        eyebrow={`Teams · ${config.CLUB_NAME_FULL}`}
        title={
          <>
            Eight teams. One{" "}
            <span className="text-gradient-brand">research engine</span>.
          </>
        }
        subtitle="Every part of the club — research, engineering, content, design, events, marketing, outreach and operations — is led by students, for students."
      />

      <section className="bg-white py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="Domains"
            title="How we're organized"
            subtitle="Each team owns a slice of the community and contributes to the shared goal: making research and innovation the norm at VIT-AP."
          />

          <Stagger className="mt-14 grid gap-5 md:grid-cols-2">
            {teams.map((team) => {
              const Icon = team.icon;
              const isBlue = team.color === "blue";
              return (
                <motion.article
                  key={team.id}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  className={`card-surface group relative flex flex-col overflow-hidden p-7 ${
                    isBlue
                      ? "hover:shadow-glow"
                      : "hover:shadow-glow-orange"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 ${
                      isBlue ? "bg-brand-blue" : "bg-brand-orange"
                    }`}
                  />
                  <div className="flex items-start gap-4">
                    <span
                      className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${
                        isBlue
                          ? "bg-brand-blue/12 text-brand-blue-dark"
                          : "bg-brand-orange/12 text-brand-orange-dark"
                      }`}
                    >
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div>
                      <span className="font-mono text-xs uppercase tracking-widest text-brand-dark/35">
                        Domain {team.number}
                      </span>
                      <h3 className="mt-1 font-display text-xl font-semibold text-brand-dark">
                        {team.name}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-brand-dark/70">
                    {team.description}
                  </p>
                  <div
                    className={`mt-auto pt-5 text-sm font-semibold ${
                      isBlue ? "text-brand-blue-dark" : "text-brand-orange-dark"
                    }`}
                  >
                    Part of every SciSpace initiative
                  </div>
                </motion.article>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-brand-mist py-20">
        <div className="container-site">
          <div className="relative overflow-hidden rounded-3xl bg-brand-dark p-9 text-center text-white md:p-14">
            <div aria-hidden="true" className="absolute inset-0 bg-brand-soft opacity-80" />
            <div className="relative z-10 mx-auto max-w-xl">
              <Sparkles className="mx-auto h-7 w-7 text-brand-orange" aria-hidden="true" />
              <h2 className="mt-4 font-display text-2xl font-semibold md:text-3xl">
                Not sure which team is yours?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                You don't have to decide alone. Join SciSpace and we'll help you
                find where your strengths fit — across research, technology,
                creativity, events and outreach.
              </p>
              <Link
                to="/join"
                className="btn-accent mt-7 inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white"
              >
                Join SciSpace <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-4 text-sm text-white/50">
                Curious who runs these teams?{" "}
                <Link
                  to="/members"
                  className="inline-flex items-center gap-1 font-semibold text-brand-blue transition-colors hover:text-white"
                >
                  Meet the members <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <JoinSection />
    </Layout>
  );
}