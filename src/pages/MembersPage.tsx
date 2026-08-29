import { Crown, UserRound, Users, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "../components/Layout";
import { PageHero } from "../components/PageHero";
import { JoinSection } from "../components/JoinSection";
import { SectionHeading } from "../components/SectionHeading";
import { Reveal, Stagger, itemVariants } from "../components/Reveal";
import { leadership, teamLeadRoles, memberGroups } from "../data/members";

function PlaceholderAvatar({ variant }: { variant: "blue" | "orange" | "dark" }) {
  const map = {
    blue: "bg-brand-blue/15 text-brand-blue-dark",
    orange: "bg-brand-orange/12 text-brand-orange-dark",
    dark: "bg-brand-dark/8 text-brand-dark/55",
  } as const;
  return (
    <span
      className={`grid h-20 w-20 place-items-center rounded-2xl ${map[variant]}`}
      aria-hidden="true"
    >
      <UserRound className="h-9 w-9" />
    </span>
  );
}

function FounderCard({
  name,
  role,
  note,
  initials,
}: {
  name: string;
  role: string;
  note: string;
  initials: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="card-surface group relative flex flex-col items-center gap-4 p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <span className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-brand-orange/12 text-brand-orange">
        <Crown className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="grid h-20 w-20 place-items-center rounded-2xl bg-brand-dark text-white shadow-card">
        <span className="font-display text-xl font-bold tracking-tight">{initials}</span>
      </span>
      <div>
        <p className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-brand-orange px-3 py-1 text-center text-xs font-bold uppercase tracking-widest text-white">
          {role}
        </p>
        <h3 className="mt-3 font-display text-xl font-bold tracking-tight text-brand-dark">
          {name}
        </h3>
        <p className="mt-1 text-xs font-medium uppercase tracking-widest text-brand-dark/50">{note}</p>
        <a
          href="mailto:spaceresearch.club@vitap.ac.in"
          className="mt-3 inline-flex text-xs font-semibold text-brand-blue-dark underline decoration-brand-blue/20 underline-offset-4 hover:text-brand-orange-dark"
        >
          spaceresearch.club@vitap.ac.in
        </a>
      </div>
    </motion.div>
  );
}

function LeaderCard({
  role,
  note,
  icon,
}: {
  role: string;
  note: string;
  icon: typeof Crown;
}) {
  const Icon = icon;
  return (
    <motion.div
      variants={itemVariants}
      className="card-surface relative flex flex-col items-center gap-4 p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <span className="absolute right-5 top-5 text-brand-orange/80">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <PlaceholderAvatar variant="blue" />
      <div>
        <h3 className="font-display text-lg font-semibold text-brand-dark">
          {role}
        </h3>
        <p className="mt-1 font-display text-2xl font-bold tracking-tight text-brand-dark/35">
          TBA
        </p>
        <p className="mt-1 text-xs uppercase tracking-widest text-brand-orange">
          {note}
        </p>
      </div>
    </motion.div>
  );
}

export function MembersPage() {
  return (
    <Layout>
      <PageHero
        eyebrow="People · Team & members"
        title={
          <>
            The students behind{" "}
            <span className="text-gradient-brand">SciSpace</span>
          </>
        }
        subtitle="Leadership and members will be announced here as the community formalizes. We don't invent names — when people join, they appear here."
      />

      {/* Founders — visibly featured */}
      <section className="bg-white py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="Founders"
            title="Meet the founders"
            subtitle="SciSpace Research Club was founded by Manda Neelaksh and Mithinti Ramani — visible here so every new visitor knows who started SciSpace."
          />
          <Stagger className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-2">
            <FounderCard name="Manda Neelaksh" role="Founder" note="Founder — SciSpace Research Club" initials="MN" />
            <FounderCard
              name="Mithinti Ramani"
              role="Founder, Campus Ambassador & Star Student"
              note="Founder • Campus Ambassador • Star Student"
              initials="MR"
            />
          </Stagger>
        </div>
      </section>

      {/* Leadership — future roles */}
      <section className="bg-brand-canvas py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="Leadership"
            title="Who steers the ship"
            subtitle="President and Vice President — to be announced."
          />
          <Stagger className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-2">
            <LeaderCard role={leadership[0].role} note={leadership[0].note} icon={Crown} />
            <LeaderCard role={leadership[1].role} note={leadership[1].note} icon={Crown} />
          </Stagger>
        </div>
      </section>

      {/* Team leads */}
      <section className="bg-brand-canvas py-24">
        <div className="container-site">
          <SectionHeading
            eyebrow="Team leads"
            title="Leading the eight domains"
            subtitle="Each domain is guided by a lead. Confirmations land here as teams finalize."
          />
          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {teamLeadRoles.map((role) => (
              <motion.div
                key={role}
                variants={itemVariants}
                className="card-surface flex flex-col items-center gap-3 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <PlaceholderAvatar variant="orange" />
                <p className="text-sm font-semibold leading-snug text-brand-dark">
                  {role}
                </p>
                <p className="text-xs uppercase tracking-widest text-brand-dark/35">
                  TBA
                </p>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Core + members */}
      <section className="bg-white py-24">
        <div className="container-site">
          <div className="grid gap-5 md:grid-cols-2">
            {memberGroups.slice(2).map((g) => (
              <Reveal key={g.key}>
                <div className="card-surface flex h-full flex-col items-center gap-4 p-9 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-dark/8 text-brand-dark/60">
                    {g.key === "core" ? (
                      <Users className="h-7 w-7" aria-hidden="true" />
                    ) : (
                      <UserPlus className="h-7 w-7" aria-hidden="true" />
                    )}
                  </span>
                  <h3 className="font-display text-2xl font-semibold text-brand-dark">
                    {g.label}
                  </h3>
                  <p className="text-sm leading-relaxed text-brand-dark/60">
                    {g.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <JoinSection />
    </Layout>
  );
}