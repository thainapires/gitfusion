"use client";

import { useCallback, useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { IntegrationAccountsPanel } from "../../components/accounts/integration-accounts-panel";
import { AuthenticatedLayout } from "../../components/app-shell/authenticated-layout";
import { ActivityList } from "../../components/dashboard-overview/activity-list";
import { ContributionChart } from "../../components/dashboard-overview/contribution-chart";
import { MetricCard } from "../../components/dashboard-overview/metric-card";
import { RepositoryTable } from "../../components/dashboard-overview/repository-table";
import { readApiJson } from "../../lib/api/response";
import { notify } from "../../lib/notifications/toast";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "../../lib/supabase/client";
import {
  DashboardOverview,
  DashboardSyncStatus,
} from "../../types/dashboard";
import { KeepGoingCard } from "../../components/dashboard-overview/keep-going-card";

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
          className="inline-flex min-h-[52px] items-center justify-center gap-2 px-3 text-sm font-bold text-muted-foreground transition hover:bg-gray-50 hover:text-primary disabled:cursor-not-allowed cursor-pointer disabled:opacity-60 dark:hover:bg-gray-900/70 min-[420px]:px-4"
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
        <>
          <div className="mt-6 space-y-5">
            <KeepGoingCard
              activeDays={activeDays}
              currentStreak={currentStreak}
            />
          </div>

          <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,24rem)]">
            <div className="min-w-0 space-y-6">
              <div className="grid gap-4 grid-cols-2 xl:grid-cols-3">
                {overview.metrics.map((metric) => (
                    <MetricCard key={metric.label} metric={metric} />
                ))}
              </div>
              <ContributionChart data={overview.dailyContributions} />
              <RepositoryTable repositories={overview.topRepositories} />
            </div>
            <div className="min-w-0 space-y-6">
              <IntegrationAccountsPanel compact redirectTo="/dashboard" />
              <ActivityList activities={overview.recentActivity} />
            </div>
          </div>
        </>
      )}
    </AuthenticatedLayout>
  );
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

function DashboardLoading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-40 animate-pulse rounded-lg border border-gray-200 bg-card dark:border-gray-800" />
      ))}
    </div>
  );
}

function EmptyConnectionsState() {
  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,24rem)]">
      <section className="min-w-0 rounded-lg border border-gray-200 bg-card p-5 shadow-sm dark:border-gray-800 sm:p-6">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">No providers connected</p>
        <h2 className="mt-3 text-xl font-extrabold sm:text-2xl">Connect GitHub or GitLab to build your dashboard.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Once at least one provider is connected, Git Fusion will load repositories, daily activity, recent events, and overview metrics from that account.
        </p>
      </section>
      <IntegrationAccountsPanel redirectTo="/dashboard" />
    </div>
  );
}
