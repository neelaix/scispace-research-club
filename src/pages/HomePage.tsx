import { Navbar } from "../components/Navbar";
import { ScrollProgress } from "../components/ScrollProgress";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";
import { AboutSection } from "../components/AboutSection";
import { PhilosophySection } from "../components/PhilosophySection";
import { TeamGrid } from "../components/TeamGrid";
import { JourneySection } from "../components/JourneySection";
import { ResearchSection } from "../components/ResearchSection";
import { EventSection } from "../components/EventSection";
import { WhySciSpace } from "../components/WhySciSpace";
import { JoinSection } from "../components/JoinSection";

export function HomePage() {
  return (
    <>
      <Navbar />
      <ScrollProgress />
      <main>
        <Hero />
        <AboutSection />
        <PhilosophySection />
        <TeamGrid />
        <JourneySection />
        <ResearchSection />
        <EventSection />
        <WhySciSpace />
        <JoinSection />
      </main>
      <Footer />
    </>
  );
}