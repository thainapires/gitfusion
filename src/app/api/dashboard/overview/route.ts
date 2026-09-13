import { NextRequest, NextResponse } from "next/server";
import { AccountProvider } from "../../../types/mock-app";
import { DashboardOverview } from "../../../types/dashboard";
import { buildDashboardOverview, buildDashboardOverviewFromStoredDailyTotals, StoredDailyTotal } from "../../../lib/dashboard/overview";
import { decryptProviderToken } from "../../../lib/security/tokens";
import { createSupabaseAdminClient, createSupabaseUserServerClient, isSupabaseServerConfigured } from "../../../lib/supabase/server";

type ConnectedAccountRow = {
  provider: AccountProvider;
  username: string;
  provider_user_id: string;
  access_token_encrypted: string;
  updated_at?: string;
  last_sync_at?: string | null;
};

type CachedOverviewRow = {
  overview: DashboardOverview;
  expires_at: string;
};

type SyncRunRow = {
  id: string;
};

const cacheTtlMs = 24 * 60 * 60 * 1000;
const cacheSchemaVersion = "overview-v3";
const dashboardDays = 365;

export async function GET(request: NextRequest) {
  let syncRunId: string | null = null;

  try {
    if (!isSupabaseServerConfigured()) {
      return NextResponse.json({ error: "Supabase server configuration is missing." }, { status: 500 });
    }

    const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json({ error: "Missing Supabase access token." }, { status: 401 });
    }

    const userSupabase = createSupabaseUserServerClient(accessToken);
    const { data: userData, error: userError } = await userSupabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json({ error: userError?.message || "You must be signed in." }, { status: 401 });
    }

    const userId = userData.user.id;
    const adminSupabase = createSupabaseAdminClient();
    const { data, error } = await adminSupabase
      .from("connected_accounts")
      .select("provider,username,provider_user_id,access_token_encrypted,updated_at,last_sync_at")
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const accounts = (data || []) as ConnectedAccountRow[];
    const forceRefresh = request.nextUrl.searchParams.get("refresh") === "1";
    const cacheKey = buildCacheKey(accounts);

    if (!forceRefresh) {
      const cachedOverview = await readFreshCachedOverview(adminSupabase, userId, cacheKey);

      if (cachedOverview?.overview) {
        return NextResponse.json({ overview: cachedOverview.overview, cache: { hit: true, source: "overview_cache", expiresAt: cachedOverview.expires_at } });
      }

      if (accounts.length && accounts.every(hasRecentSync)) {
        const [dailyTotals, fallbackOverview] = await Promise.all([
          readStoredDailyTotals(adminSupabase, userId),
          readLatestCachedOverview(adminSupabase, userId),
        ]);

        if (dailyTotals.length) {
          const overview = buildDashboardOverviewFromStoredDailyTotals({
            providers: accounts.map((account) => account.provider),
            rows: dailyTotals,
            fallbackOverview: fallbackOverview?.overview,
          });
          const expiresAt = await saveCachedOverview(adminSupabase, userId, cacheKey, overview);

          return NextResponse.json({ overview, cache: { hit: false, source: "daily_totals", expiresAt } });
        }
      }
    }

    const fetchAccounts = accounts.map((account) => ({
      provider: account.provider,
      username: account.username,
      provider_user_id: account.provider_user_id,
      access_token: decryptProviderToken(account.access_token_encrypted),
    })).filter((account): account is { provider: AccountProvider; username: string; provider_user_id: string; access_token: string } => Boolean(account.access_token));

    if (accounts.length && fetchAccounts.length !== accounts.length) {
      return NextResponse.json({ error: "One or more connected provider tokens are unavailable. Reconnect the affected account." }, { status: 409 });
    }

    syncRunId = await startSyncRun(adminSupabase, userId);
    const overview = await buildDashboardOverview(fetchAccounts);
    await persistDailyTotals(adminSupabase, userId, overview);
    await markAccountsSynced(adminSupabase, userId, fetchAccounts.map((account) => account.provider));
    const expiresAt = await saveCachedOverview(adminSupabase, userId, cacheKey, overview);
    await finishSyncRun(adminSupabase, syncRunId, "succeeded", overview.dailyContributions.length);

    return NextResponse.json({ overview, cache: { hit: false, source: "provider_sync", expiresAt } });
  } catch (error) {
    console.error("Unable to load dashboard overview", error);

    if (syncRunId) {
      try {
        const adminSupabase = createSupabaseAdminClient();
        await finishSyncRun(adminSupabase, syncRunId, "failed", 0, error instanceof Error ? error.message : "Unable to load dashboard overview.");
      } catch (syncError) {
        console.error("Unable to mark dashboard sync as failed", syncError);
      }
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load dashboard overview." }, { status: 500 });
  }
}

function buildCacheKey(accounts: ConnectedAccountRow[]) {
  if (!accounts.length) {
    return `${cacheSchemaVersion}:no-connections`;
  }

  const accountsKey = accounts
    .map((account) => `${account.provider}:${account.provider_user_id}:${account.updated_at || ""}:${account.last_sync_at || ""}`)
    .sort()
    .join("|");

  return `${cacheSchemaVersion}:${accountsKey}`;
}

function hasRecentSync(account: ConnectedAccountRow) {
  return Boolean(account.last_sync_at && Date.now() - new Date(account.last_sync_at).getTime() < cacheTtlMs);
}

async function readFreshCachedOverview(adminSupabase: ReturnType<typeof createSupabaseAdminClient>, userId: string, cacheKey: string) {
  const { data, error } = await adminSupabase
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

async function readLatestCachedOverview(adminSupabase: ReturnType<typeof createSupabaseAdminClient>, userId: string) {
  const { data, error } = await adminSupabase
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

async function readStoredDailyTotals(adminSupabase: ReturnType<typeof createSupabaseAdminClient>, userId: string) {
  const since = startDateKey();
  const { data, error } = await adminSupabase
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
  })) satisfies StoredDailyTotal[];
}

async function saveCachedOverview(adminSupabase: ReturnType<typeof createSupabaseAdminClient>, userId: string, cacheKey: string, overview: DashboardOverview) {
  const expiresAt = new Date(Date.now() + cacheTtlMs).toISOString();
  const { error } = await adminSupabase.from("dashboard_overview_cache").upsert({
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

async function persistDailyTotals(adminSupabase: ReturnType<typeof createSupabaseAdminClient>, userId: string, overview: DashboardOverview) {
  if (!overview.dailyContributions.length) {
    return;
  }

  const generatedAt = new Date().toISOString();
  const { error } = await adminSupabase.from("contribution_daily_totals").upsert(
    overview.dailyContributions.map((day) => ({
      user_id: userId,
      date: day.date,
      github_count: day.platforms.github,
      gitlab_count: day.platforms.gitlab,
      generated_at: generatedAt,
      updated_at: generatedAt,
    })),
    { onConflict: "user_id,date" },
  );

  if (error) {
    console.error("Unable to persist contribution daily totals", error);
  }
}

async function markAccountsSynced(adminSupabase: ReturnType<typeof createSupabaseAdminClient>, userId: string, providers: AccountProvider[]) {
  await Promise.all(providers.map(async (provider) => {
    const { error } = await adminSupabase
      .from("connected_accounts")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("provider", provider);

    if (error) {
      console.error(`Unable to mark ${provider} account as synced`, error);
    }
  }));
}

async function startSyncRun(adminSupabase: ReturnType<typeof createSupabaseAdminClient>, userId: string) {
  const { data, error } = await adminSupabase
    .from("sync_runs")
    .insert({ user_id: userId, provider: null, status: "running" })
    .select("id")
    .single<SyncRunRow>();

  if (error) {
    console.error("Unable to start dashboard sync run", error);
    return null;
  }

  return data.id;
}

async function finishSyncRun(
  adminSupabase: ReturnType<typeof createSupabaseAdminClient>,
  syncRunId: string | null,
  status: "succeeded" | "failed",
  itemsSynced: number,
  errorMessage?: string,
) {
  if (!syncRunId) {
    return;
  }

  const { error } = await adminSupabase
    .from("sync_runs")
    .update({
      status,
      finished_at: new Date().toISOString(),
      items_synced: itemsSynced,
      error_message: errorMessage ? redactSensitiveText(errorMessage) : null,
    })
    .eq("id", syncRunId);

  if (error) {
    console.error("Unable to finish dashboard sync run", error);
  }
}

function startDateKey() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - dashboardDays + 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function redactSensitiveText(value: string) {
  return value.replace(/gh[opsu]_[A-Za-z0-9_]+/g, "[redacted]").replace(/glpat-[A-Za-z0-9_-]+/g, "[redacted]");
}
