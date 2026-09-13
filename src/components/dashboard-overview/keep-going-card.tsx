import Image from "next/image";

type KeepGoingCardProps = {
  activeDays: number;
  currentStreak: number;
};

export function KeepGoingCard({
  activeDays,
  currentStreak,
}: KeepGoingCardProps) {
  const daysElapsedThisYear = getDaysElapsedThisYear();
  const activeDaysLabel = activeDays.toLocaleString("en-US");
  const daysElapsedLabel = daysElapsedThisYear.toLocaleString("en-US");

  return (
    <section className="relative min-h-[190px] overflow-hidden rounded-lg border border-primary/20 bg-white dark:border-primary/40 dark:bg-card">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_55%_100%,rgba(139,92,246,0.10)_0%,rgba(139,92,246,0.035)_42%,transparent_76%)] dark:bg-[radial-gradient(ellipse_at_55%_100%,rgba(139,92,246,0.32)_0%,rgba(139,92,246,0.14)_38%,transparent_72%)]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 left-1/2 h-48 w-[min(34rem,130vw)] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl dark:bg-primary/15 sm:h-64"
      />

      <Image
        src="/images/keep-going-mountains.png"
        alt=""
        width={1536}
        height={512}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-20 -left-192 z-10 min-w-[32rem] max-w-none object-contain object-bottom opacity-10 sm:left-0 sm:-bottom-36 sm:h-auto sm:w-full sm:opacity-30 md:-bottom-52 md:min-w-0 dark:opacity-20 dark:sm:opacity-90"
      />

      <div className="relative z-20 flex min-h-[190px] min-w-0 flex-col justify-between gap-5 p-5 sm:p-6 md:flex-row md:items-center md:p-7">
        <div className="min-w-0 max-w-xl">
          <p className="text-md font-extrabold uppercase tracking-[0.14em] text-primary sm:text-xs sm:tracking-[0.2em]">
            {currentStreak > 0 ? "Keep the streak going!" : "Keep going!"}
          </p>

          <h2 className="mt-1 text-xl font-extrabold text-foreground sm:mt-3 sm:text-2xl">
            {currentStreak > 0
              ? "Your consistency is paying off."
              : "Consistency builds incredible things."}
          </h2>

          <p className="mt-2 text-muted-foreground sm:text-sm">
            You&apos;ve been active for{" "}
            <span className="font-bold text-foreground">
              {activeDaysLabel} {activeDays === 1 ? "day" : "days"}
            </span>{" "}
            out of {daysElapsedLabel}{" "}
            {daysElapsedThisYear === 1 ? "day" : "days"} this year.
          </p>
        </div>

        <div className="relative z-30 w-full rounded-lg border border-gray-200/70 bg-white/75 px-4 py-4 backdrop-blur-sm dark:border-white/5 dark:bg-background/60 sm:px-6 sm:py-5 md:w-auto md:min-w-[220px] md:shrink-0">
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

function getDaysElapsedThisYear() {
  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const startOfYear = new Date(now.getFullYear(), 0, 1);

  return (
    Math.floor(
      (today.getTime() - startOfYear.getTime()) / 86400000,
    ) + 1
  );
}