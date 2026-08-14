import { teams } from "../data/teams";
import { Stagger } from "./Reveal";
import { TeamCard } from "./TeamCard";
import { SectionHeading } from "./SectionHeading";

export function TeamGrid({ heading = true }: { heading?: boolean }) {
  return (
    <div>
      {heading && (
        <SectionHeading
          eyebrow="Our domains"
          title={
            <>
              Eight teams. One{" "}
              <span className="text-gradient-brand">research community</span>.
            </>
          }
          subtitle="Every part of SciSpace — from deep research to design, events to outreach — is run by our eight student domains."
        />
      )}
      <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </Stagger>
    </div>
  );
}