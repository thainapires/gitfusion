import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ProviderTokenRefreshError,
  refreshProviderToken,
} from "./providers";

describe("refreshProviderToken", () => {
  beforeEach(() => {
    process.env.GITHUB_OAUTH_CLIENT_ID = "github-client";
    process.env.GITHUB_OAUTH_CLIENT_SECRET = "github-secret";
    process.env.GITLAB_OAUTH_CLIENT_ID = "gitlab-client";
    process.env.GITLAB_OAUTH_CLIENT_SECRET = "gitlab-secret";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("exchanges a GitLab refresh token for a new token pair", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "new-access",
          refresh_token: "new-refresh",
          expires_in: 7200,
          token_type: "Bearer",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      refreshProviderToken({
        provider: "gitlab",
        refreshToken: "old-refresh",
      }),
    ).resolves.toMatchObject({
      access_token: "new-access",
      refresh_token: "new-refresh",
      expires_in: 7200,
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://gitlab.com/oauth/token");
    expect(init.method).toBe("POST");
    expect(String(init.body)).toContain("grant_type=refresh_token");
    expect(String(init.body)).toContain("refresh_token=old-refresh");
  });

  it("distinguishes rejected refresh credentials from temporary failures", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: "invalid_grant" }),
          { status: 400 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ message: "temporarily unavailable" }),
          { status: 503 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    const rejected = refreshProviderToken({
      provider: "github",
      refreshToken: "rejected-refresh",
    });
    await expect(rejected).rejects.toMatchObject({
      name: "ProviderTokenRefreshError",
      requiresReconnect: true,
    } satisfies Partial<ProviderTokenRefreshError>);

    const temporary = refreshProviderToken({
      provider: "github",
      refreshToken: "valid-refresh",
    });
    await expect(temporary).rejects.toMatchObject({
      name: "ProviderTokenRefreshError",
      requiresReconnect: false,
    } satisfies Partial<ProviderTokenRefreshError>);
  });
});
