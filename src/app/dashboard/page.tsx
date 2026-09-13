"use client";

import { useCallback, useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { IntegrationAccountsPanel } from "../components/accounts/integration-accounts-panel";
import { AuthenticatedLayout } from "../components/app-shell/authenticated-layout";
import { ActivityList } from "../components/dashboard-overview/activity-list";
import { ContributionChart } from "../components/dashboard-overview/contribution-chart";
import { MetricCard } from "../components/dashboard-overview/metric-card";
import { RepositoryTable } from "../components/dashboard-overview/repository-table";
import { readApiJson } from "../lib/api/response";
import { notify } from "../lib/notifications/toast";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "../lib/supabase/client";
import { mockUser } from "../mocks/user";
import { DashboardOverview } from "../types/dashboard";
import { KeepGoingCard } from "../components/dashboard-overview/keep-going-card";

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadOverview = useCallback(async (options?: { refresh?: boolean }) => {
    try {
      setIsLoading(true);

      if (!isSupabaseConfigured()) {
        throw new Error("Configure Supabase to load dashboard data.");
      }

      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        return;
      }

      const response = await fetch(`/api/dashboard/overview${options?.refresh ? "?refresh=1" : ""}`, {
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
      });
      const result = await readApiJson<{ overview?: DashboardOverview; error?: string }>(response);

      if (!response.ok || !result.overview) {
        throw new Error(result.error || "Unable to load dashboard data.");
      }

      setOverview(result.overview);
    } catch (error) {
      notify({ type: "error", title: "Dashboard data failed", message: error instanceof Error ? error.message : "Unable to load dashboard data." });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
    const reloadOverview = () => loadOverview({ refresh: true });
    window.addEventListener("gitfusion:integrations-changed", reloadOverview);
    return () => window.removeEventListener("gitfusion:integrations-changed", reloadOverview);
  }, [loadOverview]);

  const activeDays = overview?.dailyContributions.filter((day) => day.total > 0).length ?? 0;
  const currentStreak = overview ? getCurrentStreak(overview.dailyContributions) : 0;

  return (
    <AuthenticatedLayout
      title={`Good to see you again, ${mockUser.name.split(" ")[0]}`}
      description="Here is your connected GitHub and GitLab activity overview."
      actions={
        <button
          type="button"
          onClick={() => loadOverview({ refresh: true })}
          className="hidden sm:inline-flex h-10 items-center gap-2 rounded-md border border-gray-200 px-3 text-sm font-bold text-muted-foreground transition hover:border-primary hover:text-primary dark:border-gray-800"
        >
          <FiRefreshCw className="size-4" aria-hidden />
          Refresh
        </button>
      }
    >
      {isLoading && <DashboardLoading />}

      {!isLoading && overview && !overview.hasConnections && <EmptyConnectionsState />}

      {!isLoading && overview?.hasConnections && (
        <>
          <div className="space-y-5">
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

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
