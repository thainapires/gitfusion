import Image from "next/image";
import { CgArrowDown } from "react-icons/cg";

type KeepGoingCardProps = {
  activeDays: number;
  currentStreak: number;
};

export function KeepGoingCard({
  activeDays,
  currentStreak,
}: KeepGoingCardProps) {
  return (
    <section className="relative min-h-[190px] overflow-hidden rounded-lg border border-primary/40 bg-card">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_55%_100%,rgba(139,92,246,0.32)_0%,rgba(139,92,246,0.14)_38%,transparent_72%)]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 left-1/2 h-48 w-[min(34rem,130vw)] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl sm:h-64"
      />

      <Image
        src="/images/keep-going-mountains.png"
        alt=""
        width={1536}
        height={512}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-20 z-10 h-auto w-full min-w-[32rem] max-w-none object-contain object-bottom opacity-90 sm:-bottom-36 md:-bottom-52 md:min-w-0"
      />

      <div className="relative z-20 flex min-h-[190px] min-w-0 flex-col justify-between gap-5 p-5 sm:p-6 md:flex-row md:items-center md:p-7">
        <div className="min-w-0 max-w-xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary sm:tracking-[0.2em]">
            {currentStreak > 0 ? "Keep the streak going!" : "Keep going!"}
          </p>

          <h2 className="mt-3 text-xl font-extrabold text-foreground sm:text-2xl">
            {currentStreak > 0
              ? "Your consistency is paying off."
              : "Consistency builds incredible things."}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;ve been active for{" "}
            <span className="font-bold text-foreground">
              {activeDays} days
            </span>{" "}
            this year.
          </p>

          <button
            type="button"
            className="mt-5 inline-flex h-10 max-w-full items-center rounded-md bg-primary px-4 text-sm font-extrabold text-white transition hover:bg-primary-dark"
          >
            <span className="truncate">View your activity</span>
            <span className="ml-2" aria-hidden>
              <CgArrowDown strokeWidth={2}/>
            </span>
          </button>
        </div>

        <div className="relative z-30 w-full rounded-lg border border-white/5 bg-background/60 px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-5 md:w-auto md:min-w-[220px] md:shrink-0">
          <p className="text-sm font-bold text-muted-foreground">
            Current streak
          </p>

          <div className="mt-2 flex min-w-0 items-center gap-3">
            <span className="text-2xl" aria-hidden>
              🔥
            </span>

            <p className="min-w-0 text-2xl font-extrabold text-foreground sm:text-3xl">
              {currentStreak}{" "}
              <span className="text-base sm:text-lg">
                {currentStreak === 1 ? "day" : "days"}
              </span>
            </p>
          </div>

          <p className="mt-2 text-xs font-medium text-muted-foreground">
            {currentStreak > 0
              ? "Nice momentum. Keep it going."
              : "No current streak"}
          </p>
        </div>
      </div>
    </section>
  );
}