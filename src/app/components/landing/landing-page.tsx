import { AuroraBackground } from "./aurora-background";
import { HeroContent } from "./hero-content";
import { HeroHighlights } from "./hero-highlights";
import { HeroIllustration } from "./hero-illustration";
import { LandingNavbar } from "./landing-navbar";

export function LandingPage() {
  return (
    <main className="relative min-h-screen w-screen overflow-hidden bg-[#060d1c] text-white">
      <AuroraBackground
        className="pointer-events-none absolute left-1/2 inset-y-0 w-[calc(100vw+14rem)] -translate-x-1/2 opacity-80 sm:w-[calc(100vw+10rem)]"
        colorStops={["#2e1065", "#8b5cf6", "#2563eb"]}
        amplitude={0.85}
        blend={0.7}
        speed={0.5}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(6,13,28,0.04),rgba(6,13,28,0.62)_76%)]" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[90rem] flex-col">
        <LandingNavbar />

        <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-8 pt-8 sm:px-8 lg:px-10 lg:pb-30">
          <div className="grid flex-1 items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10">
            <HeroContent />
            <HeroIllustration />
          </div>

          <HeroHighlights />
        </section>
      </div>
    </main>
  );
}
