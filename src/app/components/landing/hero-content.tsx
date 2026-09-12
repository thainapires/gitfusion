import Link from "next/link";

export function HeroContent() {
  return (
    <div className="max-w-[39rem] animate-landing-in">
      <p className="mb-5 inline-flex items-center border-l-2 border-emerald-400/80 pl-3 text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
        Developer activity across every source
      </p>

      <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.03] tracking-normal text-white sm:text-5xl lg:text-[3.85rem]">
        Your coding journey, all in one place.
      </h1>

      <p className="mt-6 max-w-[36rem] text-base font-medium leading-8 text-slate-300 sm:text-lg">
        Git Fusion Seamlessly combines your GitHub and GitLab contributions into a unified, interactive visualization.
      </p>

      <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/dashboard"
          className="inline-flex h-12 w-full items-center justify-center bg-emerald-300 px-7 text-sm font-extrabold text-slate-950 transition hover:bg-emerald-200 sm:w-auto"
        >
          Build my activity profile
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex h-12 w-full items-center justify-center border border-slate-600 px-7 text-sm font-bold text-slate-200 transition hover:border-emerald-300/70 hover:text-white sm:w-auto"
        >
          Open dashboard
        </Link>
      </div>
    </div>
  );
}
