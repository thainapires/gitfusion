import Link from "next/link";
import { FaCodeMerge } from "react-icons/fa6";

export function LandingNavbar() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
      <Link
        href="/"
        className="group flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
        aria-label="Git Fusion home"
      >
        <span className="grid size-9 place-items-center border border-emerald-400/40 bg-slate-950/40 text-emerald-300 transition-colors group-hover:border-emerald-300/70">
          <FaCodeMerge className="size-5" aria-hidden />
        </span>
        <span className="text-lg font-extrabold tracking-normal text-white sm:text-xl">
          Git Fusion
        </span>
      </Link>

      <nav className="flex items-center gap-4" aria-label="Primary navigation">
        <Link
          href="/dashboard"
          className="hidden text-sm font-bold text-slate-400 transition hover:text-white sm:inline-flex"
        >
          View product
        </Link>
        <Link
          href="/dashboard"
          className="border border-emerald-300/40 bg-emerald-300 px-4 py-2 text-sm font-extrabold text-slate-950 transition hover:bg-emerald-200 sm:px-5"
        >
          Start profile
        </Link>
      </nav>
    </header>
  );
}
