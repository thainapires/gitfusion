"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaFire } from "react-icons/fa";
import { FiActivity, FiFolder, FiGitPullRequest, FiRefreshCw } from "react-icons/fi";
import { IntegrationAccountsPanel } from "@/features/integrations/components/integration-accounts-panel";
import { AuthenticatedLayout } from "@/shared/app-shell/authenticated-layout";
import { ActivityList } from "@/features/dashboard/components/activity-list";
import { ContributionChart } from "@/features/dashboard/components/contribution-chart";
import { MetricCard } from "@/features/dashboard/components/metric-card";
import { RepositoryTable } from "@/features/dashboard/components/repository-table";
import { readApiJson } from "@/lib/api/response";
import { notify } from "@/lib/notifications/toast";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  DashboardOverview,
  DashboardSyncStatus,
} from "@/types/dashboard";
import { DailyContribution, RepositorySummary } from "@/types/mock-app";

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [syncStatus, setSyncStatus] = useState<DashboardSyncStatus | null>(null);
  const [viewerName, setViewerName] = useState("there");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOverview = useCallback(async (options?: { refresh?: boolean; silent?: boolean }) => {
    const showLoading = !options?.silent && !options?.refresh;

    try {
      if (showLoading) {
        setIsLoading(true);
      }

      if (options?.refresh) {
        setIsRefreshing(true);
      }

      if (!isSupabaseConfigured()) {
        throw new Error("Configure Supabase to load dashboard data.");
      }

      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        return;
      }

      const user = data.session.user;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle<{ full_name: string | null }>();

      const metadataName = typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : "";
      const fullName = profile?.full_name || metadataName || user.email || "there";
      setViewerName(getFirstName(fullName));

      const url = "/api/dashboard/overview" + (options?.refresh ? "?refresh=1" : "");
      const response = await fetch(url, {
        headers: {
          Authorization: "Bearer " + data.session.access_token,
        },
      });
      const result = await readApiJson<{
        overview?: DashboardOverview;
        sync?: DashboardSyncStatus;
        error?: string;
      }>(response);

      if (!response.ok || !result.overview) {
        throw new Error(result.error || "Unable to load dashboard data.");
      }

      setOverview(result.overview);
      setSyncStatus(result.sync ?? null);
    } catch (error) {
      notify({ type: "error", title: "Dashboard data failed", message: error instanceof Error ? error.message : "Unable to load dashboard data." });
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }

      if (options?.refresh) {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadOverview();
    const reloadOverview = () => loadOverview({ refresh: true });
    window.addEventListener("gitfusion:integrations-changed", reloadOverview);
    return () => window.removeEventListener("gitfusion:integrations-changed", reloadOverview);
  }, [loadOverview]);

  useEffect(() => {
    if (syncStatus?.status !== "syncing") {
      return;
    }

    const intervalId = window.setInterval(() => {
      loadOverview({ silent: true });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [loadOverview, syncStatus?.status]);

  const activeDays = overview?.dailyContributions.filter((day) => day.total > 0).length ?? 0;
  const currentStreak = overview ? getCurrentStreak(overview.dailyContributions) : 0;
  const dashboardMetrics = useMemo(() => overview ? buildDashboardMetrics(overview, currentStreak) : [], [overview, currentStreak]);

  return (
    <AuthenticatedLayout
      title={"Good to see you again, " + viewerName}
      description="Here is your connected GitHub and GitLab activity overview."
      syncStatus={syncStatus}
      syncProviders={overview?.connectedProviders ?? []}
      syncActions={
        <button
          type="button"
          onClick={() => loadOverview({ refresh: true })}
          disabled={isRefreshing}
          className="inline-flex h-10 items-center justify-center gap-2 px-3 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Refresh dashboard data"
        >
          <FiRefreshCw
            className={"size-4 " + (isRefreshing ? "animate-spin" : "")}
            aria-hidden
          />
          <span className="hidden min-[420px]:inline">Refresh</span>
        </button>
      }
    >
      {isLoading && <DashboardLoading />}

      {!isLoading && overview && !overview.hasConnections && <EmptyConnectionsState />}

      {!isLoading && overview?.hasConnections && (
        <div className="space-y-4 lg:space-y-5">
          <DashboardHero
            viewerName={viewerName}
            activeDays={activeDays}
            currentStreak={currentStreak}
          />

          {syncStatus?.status === "failed" && (
            <InlineSyncAlert syncStatus={syncStatus} onRetry={() => loadOverview({ refresh: true })} isRefreshing={isRefreshing} />
          )}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Dashboard metrics">
            {dashboardMetrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </section>

          <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,23rem)]">
            <div className="min-w-0 space-y-5">
              <ContributionChart data={overview.dailyContributions} />
              <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <RepositoryTable repositories={overview.topRepositories} />
                <ActivityOverview data={overview.dailyContributions} />
              </div>
              <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <LanguagesBreakdown repositories={overview.topRepositories} totalContributions={getTotalContributions(overview.dailyContributions)} />
                <IntegrationAccountsPanel compact redirectTo="/dashboard" />
              </div>
            </div>

            <aside className="min-w-0 space-y-5">
              <IntegrationAccountsPanel compact redirectTo="/dashboard" />
              <ActivityList activities={overview.recentActivity} />
              <KeepBuildingCard />
            </aside>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}

function DashboardHero({ viewerName, activeDays, currentStreak }: { viewerName: string; activeDays: number; currentStreak: number }) {
  return (
    <section className="relative min-h-[178px] overflow-hidden rounded-none py-4 sm:py-6 lg:min-h-[188px]">
      <div aria-hidden className="absolute inset-y-0 left-[-8%] w-1 bg-primary/80 blur-[1px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_66%_35%,rgba(139,92,246,0.26),rgba(139,92,246,0.08)_35%,transparent_68%)]" />
      <Image
        src="/images/keep-going-mountains.png"
        alt=""
        width={1536}
        height={512}
        aria-hidden
        priority
        className="pointer-events-none absolute bottom-[-6.5rem] right-[-4rem] hidden w-[58rem] max-w-none opacity-55 mix-blend-screen lg:block 2xl:right-[6rem]"
      />

      <div className="relative z-10 grid min-h-[150px] gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,19rem)] lg:items-center">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Dashboard</p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-normal text-foreground sm:text-4xl">
            Good to see you again, {viewerName}! <span className="font-emoji">👋</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-muted-foreground sm:text-base">
            Here&apos;s your connected GitHub and GitLab activity overview.
          </p>
        </div>

        <div className="relative rounded-lg border border-primary/25 bg-card/68 p-5 shadow-2xl shadow-primary/5 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-full border border-primary/30 bg-primary/15 text-2xl font-emoji" aria-hidden>
              🔥
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-muted-foreground">Current streak</p>
              <p className="mt-1 text-2xl font-extrabold">
                {currentStreak} <span className="text-base font-bold text-muted-foreground">{currentStreak === 1 ? "day" : "days"}</span>
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-muted-foreground">
            {currentStreak > 0 ? "Nice momentum. Keep it going." : "No current streak yet."}
          </p>
          <div className="mt-4 flex gap-2" aria-label={`${activeDays} active days`}>
            {Array.from({ length: 8 }).map((_, index) => (
              <span
                key={index}
                className={"h-3 flex-1 rounded-full " + (index < Math.min(8, Math.ceil(currentStreak / 2)) ? "bg-primary" : "bg-muted")}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InlineSyncAlert({ syncStatus, onRetry, isRefreshing }: { syncStatus: DashboardSyncStatus; onRetry: () => void; isRefreshing: boolean }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-rose-500/25 bg-rose-500/8 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-rose-500/12 text-rose-300">!</span>
        <p className="min-w-0 font-semibold text-rose-100">
          Provider data unavailable <span className="text-rose-200/75">{syncStatus.errorMessage || "Unable to load dashboard data."}</span>
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRefreshing}
        className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-rose-400/30 px-3 text-xs font-extrabold text-rose-100 transition hover:bg-rose-400/10 disabled:opacity-60"
      >
        Retry
      </button>
    </div>
  );
}

function ActivityOverview({ data }: { data: DailyContribution[] }) {
  const months = getMonthlyActivity(data).slice(-7);
  const maxValue = Math.max(...months.flatMap((month) => [month.github, month.gitlab]), 1);
  const points = months.map((month, index) => ({
    x: months.length === 1 ? 0 : (index / (months.length - 1)) * 100,
    githubY: 100 - (month.github / maxValue) * 82,
    gitlabY: 100 - (month.gitlab / maxValue) * 82,
  }));
  const githubPoints = points.map((point) => `${point.x},${point.githubY}`).join(" ");
  const gitlabPoints = points.map((point) => `${point.x},${point.gitlabY}`).join(" ");

  return (
    <section className="min-w-0 rounded-lg border border-border bg-card/85 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold">Activity overview</h2>
          <p className="mt-1 text-xs font-medium text-muted-foreground">Monthly contributions by provider.</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />GitHub</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-orange-500" />GitLab</span>
        </div>
      </div>

      <div className="mt-5 h-42 min-w-0 overflow-hidden rounded-lg bg-background/55 px-2 py-3">
        <svg viewBox="0 0 100 112" preserveAspectRatio="none" className="h-full w-full" role="img" aria-label="GitHub and GitLab activity line chart">
          {[20, 45, 70, 95].map((y) => (
            <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="currentColor" className="text-border" strokeWidth="0.45" />
          ))}
          <polyline points={gitlabPoints} fill="none" stroke="#f97316" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
          <polyline points={githubPoints} fill="none" stroke="var(--primary)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          {points.map((point, index) => (
            <g key={months[index].label}>
              <circle cx={point.x} cy={point.githubY} r="1.3" fill="var(--primary)" vectorEffect="non-scaling-stroke" />
              <circle cx={point.x} cy={point.gitlabY} r="1.15" fill="#f97316" vectorEffect="non-scaling-stroke" />
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-3 flex justify-between text-[0.68rem] font-bold text-muted-foreground">
        {months.map((month) => <span key={month.label}>{month.label}</span>)}
      </div>
    </section>
  );
}

function LanguagesBreakdown({ repositories, totalContributions }: { repositories: RepositorySummary[]; totalContributions: number }) {
  const languages = getLanguageBreakdown(repositories);
  const gradient = languages.length
    ? `conic-gradient(${languages.map((language) => `${language.color} ${language.start}% ${language.end}%`).join(", ")})`
    : "conic-gradient(var(--muted) 0% 100%)";

  return (
    <section className="min-w-0 rounded-lg border border-border bg-card/85 p-5 shadow-sm">
      <h2 className="text-base font-extrabold">Languages</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center">
        <div className="relative mx-auto size-34 rounded-full" style={{ background: gradient }}>
          <div className="absolute inset-5 grid place-items-center rounded-full bg-card text-center">
            <p className="text-xl font-extrabold">{totalContributions.toLocaleString("en-US")}</p>
            <p className="mt-1 text-[0.65rem] font-semibold leading-tight text-muted-foreground">total contributions</p>
          </div>
        </div>
        <div className="space-y-3">
          {!languages.length && <p className="text-sm text-muted-foreground">No repository language data was returned yet.</p>}
          {languages.map((language) => (
            <div key={language.name} className="flex items-center gap-3 text-sm">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: language.color }} />
              <span className="min-w-0 flex-1 truncate font-semibold text-muted-foreground">{language.name}</span>
              <span className="font-extrabold">{language.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function KeepBuildingCard() {
  return (
    <section className="relative min-h-[130px] overflow-hidden rounded-lg border border-primary/25 bg-card/85 p-5 shadow-sm">
      <div className="relative z-10 max-w-48">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Keep building</p>
        <h2 className="mt-3 text-xl font-extrabold leading-tight">Small commits drive big results.</h2>
      </div>
      <div aria-hidden className="absolute bottom-4 right-4 flex items-end gap-2 opacity-80">
        {[34, 50, 68, 86].map((height, index) => (
          <span
            key={height}
            className="w-9 rounded-t-md border border-primary/25 bg-gradient-to-t from-primary/35 to-primary shadow-[0_0_28px_rgba(139,92,246,0.22)]"
            style={{ height, transform: `translateY(${index % 2 ? 0 : 12}px)` }}
          />
        ))}
      </div>
    </section>
  );
}

function buildDashboardMetrics(overview: DashboardOverview, currentStreak: number) {
  const total = getTotalContributions(overview.dailyContributions);
  const githubTotal = overview.dailyContributions.reduce((sum, day) => sum + day.platforms.github, 0);
  const gitlabTotal = overview.dailyContributions.reduce((sum, day) => sum + day.platforms.gitlab, 0);
  const pullOrMergeRequests = overview.metrics.find((metric) => metric.label === "Pull / merge requests")?.value || "0";

  return [
    {
      label: "Total contributions",
      value: total.toLocaleString("en-US"),
      helper: `GitHub ${githubTotal.toLocaleString("en-US")} · GitLab ${gitlabTotal.toLocaleString("en-US")}`,
      trend: `${overview.activeDays.toLocaleString("en-US")} active days`,
      icon: FiActivity,
      visual: "sparkline" as const,
    },
    {
      label: "Repositories",
      value: overview.topRepositories.length.toLocaleString("en-US"),
      helper: `Across ${overview.connectedProviders.length || 0} ${overview.connectedProviders.length === 1 ? "provider" : "providers"}`,
      trend: "Loaded from providers",
      icon: FiFolder,
      visual: "bars" as const,
    },
    {
      label: "Pull / merge requests",
      value: pullOrMergeRequests,
      helper: "Detected from provider APIs",
      trend: "Last year window",
      icon: FiGitPullRequest,
      visual: "bars" as const,
    },
    {
      label: "Current streak",
      value: `${currentStreak.toLocaleString("en-US")} ${currentStreak === 1 ? "day" : "days"}`,
      helper: currentStreak > 0 ? "Nice momentum." : "No current streak yet.",
      trend: `${overview.activeDays.toLocaleString("en-US")} active days`,
      icon: FaFire,
      visual: "progress" as const,
    },
  ];
}

function getMonthlyActivity(data: DailyContribution[]) {
  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
  const grouped = new Map<string, { label: string; github: number; gitlab: number }>();

  data.forEach((day) => {
    const date = parseLocalDate(day.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const current = grouped.get(key) ?? { label: monthFormatter.format(date), github: 0, gitlab: 0 };
    current.github += day.platforms.github;
    current.gitlab += day.platforms.gitlab;
    grouped.set(key, current);
  });

  return Array.from(grouped.values());
}

function getLanguageBreakdown(repositories: RepositorySummary[]) {
  const totals = new Map<string, number>();

  repositories.forEach((repo) => {
    const language = repo.language && repo.language !== "Unknown" ? repo.language : "Other";
    totals.set(language, (totals.get(language) || 0) + Math.max(repo.contributions, 1));
  });

  const entries = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  let cursor = 0;
  const colors = ["#8b5cf6", "#a855f7", "#c084fc", "#7c3aed", "#818cf8"];

  return entries.map(([name, value], index) => {
    const percent = total ? Math.round((value / total) * 100) : 0;
    const start = cursor;
    cursor += total ? (value / total) * 100 : 0;

    return {
      name,
      percent,
      start,
      end: cursor,
      color: colors[index % colors.length],
    };
  });
}

function getTotalContributions(data: DailyContribution[]) {
  return data.reduce((sum, day) => sum + day.total, 0);
}

function getFirstName(value: string) {
  const firstName = value.trim().split(/\s+/).filter(Boolean)[0];

  return firstName || "there";
}

function getCurrentStreak(days: DashboardOverview["dailyContributions"]) {
  const sortedDays = [...days].sort((a, b) => b.date.localeCompare(a.date));

  const firstActiveIndex = sortedDays.findIndex((day) => day.total > 0);

  if (firstActiveIndex === -1) {
    return 0;
  }

  const activeDays = sortedDays.slice(firstActiveIndex);
  const firstInactiveIndex = activeDays.findIndex((day) => day.total <= 0);

  return firstInactiveIndex === -1 ? activeDays.length : firstInactiveIndex;
}

function parseLocalDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function DashboardLoading() {
  return (
    <div className="space-y-5">
      <div className="h-48 animate-pulse rounded-lg bg-card/80" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-34 animate-pulse rounded-lg border border-border bg-card" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,23rem)]">
        <div className="h-80 animate-pulse rounded-lg border border-border bg-card" />
        <div className="h-80 animate-pulse rounded-lg border border-border bg-card" />
      </div>
    </div>
  );
}

function EmptyConnectionsState() {
  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,23rem)]">
      <section className="min-w-0 rounded-lg border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">No providers connected</p>
        <h2 className="mt-3 text-xl font-extrabold sm:text-2xl">Connect GitHub or GitLab to build your dashboard.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Once at least one provider is connected, GitFusion will load repositories, daily activity, recent events, and overview metrics from that account.
        </p>
      </section>
      <IntegrationAccountsPanel redirectTo="/dashboard" />
    </div>
  );
}
