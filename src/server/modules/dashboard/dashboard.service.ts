import { AccountProvider } from "@/types/mock-app";
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
  readStoredDailyTotals,
  saveCachedOverview,
} from "./dashboard.repository";
import { ConnectedAccountRow } from "./dashboard.types";
import { getAuthenticatedUser } from "@/server/auth/auth.service";
import { AppError } from "@/server/errors/app-error";

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
    const cachedResult = await getCachedDashboardOverview({
      userId,
      accounts,
      cacheKey,
    });

    if (cachedResult) {
      return cachedResult;
    }
  }

  return syncDashboardOverview({
    userId,
    accounts,
    cacheKey,
  });
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

async function getCachedDashboardOverview({
  userId,
  accounts,
  cacheKey,
}: {
  userId: string;
  accounts: ConnectedAccountRow[];
  cacheKey: string;
}) {
  const cachedOverview = await readFreshCachedOverview(userId, cacheKey);

  if (cachedOverview?.overview) {
    return {
      overview: cachedOverview.overview,
      cache: {
        hit: true,
        source: "overview_cache" as const,
        expiresAt: cachedOverview.expires_at,
      },
    };
  }

  if (!accounts.length || !accounts.every(hasRecentSync)) {
    return null;
  }

  const [dailyTotals, fallbackOverview] = await Promise.all([
    readStoredDailyTotals(userId),
    readLatestCachedOverview(userId),
  ]);

  if (!dailyTotals.length) {
    return null;
  }

  const overview = buildDashboardOverviewFromStoredDailyTotals({
    providers: accounts.map((account) => account.provider),
    rows: dailyTotals,
    fallbackOverview: fallbackOverview?.overview,
  });

  const expiresAt = await saveCachedOverview(
    userId,
    cacheKey,
    overview,
  );

  return {
    overview,
    cache: {
      hit: false,
      source: "daily_totals" as const,
      expiresAt,
    },
  };
}

async function syncDashboardOverview({
  userId,
  accounts,
  cacheKey,
}: {
  userId: string;
  accounts: ConnectedAccountRow[];
  cacheKey: string;
}) {
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

  let syncRunId: string | null = null;

  try {
    syncRunId = await startSyncRun(userId);

    const overview = await buildDashboardOverview(fetchAccounts);

    await persistDailyTotals(userId, overview);

    await markAccountsSynced(
      userId,
      fetchAccounts.map((account) => account.provider),
    );

    const expiresAt = await saveCachedOverview(
      userId,
      cacheKey,
      overview,
    );

    await finishSyncRun(
      syncRunId,
      "succeeded",
      overview.dailyContributions.length,
    );

    return {
      overview,
      cache: {
        hit: false,
        source: "provider_sync" as const,
        expiresAt,
      },
    };
  } catch (error) {
    if (syncRunId) {
      try {
        await finishSyncRun(
          syncRunId,
          "failed",
          0,
          error instanceof Error
            ? error.message
            : "Unable to load dashboard overview.",
        );
      } catch (syncError) {
        console.error(
          "Unable to mark dashboard sync as failed",
          syncError,
        );
      }
    }

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

async function startSyncRun(userId: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("sync_runs")
    .insert({
      user_id: userId,
      provider: null,
      status: "running",
    })
    .select("id")
    .single<SyncRunRow>();

  if (error) {
    console.error("Unable to start dashboard sync run", error);

    return null;
  }

  return data.id;
}

async function finishSyncRun(
  syncRunId: string | null,
  status: "succeeded" | "failed",
  itemsSynced: number,
  errorMessage?: string,
) {
  if (!syncRunId) {
    return;
  }

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