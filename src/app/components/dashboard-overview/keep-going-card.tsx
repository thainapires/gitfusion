import Image from "next/image";
import { BsArrowDown } from "react-icons/bs";
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
    <section className="relative min-h-[190px] overflow-hidden rounded-xl border border-primary/40 bg-card">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_55%_100%,rgba(139,92,246,0.32)_0%,rgba(139,92,246,0.14)_38%,transparent_72%)]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/2 h-64 w-[38rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />

      <Image
        src="/images/keep-going-mountains.png"
        alt=""
        width={1536}
        height={512}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-52 z-10 h-auto w-full object-contain object-bottom opacity-90"
      />

      <div className="relative z-20 flex min-h-[190px] flex-col justify-between gap-6 p-6 md:flex-row md:items-center md:p-7">
        <div className="max-w-xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
            {currentStreak > 0 ? "Keep the streak going!" : "Keep going!"}
          </p>

          <h2 className="mt-3 text-xl font-extrabold text-foreground sm:text-2xl">
            {currentStreak > 0
              ? "Your consistency is paying off."
              : "Consistency builds incredible things."}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            You've been active for{" "}
            <span className="font-bold text-foreground">
              {activeDays} days
            </span>{" "}
            this year.
          </p>

          <button
            type="button"
            className="mt-5 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-extrabold text-white transition hover:bg-primary-dark"
          >
            View your activity
            <span className="ml-2" aria-hidden>
              <CgArrowDown strokeWidth={2}/>
            </span>
          </button>
        </div>

        <div className="relative z-30 shrink-0 rounded-xl border border-white/5 bg-background/60 px-6 py-5 backdrop-blur-sm md:min-w-[220px]">
          <p className="text-sm font-bold text-muted-foreground">
            Current streak
          </p>

          <div className="mt-2 flex items-center gap-3">
            <span className="text-2xl" aria-hidden>
              🔥
            </span>

            <p className="text-3xl font-extrabold text-foreground">
              {currentStreak}{" "}
              <span className="text-lg">
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