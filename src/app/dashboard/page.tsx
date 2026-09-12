"use client";

import { useCallback, useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { IntegrationAccountsPanel } from "../components/accounts/integration-accounts-panel";
import { AuthenticatedLayout } from "../components/app-shell/authenticated-layout";
import { ActivityList } from "../components/dashboard-overview/activity-list";
import { ContributionChart } from "../components/dashboard-overview/contribution-chart";
import { MetricCard } from "../components/dashboard-overview/metric-card";
import { RepositoryTable } from "../components/dashboard-overview/repository-table";
import { notify } from "../lib/notifications/toast";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "../lib/supabase/client";
import { mockUser } from "../mocks/user";
import { DashboardOverview } from "../types/dashboard";

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
      const result = await response.json() as { overview?: DashboardOverview; error?: string };

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

  return (
    <AuthenticatedLayout
      title={`Good to see you again, ${mockUser.name.split(" ")[0]}`}
      description="Here is your connected GitHub and GitLab activity overview."
      actions={
        <button
          type="button"
          onClick={() => loadOverview({ refresh: true })}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-200 px-3 text-sm font-bold text-muted-foreground transition hover:border-primary hover:text-primary dark:border-gray-800"
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {overview.metrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="space-y-6">
              <ContributionChart data={overview.dailyContributions} />
              <RepositoryTable repositories={overview.topRepositories} />
            </div>
            <div className="space-y-6">
              <IntegrationAccountsPanel compact redirectTo="/dashboard" />
              <ActivityList activities={overview.recentActivity} />
            </div>
          </div>
        </>
      )}
    </AuthenticatedLayout>
  );
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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <section className="rounded-lg border border-gray-200 bg-card p-6 shadow-sm dark:border-gray-800">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">No providers connected</p>
        <h2 className="mt-3 text-2xl font-extrabold">Connect GitHub or GitLab to build your dashboard.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Once at least one provider is connected, Git Fusion will load repositories, daily activity, recent events, and overview metrics from that account.
        </p>
      </section>
      <IntegrationAccountsPanel redirectTo="/dashboard" />
    </div>
  );
}
