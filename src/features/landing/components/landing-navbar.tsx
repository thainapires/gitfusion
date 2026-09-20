import Link from "next/link";
import { FiArrowRight, FiLogOut } from "react-icons/fi";
import type { LandingSessionUser } from "./landing-page";
import { AppLogo } from "@/shared/components/app-logo";

type LandingNavbarProps = {
  user: LandingSessionUser | null;
  isCheckingSession: boolean;
  onSignOut: () => void;
};

const navItems = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "Resources", href: "#resources" },
];

export function LandingNavbar({ user, isCheckingSession, onSignOut }: LandingNavbarProps) {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
      <Link
        href={user ? "/dashboard" : "/"}
        className="group flex shrink-0 items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        aria-label={user ? "GitFusion dashboard" : "GitFusion home"}
      >
        <AppLogo className="size-8" />
        <span className="text-base font-extrabold tracking-normal text-white sm:text-lg">GitFusion</span>
      </Link>

      <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="text-xs font-extrabold text-slate-300 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {user ? (
          <>
            <Link
              href="/dashboard"
              className="hidden min-h-10 items-center gap-2 rounded-md border border-white/15 bg-white/[0.03] px-3 text-sm font-extrabold text-white transition hover:border-primary/50 hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:inline-flex"
              aria-label={`Open dashboard for ${user.name}`}
            >
              <span
                className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-primary bg-cover bg-center text-[0.65rem] text-white"
                style={user.avatarUrl ? { backgroundImage: `url(${user.avatarUrl})` } : undefined}
                aria-hidden
              >
                {!user.avatarUrl && getInitials(user.name)}
              </span>
              <span className="hidden max-w-28 truncate md:inline">Dashboard</span>
            </Link>

            <button
              type="button"
              onClick={onSignOut}
              className="grid size-10 place-items-center rounded-md border border-white/15 text-slate-300 transition hover:border-primary/50 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary cursor-pointer"
              aria-label="Sign out"
              title="Sign out"
            >
              <FiLogOut className="size-4" aria-hidden />
            </button>
          </>
        ) : (
          <>
            <Link
              href="/sign-in"
              className="hidden min-h-10 items-center rounded-md border border-white/15 bg-white/[0.03] px-4 text-sm font-extrabold text-white transition hover:border-primary/50 hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-extrabold text-white transition hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:px-5"
              aria-disabled={isCheckingSession}
            >
              <span className="hidden sm:inline">Get Started Free</span>
              <span className="sm:hidden">Start</span>
              <FiArrowRight className="size-4" aria-hidden />
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return "GF";
  }

  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "GF";
}
