import { ConnectedAccountRow } from "./dashboard.types";

export const DASHBOARD_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const DASHBOARD_CACHE_SCHEMA_VERSION = "overview-v3";

export function buildDashboardCacheKey(accounts: ConnectedAccountRow[]) {
  if (!accounts.length) {
    return `${DASHBOARD_CACHE_SCHEMA_VERSION}:no-connections`;
  }

  const accountsKey = accounts
    .map(
      (account) =>
        `${account.provider}:${account.provider_user_id}:${account.updated_at || ""}:${account.last_sync_at || ""}`,
    )
    .sort()
    .join("|");

  return `${DASHBOARD_CACHE_SCHEMA_VERSION}:${accountsKey}`;
}

export function hasRecentSync(account: ConnectedAccountRow) {
  if (!account.last_sync_at) {
    return false;
  }

  const lastSyncAt = new Date(account.last_sync_at).getTime();

  return Date.now() - lastSyncAt < DASHBOARD_CACHE_TTL_MS;
}

export function getDashboardCacheExpiration() {
  return new Date(Date.now() + DASHBOARD_CACHE_TTL_MS).toISOString();
}