import { after } from "next/server";

import { AccountProvider } from "@/types/mock-app";
import { DashboardSyncStatus } from "@/types/dashboard";
import {
  buildDashboardOverview,
  buildDashboardOverviewFromStoredDailyTotals,
} from "@/lib/dashboard/overview";
import { decryptProviderToken } from "@/lib/security/tokens";
import {
  createSupabaseAdminClient,
} from "@/lib/supabase/server";

import {
  buildDashboardCacheKey,
  hasRecentSync,
} from "./dashboard.cache";
import {
  markAccountsSynced,
  persistDailyTotals,
  readFreshCachedOverview,
  readLatestCachedOverview,
  readLatestSyncRun,
  readRunningSyncRun,
  readStoredDailyTotals,
  saveCachedOverview,
  SyncRunStatusRow,
} from "./dashboard.repository";
import { ConnectedAccountRow } from "./dashboard.types";
import { getAuthenticatedUser } from "@/server/auth/auth.service";
import { AppError } from "@/server/errors/app-error";

const STALE_RUNNING_SYNC_MS = 15 * 60 * 1000;

type GetDashboardOverviewParams = {
  accessToken: string;
  forceRefresh?: boolean;
};

type FetchAccount = {
  provider: AccountProvider;
  username: string;
  provider_user_id: string;
  access_token: string;
};

type SyncRunRow = {
  id: string;
};

export async function getDashboardOverview({
  accessToken,
  forceRefresh = false,
}: GetDashboardOverviewParams) {
  const { id: userId } = await getAuthenticatedUser(accessToken);
  const accounts = await getConnectedAccounts(userId);
  const cacheKey = buildDashboardCacheKey(accounts);

  if (!forceRefresh) {
    const cachedOverview = await readFreshCachedOverview(userId, cacheKey);

    if (cachedOverview?.overview) {
      return {
        overview: cachedOverview.overview,
        cache: {
          hit: true,
          source: "overview_cache" as const,
          expiresAt: cachedOverview.expires_at,
        },
        sync: await getDashboardSyncStatus(userId),
      };
    }
  }

  const storedResult = await getStoredDashboardOverview({
    userId,
    accounts,
    cacheKey,
  });

  let sync = await getDashboardSyncStatus(userId);

  if (shouldStartSync({ accounts, forceRefresh, sync })) {
    const started = await scheduleDashboardSync({
      userId,
      accounts,
      cacheKey,
    });

    if (started) {
      sync = syncStatusFromRun(started);
    }
  }

  if (storedResult) {
    return {
      ...storedResult,
      sync,
    };
  }

  const overview = buildDashboardOverviewFromStoredDailyTotals({
    providers: accounts.map((account) => account.provider),
    rows: [],
  });

  const expiresAt = accounts.length
    ? new Date().toISOString()
    : await saveCachedOverview(userId, cacheKey, overview);

  return {
    overview,
    cache: {
      hit: false,
      source: "empty_state" as const,
      expiresAt,
    },
    sync,
  };
}

async function getConnectedAccounts(
  userId: string,
): Promise<ConnectedAccountRow[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("connected_accounts")
    .select(
      "provider,username,provider_user_id,access_token_encrypted,updated_at,last_sync_at",
    )
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as ConnectedAccountRow[];
}

async function getStoredDashboardOverview({
  userId,
  accounts,
  cacheKey,
}: {
  userId: string;
  accounts: ConnectedAccountRow[];
  cacheKey: string;
}) {
  const [dailyTotals, fallbackOverview] = await Promise.all([
    readStoredDailyTotals(userId),
    readLatestCachedOverview(userId),
  ]);

  if (!dailyTotals.length && !fallbackOverview?.overview) {
    return null;
  }

  const overview = dailyTotals.length
    ? buildDashboardOverviewFromStoredDailyTotals({
        providers: accounts.map((account) => account.provider),
        rows: dailyTotals,
        fallbackOverview: fallbackOverview?.overview,
      })
    : fallbackOverview?.overview;

  if (!overview) {
    return null;
  }

  const expiresAt = await saveCachedOverview(
    userId,
    cacheKey,
    overview,
  );

  return {
    overview,
    cache: {
      hit: false,
      source: "stored_snapshot" as const,
      expiresAt,
    },
  };
}

function shouldStartSync({
  accounts,
  forceRefresh,
  sync,
}: {
  accounts: ConnectedAccountRow[];
  forceRefresh: boolean;
  sync: DashboardSyncStatus;
}) {
  if (!accounts.length) {
    return false;
  }

  if (sync.status === "syncing") {
    return false;
  }

  return forceRefresh || !accounts.every(hasRecentSync);
}

async function scheduleDashboardSync({
  userId,
  accounts,
  cacheKey,
}: {
  userId: string;
  accounts: ConnectedAccountRow[];
  cacheKey: string;
}) {
  const runningSync = await readRunningSyncRun(userId);

  if (runningSync && !isStaleRunningSync(runningSync)) {
    return runningSync;
  }

  const syncRun = await startSyncRun(userId);

  if (!syncRun) {
    return null;
  }

  after(async () => {
    try {
      await syncDashboardOverview({
        userId,
        accounts,
        cacheKey,
        syncRunId: syncRun.id,
      });
    } catch (error) {
      console.error("Dashboard background sync failed", error);
    }
  });

  return {
    id: syncRun.id,
    status: "running" as const,
    started_at: syncRun.startedAt,
    finished_at: null,
    error_message: null,
  };
}

async function syncDashboardOverview({
  userId,
  accounts,
  cacheKey,
  syncRunId,
}: {
  userId: string;
  accounts: ConnectedAccountRow[];
  cacheKey: string;
  syncRunId: string;
}) {
  try {
    const fetchAccounts = getFetchAccounts(accounts);

    if (
      accounts.length &&
      fetchAccounts.length !== accounts.length
    ) {
      throw new AppError(
        "One or more connected provider tokens are unavailable. Reconnect the affected account.",
        409,
      );
    }

    const overview = await buildDashboardOverview(fetchAccounts);

    await persistDailyTotals(userId, overview);

    await markAccountsSynced(
      userId,
      fetchAccounts.map((account) => account.provider),
    );

    await saveCachedOverview(
      userId,
      cacheKey,
      overview,
    );

    await finishSyncRun(
      syncRunId,
      "succeeded",
      overview.dailyContributions.length,
    );
  } catch (error) {
    await finishSyncRun(
      syncRunId,
      "failed",
      0,
      error instanceof Error
        ? error.message
        : "Unable to load dashboard overview.",
    );

    throw error;
  }
}

function getFetchAccounts(
  accounts: ConnectedAccountRow[],
): FetchAccount[] {
  return accounts
    .map((account) => ({
      provider: account.provider,
      username: account.username,
      provider_user_id: account.provider_user_id,
      access_token: decryptProviderToken(
        account.access_token_encrypted,
      ),
    }))
    .filter(
      (account): account is FetchAccount =>
        Boolean(account.access_token),
    );
}

async function getDashboardSyncStatus(
  userId: string,
): Promise<DashboardSyncStatus> {
  const syncRun = await readLatestSyncRun(userId);

  if (!syncRun) {
    return {
      status: "idle",
      progressPercent: null,
      startedAt: null,
      finishedAt: null,
      errorMessage: null,
    };
  }

  return syncStatusFromRun(syncRun);
}

function syncStatusFromRun(
  syncRun: SyncRunStatusRow,
): DashboardSyncStatus {
  if (syncRun.status === "running" && !isStaleRunningSync(syncRun)) {
    return {
      status: "syncing",
      progressPercent: null,
      startedAt: syncRun.started_at,
      finishedAt: null,
      errorMessage: null,
    };
  }

  if (syncRun.status === "succeeded") {
    return {
      status: "synced",
      progressPercent: 100,
      startedAt: syncRun.started_at,
      finishedAt: syncRun.finished_at,
      errorMessage: null,
    };
  }

  return {
    status: "failed",
    progressPercent: null,
    startedAt: syncRun.started_at,
    finishedAt: syncRun.finished_at,
    errorMessage: syncRun.error_message,
  };
}

function isStaleRunningSync(syncRun: SyncRunStatusRow) {
  return (
    Date.now() - new Date(syncRun.started_at).getTime() >
    STALE_RUNNING_SYNC_MS
  );
}

async function startSyncRun(userId: string) {
  const supabase = createSupabaseAdminClient();
  const startedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("sync_runs")
    .insert({
      user_id: userId,
      provider: null,
      status: "running",
      started_at: startedAt,
    })
    .select("id")
    .single<SyncRunRow>();

  if (error) {
    console.error("Unable to start dashboard sync run", error);

    return null;
  }

  return {
    id: data.id,
    startedAt,
  };
}

async function finishSyncRun(
  syncRunId: string,
  status: "succeeded" | "failed",
  itemsSynced: number,
  errorMessage?: string,
) {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("sync_runs")
    .update({
      status,
      finished_at: new Date().toISOString(),
      items_synced: itemsSynced,
      error_message: errorMessage
        ? redactSensitiveText(errorMessage)
        : null,
    })
    .eq("id", syncRunId);

  if (error) {
    console.error("Unable to finish dashboard sync run", error);
  }
}

function redactSensitiveText(value: string) {
  return value
    .replace(
      /gh[opsu]_[A-Za-z0-9_]+/g,
      "[redacted]",
    )
    .replace(
      /glpat-[A-Za-z0-9_-]+/g,
      "[redacted]",
    );
}
