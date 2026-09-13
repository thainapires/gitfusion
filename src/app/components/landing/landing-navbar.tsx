import Image from "next/image";
import Link from "next/link";
import { FiLogOut } from "react-icons/fi";
import type { LandingSessionUser } from "./landing-page";

type LandingNavbarProps = {
  user: LandingSessionUser | null;
  isCheckingSession: boolean;
  onSignOut: () => void;
};

export function LandingNavbar({ user, isCheckingSession, onSignOut }: LandingNavbarProps) {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
      <Link
        href={user ? "/dashboard" : "/"}
        className="group flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
        aria-label={user ? "Git Fusion dashboard" : "Git Fusion home"}
      >
        <>
          <Image
            src="/images/logo.png"
            alt=""
            width={24}
            height={24}
            aria-hidden
            className="size-9 dark:hidden"
          />

          <Image
            src="/images/logo-dark.png"
            alt=""
            width={24}
            height={24}
            aria-hidden
            className="hidden size-9 dark:block"
          />
        </>

        <span className="text-lg font-extrabold tracking-normal text-white sm:text-xl">
          Git Fusion
        </span>
      </Link>

      <div className="flex gap-12">
        <Link
          href="/dashboard"
          className="hidden text-sm font-bold text-slate-400 transition hover:text-white sm:inline-flex"
        >
          Dashboard
        </Link>
        <Link
          href="/settings"
          className="hidden text-sm font-bold text-slate-400 transition hover:text-white sm:inline-flex"
        >
          Settings
        </Link>
      </div>

      <nav className={`flex items-center ${user ? "" : "gap-3 sm:gap-4"}`} aria-label="Primary navigation">
        {user ? (
          <>
            <Link
              href="/dashboard"
              className="flex min-w-0 items-center gap-2 rounded-md bg-slate-950/35 py-1.5 text-sm font-extrabold text-white transition"
              aria-label={`Open dashboard for ${user.name}`}
            >
              <span
                className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-primary bg-cover bg-center text-xs text-white"
                style={user.avatarUrl ? { backgroundImage: `url(${user.avatarUrl})` } : undefined}
                aria-hidden
              >
                {!user.avatarUrl && getInitials(user.name)}
              </span>
              <span className="hidden max-w-36 truncate sm:inline">{user.name.trim().split(/\s+/)[0]}</span>
            </Link>

            <button
              type="button"
              onClick={onSignOut}
              className="grid size-10 place-items-center text-slate-400 transition hover:text-primary cursor-pointer"
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
              className="hidden text-sm font-bold text-slate-400 transition hover:text-white sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-md bg-primary px-4 py-2 text-sm font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
              aria-disabled={isCheckingSession}
            >
              Get started
            </Link>
          </>
        )}
      </nav>
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
