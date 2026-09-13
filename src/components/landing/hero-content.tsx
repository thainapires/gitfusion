import Link from "next/link";

type HeroContentProps = {
  isAuthenticated: boolean;
  isCheckingSession: boolean;
};

export function HeroContent({ isAuthenticated, isCheckingSession }: HeroContentProps) {
  const primaryHref = isAuthenticated ? "/dashboard" : "/sign-up";
  const secondaryHref = isAuthenticated ? "/connect-accounts" : "/sign-in";

  return (
    <div className="flex flex-col items-center lg:block lg:max-w-[39rem] animate-landing-in">
      <p className="mb-5 inline-flex items-center lg:border-l-2 lg:border-primary pl-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">
        Developer activity across every source
      </p>

      <h1 className="text-center lg:text-start max-w-sm sm:max-w-lg lg:max-w-3xl text-4xl font-extrabold leading-[1.03] tracking-normal text-white sm:text-5xl lg:text-[3.85rem]">
        Your coding journey, all in one place.
      </h1>

      <p className="text-center lg:text-start mt-6 max-w-sm sm:max-w-lg lg:max-w-[36rem] text-base font-medium leading-8 text-slate-300 sm:text-lg">
        Git Fusion Seamlessly combines your GitHub and GitLab contributions into a unified, interactive visualization.
      </p>

      <div className="mt-9 flex gap-3 flex-row sm:items-center">
        <Link
          href={primaryHref}
          className="rounded-md bg-primary px-4 py-2 text-sm font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
          aria-disabled={isCheckingSession}
        >
          {isAuthenticated ? "Go to dashboard" : "Sign up"}
        </Link>

        {!isAuthenticated && (
          <Link
            href={secondaryHref}
            className="rounded-md border border-slate-600 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
            aria-disabled={isCheckingSession}
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
