import Link from "next/link";
import { FaCodeMerge } from "react-icons/fa6";
import { ThemeToggle } from "../layout/theme-toggle";

export function LandingNavbar() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
      <Link
        href="/"
        className="group flex items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300"
        aria-label="Git Fusion home"
      >
        <span className="grid size-9 place-items-center rounded-lg border border-violet-400/30 bg-violet-500/10 text-violet-300 transition-colors group-hover:border-violet-300/50">
          <FaCodeMerge className="size-5" aria-hidden />
        </span>
        <span className="text-lg font-extrabold tracking-normal text-white sm:text-xl">
          Git Fusion
        </span>
      </Link>

      <nav className="flex items-center gap-2 sm:gap-3" aria-label="Primary navigation">
        {/* <div className="hidden sm:block opacity-80">
          <ThemeToggle />
        </div> */}
        <Link
          href="/dashboard"
          className="rounded-lg border border-slate-500/30 bg-slate-950/20 px-4 py-2 text-sm font-semibold text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:border-violet-300/40 hover:bg-slate-900/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300"
        >
          Sign in
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-200 sm:px-5"
        >
          Get Started
        </Link>
      </nav>
    </header>
  );
}
