import { AccountProvider } from "@/types/mock-app";
import { DashboardOverview } from "@/types/dashboard";
import {
  createSupabaseAdminClient,
} from "@/lib/supabase/server";
import {
  StoredDailyTotal,
} from "@/lib/dashboard/overview";

import { getDashboardCacheExpiration } from "./dashboard.cache";

const DASHBOARD_DAYS = 365;

export type CachedOverviewRow = {
  overview: DashboardOverview;
  expires_at: string;
};

export type SyncRunStatusRow = {
  id: string;
  status: "running" | "succeeded" | "failed";
  started_at: string;
  finished_at: string | null;
  error_message: string | null;
};

export async function readFreshCachedOverview(
  userId: string,
  cacheKey: string,
) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("dashboard_overview_cache")
    .select("overview,expires_at")
    .eq("user_id", userId)
    .eq("cache_key", cacheKey)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle<CachedOverviewRow>();

  if (error) {
    console.error("Unable to read dashboard overview cache", error);
  }

  return data;
}

export async function readLatestCachedOverview(userId: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("dashboard_overview_cache")
    .select("overview,expires_at")
    .eq("user_id", userId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle<CachedOverviewRow>();

  if (error) {
    console.error("Unable to read latest dashboard overview cache", error);
  }

  return data;
}

export async function readLatestSyncRun(
  userId: string,
): Promise<SyncRunStatusRow | null> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("sync_runs")
    .select("id,status,started_at,finished_at,error_message")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle<SyncRunStatusRow>();

  if (error) {
    console.error("Unable to read latest dashboard sync run", error);
  }

  return data;
}

export async function readRunningSyncRun(
  userId: string,
): Promise<SyncRunStatusRow | null> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("sync_runs")
    .select("id,status,started_at,finished_at,error_message")
    .eq("user_id", userId)
    .eq("status", "running")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle<SyncRunStatusRow>();

  if (error) {
    console.error("Unable to read running dashboard sync run", error);
  }

  return data;
}

export async function readStoredDailyTotals(
  userId: string,
): Promise<StoredDailyTotal[]> {
  const supabase = createSupabaseAdminClient();
  const since = getDashboardStartDateKey();

  const { data, error } = await supabase
    .from("contribution_daily_totals")
    .select("date,github_count,gitlab_count")
    .eq("user_id", userId)
    .gte("date", since)
    .order("date", { ascending: true });

  if (error) {
    console.error("Unable to read contribution daily totals", error);

    return [];
  }

  return (data || []).map((row) => ({
    date: String(row.date),
    github_count: Number(row.github_count) || 0,
    gitlab_count: Number(row.gitlab_count) || 0,
  }));
}

export async function saveCachedOverview(
  userId: string,
  cacheKey: string,
  overview: DashboardOverview,
) {
  const supabase = createSupabaseAdminClient();
  const expiresAt = getDashboardCacheExpiration();

  const { error } = await supabase
    .from("dashboard_overview_cache")
    .upsert({
      user_id: userId,
      cache_key: cacheKey,
      overview,
      generated_at: overview.generatedAt,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Unable to save dashboard overview cache", error);
  }

  return expiresAt;
}

export async function persistDailyTotals(
  userId: string,
  overview: DashboardOverview,
) {
  if (!overview.dailyContributions.length) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  const generatedAt = new Date().toISOString();

  const { error } = await supabase
    .from("contribution_daily_totals")
    .upsert(
      overview.dailyContributions.map((day) => ({
        user_id: userId,
        date: day.date,
        github_count: day.platforms.github,
        gitlab_count: day.platforms.gitlab,
        generated_at: generatedAt,
        updated_at: generatedAt,
      })),
      {
        onConflict: "user_id,date",
      },
    );

  if (error) {
    console.error("Unable to persist contribution daily totals", error);
  }
}

export async function markAccountsSynced(
  userId: string,
  providers: AccountProvider[],
) {
  const supabase = createSupabaseAdminClient();
  const syncedAt = new Date().toISOString();

  await Promise.all(
    providers.map(async (provider) => {
      const { error } = await supabase
        .from("connected_accounts")
        .update({
          last_sync_at: syncedAt,
        })
        .eq("user_id", userId)
        .eq("provider", provider);

      if (error) {
        console.error(
          "Unable to mark " + provider + " account as synced",
          error,
        );
      }
    }),
  );
}

function getDashboardStartDateKey() {
  const date = new Date();

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - DASHBOARD_DAYS + 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}
