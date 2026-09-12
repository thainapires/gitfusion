import Link from "next/link";

export function HeroContent() {
  return (
    <div className="max-w-xl animate-landing-in">
      <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-normal text-white sm:text-5xl lg:text-[4.1rem]">
        Your coding journey,{" "}
        <span className="text-violet-500 ">
          all in one place.
        </span>
      </h1>
      <p className="mt-6 max-w-[36rem] text-base font-medium leading-8 text-slate-300 sm:text-lg">
        Combine your GitHub and GitLab contributions into one unified view and
        see your development activity from a clearer perspective.
      </p>
      <div className="mt-9 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex h-12 min-w-40 items-center justify-center rounded-lg bg-violet-500 px-7 text-sm font-extrabold text-white transition hover:bg-violet-400"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
