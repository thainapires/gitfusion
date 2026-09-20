import {
  ProviderTokenRefreshError,
  refreshProviderToken,
} from "@/lib/integrations/providers";
import {
  decryptProviderToken,
  encryptProviderToken,
} from "@/lib/security/tokens";
import { AppError } from "@/server/errors/app-error";
import { AccountProvider } from "@/types/mock-app";

import { updateConnectedAccountTokens } from "./integration.repository";

const TOKEN_REFRESH_WINDOW_MS = 5 * 60 * 1000;

export type ProviderCredentialAccount = {
  provider: AccountProvider;
  access_token_encrypted: string;
  refresh_token_encrypted: string | null;
  expires_at: string | null;
  oauth_redirect_uri: string | null;
};

export function shouldRefreshProviderToken(
  expiresAt: string | null,
  now = Date.now(),
): boolean {
  if (!expiresAt) {
    return false;
  }

  const expiration = new Date(expiresAt).getTime();
  return !Number.isFinite(expiration) || expiration <= now + TOKEN_REFRESH_WINDOW_MS;
}

export async function getValidProviderAccessToken({
  userId,
  account,
  forceRefresh = false,
}: {
  userId: string;
  account: ProviderCredentialAccount;
  forceRefresh?: boolean;
}): Promise<string> {
  const accessToken = decryptProviderToken(account.access_token_encrypted);

  if (!accessToken) {
    throw reconnectRequiredError(account.provider);
  }

  if (!forceRefresh && !shouldRefreshProviderToken(account.expires_at)) {
    return accessToken;
  }

  const refreshToken = decryptProviderToken(account.refresh_token_encrypted);

  if (!refreshToken) {
    throw reconnectRequiredError(account.provider);
  }

  try {
    const tokenData = await refreshProviderToken({
      provider: account.provider,
      refreshToken,
      redirectUri: account.oauth_redirect_uri,
    });
    const nextRefreshToken = tokenData.refresh_token || refreshToken;
    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;
    const scopes = tokenData.scope
      ? tokenData.scope.split(/[ ,]+/).filter(Boolean)
      : null;
    const accessTokenEncrypted = encryptProviderToken(tokenData.access_token);
    const refreshTokenEncrypted = encryptProviderToken(nextRefreshToken);

    await updateConnectedAccountTokens({
      userId,
      provider: account.provider,
      accessTokenEncrypted,
      refreshTokenEncrypted,
      tokenType: tokenData.token_type ?? null,
      scopes,
      expiresAt,
      oauthRedirectUri: account.oauth_redirect_uri,
    });

    account.access_token_encrypted = accessTokenEncrypted;
    account.refresh_token_encrypted = refreshTokenEncrypted;
    account.expires_at = expiresAt;

    return tokenData.access_token;
  } catch (error) {
    if (error instanceof ProviderTokenRefreshError && error.requiresReconnect) {
      throw reconnectRequiredError(account.provider);
    }

    throw error;
  }
}

function reconnectRequiredError(provider: AccountProvider): AppError {
  const label = provider === "github" ? "GitHub" : "GitLab";
  return new AppError(
    `${label} authorization could not be renewed. Reconnect the account and try again.`,
    409,
  );
}
