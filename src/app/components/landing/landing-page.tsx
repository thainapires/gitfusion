import { AuroraBackground } from "./aurora-background";
import { HeroContent } from "./hero-content";
import { HeroHighlights } from "./hero-highlights";
import { HeroIllustration } from "./hero-illustration";
import { LandingNavbar } from "./landing-navbar";

export function LandingPage() {
  return (
    <main className="relative min-h-screen w-screen overflow-hidden bg-background text-white">
      <AuroraBackground
        className="pointer-events-none absolute left-1/2 inset-y-0 w-[calc(100vw+10rem)] -translate-x-1/2 opacity-36"
        colorStops={["#0f172a", "#4c1d95", "#064e3b"]}
        amplitude={0.5}
        blend={0.54}
        speed={0.32}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(6,13,28,0.97)_0%,rgba(6,13,28,0.7)_50%,rgba(6,13,28,0.96)_100%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[90rem] flex-col">
        <LandingNavbar />

        <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-8 pt-8 sm:px-8 lg:px-10 lg:pb-24">
          <div className="grid flex-1 items-center gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:gap-14">
            <HeroContent />
            <HeroIllustration />
          </div>

          <HeroHighlights />
        </section>
      </div>
    </main>
  );
}
