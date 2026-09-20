"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaGithub, FaGitlab, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { SiNextdotjs, SiSupabase, SiVercel } from "react-icons/si";
import { FiArrowRight, FiBarChart2, FiMail, FiPlayCircle, FiTarget, FiUsers, FiZap } from "react-icons/fi";
import { HeroIllustration } from "./hero-illustration";
import { LandingNavbar } from "./landing-navbar";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { AppLogo } from "@/shared/components/app-logo";

export type LandingSessionUser = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

const repositoryUrl = "https://github.com/thainapires/gitfusion";
const navItems = ["Product", "Features", "About", "Resources"];

export function LandingPage() {
  const [user, setUser] = useState<LandingSessionUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(isSupabaseConfigured());

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsCheckingSession(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setUser(null);
        setIsCheckingSession(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,avatar_url")
        .eq("id", data.user.id)
        .maybeSingle<{ full_name: string | null; avatar_url: string | null }>();

      const metadataName = typeof data.user.user_metadata.full_name === "string" ? data.user.user_metadata.full_name : "";
      const metadataAvatarUrl = typeof data.user.user_metadata.avatar_url === "string" ? data.user.user_metadata.avatar_url : "";
      const email = data.user.email || "";

      setUser({
        name: profile?.full_name || metadataName || email || "Git Fusion user",
        email,
        avatarUrl: profile?.avatar_url || metadataAvatarUrl || null,
      });
      setIsCheckingSession(false);
    };

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    }

    setUser(null);
  };

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#060d1c] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.18),transparent_32rem),radial-gradient(circle_at_12%_20%,rgba(139,92,246,0.10),transparent_22rem),linear-gradient(180deg,rgba(6,13,28,0)_0%,#060d1c_58%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35 [mask-image:linear-gradient(to_bottom,black,transparent_68%)]" aria-hidden />

      <div className="relative z-10">
        <LandingNavbar user={user} isCheckingSession={isCheckingSession} onSignOut={handleSignOut} />

        <section id="product" className="relative mx-auto max-w-7xl px-5 pb-14 pt-14 sm:px-8 sm:pb-18 sm:pt-18 lg:px-10 lg:pt-20">
          <HeroLines />
          <div className="mx-auto flex max-w-4xl animate-landing-in flex-col items-center text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-bold text-violet-100 shadow-[0_0_30px_rgba(139,92,246,0.12)]">
              <span aria-hidden>✨</span>
              Your dev journey, unified.
            </p>

            <h1 className="mt-6 max-w-5xl text-balance text-4xl font-extrabold leading-[1.04] tracking-normal text-white sm:text-6xl lg:text-[4.8rem]">
              All-in-One Developer <span className="block text-primary">Productivity Platform</span>
            </h1>

            <p className="mt-6 max-w-2xl text-pretty text-base font-medium leading-8 text-slate-300 sm:text-lg">
              Connect your GitHub and GitLab, track your progress, analyze your activity and see the bigger picture of your coding journey.
            </p>

            <LandingActions isAuthenticated={Boolean(user)} isCheckingSession={isCheckingSession} className="mt-8" />
          </div>

          <HeroIllustration />
        </section>

        <FeatureStrip />
        <PlatformStrip />
        <InsightsSection />
        <OpenSourceSection />
        <FinalCta isAuthenticated={Boolean(user)} isCheckingSession={isCheckingSession} />
        <LandingFooter />
      </div>
    </main>
  );
}

function LandingActions({ isAuthenticated, isCheckingSession, className = "" }: { isAuthenticated: boolean; isCheckingSession: boolean; className?: string }) {
  const primaryHref = isAuthenticated ? "/dashboard" : "/sign-up";

  return (
    <div className={`flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row ${className}`}>
      <Link
        href={primaryHref}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-extrabold text-white transition hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:w-auto"
        aria-disabled={isCheckingSession}
      >
        {isAuthenticated ? "Go to dashboard" : "Get Started Free"}
        <FiArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

function HeroLines() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-24 hidden h-60 lg:block" aria-hidden>
      <div className="absolute left-[-6rem] top-12 h-24 w-80 rounded-tr-[4rem] border-r border-t border-primary/30" />
      <div className="absolute right-[-6rem] top-12 h-24 w-80 rounded-tl-[4rem] border-l border-t border-primary/30" />
      <div className="absolute left-8 top-26 h-px w-72 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute right-8 top-26 h-px w-72 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  );
}

function FeatureStrip() {
  const features = [
    { title: "GitHub & GitLab", description: "Connect in seconds", icon: FaGithub },
    { title: "Beautiful Insights", description: "Understand your habits", icon: FiBarChart2 },
    { title: "Track Your Growth", description: "See your evolution", icon: FiZap },
    { title: "Set Goals", description: "Stay motivated", icon: FiTarget },
    { title: "Built for Developers", description: "100% free and open source", icon: FiUsers },
  ];

  return (
    <section id="features" className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-5 py-10 sm:grid-cols-2 sm:px-8 md:grid-cols-5 lg:px-10">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <article key={feature.title} className="flex flex-col items-center text-center sm:items-start sm:text-left md:items-center md:text-center">
            <span className="grid size-11 place-items-center rounded-md border border-primary/25 bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden />
            </span>
            <h2 className="mt-3 text-sm font-extrabold text-white">{feature.title}</h2>
            <p className="mt-1 text-sm font-medium text-slate-400">{feature.description}</p>
          </article>
        );
      })}
    </section>
  );
}

function PlatformStrip() {
  const platforms = [
    { name: "GitHub", icon: FaGithub },
    { name: "GitLab", icon: FaGitlab },
    { name: "Vercel", icon: SiVercel },
    { name: "Supabase", icon: SiSupabase },
    { name: "Next.js", icon: SiNextdotjs },
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <div className="flex items-center gap-4 text-center">
        <div className="h-px flex-1 bg-white/10" />
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-slate-500">Built with & connected to</p>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-6 text-slate-400 sm:grid-cols-5">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <div key={platform.name} className="flex items-center justify-center gap-3 text-base font-extrabold opacity-80">
              <Icon className="size-6" aria-hidden />
              {platform.name}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function InsightsSection() {
  return (
    <section id="resources" className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.74fr_1fr] lg:px-10">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-primary">Turn activity into insights</p>
        <h2 className="mt-4 max-w-xl text-4xl font-extrabold leading-tight tracking-normal text-white sm:text-5xl">
          Understand more. <span className="block text-primary">Build what&apos;s next.</span>
        </h2>
        <p className="mt-5 max-w-lg text-base leading-8 text-slate-300">
          Go beyond raw contribution counts. GitFusion helps developers understand activity, languages, repositories, and trends across the platforms where real work happens.
        </p>
        <Link href="#features" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-md border border-primary/40 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
          Explore all features
          <FiArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <LanguagesCard />
        <ContributionsCard />
      </div>
    </section>
  );
}

function LanguagesCard() {
  const languages = [
    ["TypeScript", "42%", "#8b5cf6"],
    ["JavaScript", "28%", "#a855f7"],
    ["PHP", "12%", "#6d5dfc"],
    ["Python", "8%", "#c4b5fd"],
    ["Other", "10%", "#94a3b8"],
  ];

  return (
    <article className="rounded-lg border border-white/10 bg-[#101421]/90 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
      <h3 className="text-sm font-extrabold text-white">Languages</h3>
      <div className="mt-6 grid items-center gap-6 sm:grid-cols-[9rem_1fr] md:grid-cols-1 xl:grid-cols-[9rem_1fr]">
        <div className="mx-auto size-36 rounded-full bg-[conic-gradient(#8b5cf6_0_42%,#a855f7_42%_70%,#6d5dfc_70%_82%,#c4b5fd_82%_90%,#94a3b8_90%_100%)] p-6">
          <div className="size-full rounded-full bg-[#101421]" />
        </div>
        <dl className="space-y-3">
          {languages.map(([name, value, color]) => (
            <div key={name} className="flex items-center gap-3 text-sm">
              <dt className="flex flex-1 items-center gap-2 text-slate-300"><span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />{name}</dt>
              <dd className="font-extrabold text-white">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

function ContributionsCard() {
  const months = [
    ["Jan", 34],
    ["Feb", 78],
    ["Mar", 52],
    ["Apr", 82],
    ["May", 60],
    ["Jun", 92],
  ];

  return (
    <article className="rounded-lg border border-white/10 bg-[#101421]/90 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-extrabold text-white">Contributions</h3>
        <span className="text-xs font-extrabold text-emerald-400">+12%</span>
      </div>
      <div className="mt-7 flex h-44 items-end gap-4 border-l border-b border-white/10 px-3 pb-3">
        {months.map(([month, value]) => (
          <div key={month} className="flex flex-1 flex-col items-center gap-3">
            <span className="w-full rounded-t bg-gradient-to-t from-primary to-fuchsia-500" style={{ height: `${value}%` }} />
            <span className="text-xs font-bold text-slate-400">{month}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function OpenSourceSection() {
  return (
    <section id="about" className="relative overflow-hidden border-y border-white/10 py-20">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.06)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" aria-hidden />
      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-primary">Open source forever</p>
        <h2 className="mt-4 text-4xl font-extrabold tracking-normal text-white sm:text-5xl">Built by a developer, for developers.</h2>
        <p className="mt-5 text-base leading-8 text-slate-300">
          GitFusion is 100% free and open source. No hidden fees, no tracking, no lock-in. Just a tool made to help you understand your journey and build what&apos;s next.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={repositoryUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-extrabold text-white transition hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <FaGithub className="size-4" aria-hidden />
            View on GitHub
          </Link>
          <Link href="#about" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/15 px-5 py-3 text-sm font-extrabold text-white transition hover:border-primary/50 hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            Our story
          </Link>
        </div>
      </div>
    </section>
  );
}

function FinalCta({ isAuthenticated, isCheckingSession }: { isAuthenticated: boolean; isCheckingSession: boolean }) {
  return (
    <section id="pricing" className="relative overflow-hidden px-5 py-24 sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-10 mx-auto hidden h-72 max-w-6xl rounded-t-[8rem] border-t border-primary/25 lg:block" aria-hidden />
      <div className="pointer-events-none absolute inset-x-1/2 top-20 h-px w-[90rem] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/25 to-transparent" aria-hidden />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-extrabold leading-tight tracking-normal text-white sm:text-5xl">
          Ready to see your <span className="block"><span className="text-primary">dev journey</span> in a new way?</span>
        </h2>
        <p className="mt-5 text-base leading-8 text-slate-300">
          Connect your GitHub and GitLab, track your progress and join a growing community of developers.
        </p>
        <LandingActions isAuthenticated={isAuthenticated} isCheckingSession={isCheckingSession} className="mt-8" />
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-white/10 px-5 py-9 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-3 font-extrabold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <AppLogo className="size-7" />
            GitFusion
          </Link>
          <p className="mt-3 text-sm text-slate-400">Open source developer analytics. Made with ♥ by Thainá Pires.</p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-slate-400" aria-label="Footer navigation">
          {navItems.map((item) => (
            <Link key={item} href={navHref(item)} className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-slate-300">
          <Link href={repositoryUrl} target="_blank" rel="noreferrer" aria-label="GitHub" className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><FaGithub className="size-5" /></Link>
          <span aria-label="X" className="text-slate-600"><FaXTwitter className="size-5" /></span>
          <span aria-label="LinkedIn" className="text-slate-600"><FaLinkedin className="size-5" /></span>
          <span aria-label="Email" className="text-slate-600"><FiMail className="size-5" /></span>
        </div>
      </div>
    </footer>
  );
}

function navHref(label: string) {
  if (label === "Product") return "#product";
  if (label === "Features") return "#features";
  if (label === "Pricing") return "#pricing";
  if (label === "About") return "#about";
  return "#resources";
}
