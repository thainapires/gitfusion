import { AccountProvider } from "@/types/mock-app";

export type ConnectedAccountRow = {
  provider: AccountProvider;
  username: string;
  provider_user_id: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string | null;
  expires_at: string | null;
  oauth_redirect_uri: string | null;
  updated_at?: string;
  last_sync_at?: string | null;
};

export type DashboardFetchAccount = {
  provider: AccountProvider;
  username: string;
  provider_user_id: string;
  access_token: string;
};

export type DashboardCacheSource =
  | "overview_cache"
  | "daily_totals"
  | "provider_sync";

export type DashboardCacheInfo = {
  hit: boolean;
  source: DashboardCacheSource;
  expiresAt: string;
};

export type GetDashboardOverviewParams = {
  accessToken: string;
  forceRefresh?: boolean;
};