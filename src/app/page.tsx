import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import Hero from "@/components/sections/Hero";
import IntroductionSection from "@/components/sections/IntroductionSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import TeamsSection from "@/components/sections/TeamsSection";
import EventsSection from "@/components/sections/EventsSection";
import SitesSection from "@/components/sections/SitesSection";
import BoardSection from "@/components/sections/BoardSection";
import Universe from "@/components/ui/Universe";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import StatsCards from "@/components/sections/StatsCards";

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent">
      <Universe
        speed={0.8}
        density={0.8}
        starSize={0.3}
        amplitude={1.0}
        revealDuration={2.5}
      />

      <div className="fixed top-0 left-0 w-full z-9999">
        <Header />
      </div>

      <main className="relative z-10 w-full">
        <section
          id="home"
          className="relative min-h-svh w-full overflow-hidden flex flex-col"
        >
          <div className="h-16 md:h-20 shrink-0 w-full" />

          <div className="flex-1 flex flex-col items-center z-10 px-4">
            <div className="w-full flex flex-col items-center justify-center flex-1 space-y-10 md:space-y-16">
              <Hero />
              <div className="w-full max-w-7xl">
                <StatsCards />
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col items-center justify-center pb-6 pt-4 md:pb-10 z-20 shrink-0">
            <ScrollReveal />
          </div>
        </section>

        <section className="relative flex flex-col min-h-screen">
          <div className="relative z-10 flex-1 px-4 md:px-8 py-12">
            <div className="max-w-7xl mx-auto">
              <IntroductionSection />
              <FeaturesSection />
              <TeamsSection />
              <BoardSection />
              <EventsSection />
              <SitesSection />
            </div>
          </div>

          <div className="relative z-50 mt-auto">
            <Footer />
          </div>
        </section>
      </main>
    </div>
  );
}