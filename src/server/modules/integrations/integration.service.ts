import {
  buildAuthorizationUrl,
  exchangeCodeForToken,
  fetchProviderProfile,
} from "@/lib/integrations/providers";
import { encryptProviderToken } from "@/lib/security/tokens";
import { AppError } from "@/server/errors/app-error";
import { AccountProvider } from "@/types/mock-app";

import {
  deleteConnectedAccount,
  getConnectedAccounts,
  invalidateDashboardCache,
  saveConnectedAccount,
} from "./integration.repository";
import {
  createOAuthState,
  deleteOAuthState,
  findOAuthState,
} from "./oauth.repository";
import {
  CompleteIntegrationParams,
  StartIntegrationParams,
} from "./integration.types";

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

export async function startIntegration({
  provider,
  userId,
  redirectTo,
  redirectUri,
}: StartIntegrationParams) {
  const state = crypto.randomUUID();

  const expiresAt = new Date(
    Date.now() + OAUTH_STATE_TTL_MS,
  ).toISOString();

  await createOAuthState({
    state,
    userId,
    provider,
    redirectTo,
    expiresAt,
  });

  const authorizationUrl = buildAuthorizationUrl({
    provider,
    state,
    redirectUri,
  });

  return {
    authorizationUrl,
  };
}

export async function completeIntegration({
  provider,
  code,
  state,
  redirectUri,
}: CompleteIntegrationParams) {
  const stateRow = await findOAuthState(state, provider);

  if (!stateRow) {
    throw new AppError(
      "Invalid OAuth state. Try connecting again.",
      400,
    );
  }

  await deleteOAuthState(state);

  if (new Date(stateRow.expires_at).getTime() < Date.now()) {
    throw new AppError(
      "OAuth state expired. Try connecting again.",
      400,
    );
  }

  const tokenData = await exchangeCodeForToken({
    provider,
    code,
    redirectUri,
  });

  if (!tokenData.access_token) {
    throw new AppError(
      `Unable to retrieve access token from ${provider}.`,
      502,
    );
  }

  const profile = await fetchProviderProfile(
    provider,
    tokenData.access_token,
  );

  const expiresAt = tokenData.expires_in
    ? new Date(
        Date.now() + tokenData.expires_in * 1000,
      ).toISOString()
    : null;

  const accessTokenEncrypted = encryptProviderToken(
    tokenData.access_token,
  );

  const refreshTokenEncrypted = tokenData.refresh_token
    ? encryptProviderToken(tokenData.refresh_token)
    : null;

  const scopes = tokenData.scope
    ? tokenData.scope.split(/[ ,]+/).filter(Boolean)
    : [];

  await saveConnectedAccount({
    userId: stateRow.user_id,
    provider,
    providerUserId: profile.providerUserId,
    username: profile.username,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    accessTokenEncrypted,
    refreshTokenEncrypted,
    tokenType: tokenData.token_type ?? null,
    scopes,
    expiresAt,
    oauthRedirectUri: redirectUri,
  });

  await invalidateDashboardCache(stateRow.user_id);

  return {
    provider,
    redirectTo:
      stateRow.redirect_to ?? "/connect-accounts",
  };
}

export async function getUserConnectedAccounts(
  userId: string,
) {
  return getConnectedAccounts(userId);
}

export async function disconnectIntegration(
  userId: string,
  provider: AccountProvider,
) {
  await deleteConnectedAccount(userId, provider);
  await invalidateDashboardCache(userId);
}