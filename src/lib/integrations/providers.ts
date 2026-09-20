export type IntegrationProvider = "github" | "gitlab";

export type ProviderProfile = {
  providerUserId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type ProviderTokenData = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_token_expires_in?: number;
  scope?: string;
  token_type?: string;
};

export function isIntegrationProvider(provider: string): provider is IntegrationProvider {
  return provider === "github" || provider === "gitlab";
}

export function getProviderConfig(provider: IntegrationProvider) {
  if (provider === "github") {
    return {
      clientId: process.env.GITHUB_OAUTH_CLIENT_ID,
      clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
      authorizationUrl: "https://github.com/login/oauth/authorize",
      tokenUrl: "https://github.com/login/oauth/access_token",
      scopes: "read:user user:email",
    };
  }

  return {
    clientId: process.env.GITLAB_OAUTH_CLIENT_ID,
    clientSecret: process.env.GITLAB_OAUTH_CLIENT_SECRET,
    authorizationUrl: "https://gitlab.com/oauth/authorize",
    tokenUrl: "https://gitlab.com/oauth/token",
    scopes: "read_user read_api",
  };
}

export function buildAuthorizationUrl({ provider, state, redirectUri }: { provider: IntegrationProvider; state: string; redirectUri: string }) {
  const config = getProviderConfig(provider);

  if (!config.clientId || !config.clientSecret) {
    throw new Error(`${provider} OAuth credentials are not configured.`);
  }

  const url = new URL(config.authorizationUrl);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scopes);
  url.searchParams.set("state", state);

  return url.toString();
}

export async function exchangeCodeForToken({ provider, code, redirectUri }: { provider: IntegrationProvider; code: string; redirectUri: string }) {
  const config = getProviderConfig(provider);

  if (!config.clientId || !config.clientSecret) {
    throw new Error(`${provider} OAuth credentials are not configured.`);
  }

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const tokenData = await response.json() as Partial<ProviderTokenData> & {
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !tokenData.access_token) {
    throw new Error(tokenData.error_description || tokenData.error || `Unable to connect ${provider}.`);
  }

  return tokenData as ProviderTokenData;
}

export async function refreshProviderToken({
  provider,
  refreshToken,
  redirectUri,
}: {
  provider: IntegrationProvider;
  refreshToken: string;
  redirectUri?: string | null;
}): Promise<ProviderTokenData> {
  const config = getProviderConfig(provider);

  if (!config.clientId || !config.clientSecret) {
    throw new Error(`${provider} OAuth credentials are not configured.`);
  }

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  if (redirectUri) {
    body.set("redirect_uri", redirectUri);
  }

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const tokenData = await response.json().catch(() => ({})) as Partial<ProviderTokenData> & {
    error?: string;
    error_description?: string;
    message?: string;
  };

  if (!response.ok || !tokenData.access_token) {
    const message = tokenData.error_description || tokenData.error || tokenData.message;
    const requiresReconnect =
      tokenData.error === "bad_refresh_token" ||
      tokenData.error === "invalid_grant";
    throw new ProviderTokenRefreshError(
      provider,
      message || `Unable to refresh ${provider} access token.`,
      response.status,
      requiresReconnect,
    );
  }

  return tokenData as ProviderTokenData;
}

export class ProviderTokenRefreshError extends Error {
  constructor(
    public readonly provider: IntegrationProvider,
    message: string,
    public readonly status: number,
    public readonly requiresReconnect: boolean,
  ) {
    super(message);
    this.name = "ProviderTokenRefreshError";
  }
}

export async function fetchProviderProfile(provider: IntegrationProvider, accessToken: string): Promise<ProviderProfile> {
  if (provider === "github") {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    const data = await response.json() as { id?: number; login?: string; name?: string | null; avatar_url?: string | null; message?: string };

    if (!response.ok || !data.id || !data.login) {
      throw new Error(data.message || "Unable to read GitHub profile.");
    }

    return {
      providerUserId: String(data.id),
      username: data.login,
      displayName: data.name || data.login,
      avatarUrl: data.avatar_url || null,
    };
  }

  const response = await fetch("https://gitlab.com/api/v4/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json() as { id?: number; username?: string; name?: string | null; avatar_url?: string | null; message?: string };

  if (!response.ok || !data.id || !data.username) {
    throw new Error(data.message || "Unable to read GitLab profile.");
  }

  return {
    providerUserId: String(data.id),
    username: data.username,
    displayName: data.name || data.username,
    avatarUrl: data.avatar_url || null,
  };
}
