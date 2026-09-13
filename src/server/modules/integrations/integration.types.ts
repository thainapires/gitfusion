import { AccountProvider } from "@/types/mock-app";

export type OAuthStateRow = {
  state: string;
  user_id: string;
  provider: AccountProvider;
  redirect_to: string | null;
  expires_at: string;
};

export type ConnectedAccountRow = {
  provider: AccountProvider;
  provider_user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  scopes: string[];
  connected_at: string;
  updated_at: string;
};

export type StartIntegrationParams = {
  provider: AccountProvider;
  userId: string;
  redirectTo: string;
  redirectUri: string;
};

export type CompleteIntegrationParams = {
  provider: AccountProvider;
  code: string;
  state: string;
  redirectUri: string;
};

export type RouteContext = {
  params: Promise<{
    provider: string;
  }>;
};