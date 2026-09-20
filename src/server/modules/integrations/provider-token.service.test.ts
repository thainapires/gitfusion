import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ProviderTokenRefreshError,
  refreshProviderToken,
} from "@/lib/integrations/providers";
import { decryptProviderToken, encryptProviderToken } from "@/lib/security/tokens";

import { updateConnectedAccountTokens } from "./integration.repository";
import {
  getValidProviderAccessToken,
  shouldRefreshProviderToken,
} from "./provider-token.service";

vi.mock("@/lib/integrations/providers", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/integrations/providers")>();

  return {
    ...original,
    refreshProviderToken: vi.fn(),
  };
});

vi.mock("./integration.repository", () => ({
  updateConnectedAccountTokens: vi.fn(),
}));

const refreshProviderTokenMock = vi.mocked(refreshProviderToken);
const updateConnectedAccountTokensMock = vi.mocked(updateConnectedAccountTokens);

function createAccount(overrides: Partial<{
  provider: "github" | "gitlab";
  access_token_encrypted: string;
  refresh_token_encrypted: string | null;
  expires_at: string | null;
  oauth_redirect_uri: string | null;
}> = {}) {
  return {
    provider: "github" as const,
    access_token_encrypted: encryptProviderToken("current-access-token"),
    refresh_token_encrypted: encryptProviderToken("current-refresh-token"),
    expires_at: "2099-01-01T00:00:00.000Z",
    oauth_redirect_uri: "https://gitfusion.test/api/integrations/github/callback",
    ...overrides,
  };
}

describe("provider token service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GITFUSION_TOKEN_ENCRYPTION_KEY = "provider-token-service-test-key";
  });

  it("uses an access token that is valid for more than five minutes", async () => {
    const token = await getValidProviderAccessToken({
      userId: "user-1",
      account: createAccount(),
    });

    expect(token).toBe("current-access-token");
    expect(refreshProviderTokenMock).not.toHaveBeenCalled();
    expect(updateConnectedAccountTokensMock).not.toHaveBeenCalled();
  });

  it("refreshes and persists rotated credentials before expiration", async () => {
    refreshProviderTokenMock.mockResolvedValue({
      access_token: "next-access-token",
      refresh_token: "next-refresh-token",
      expires_in: 7200,
      token_type: "bearer",
      scope: "read_user read_api",
    });
    const account = createAccount({
      provider: "gitlab",
      expires_at: "2020-01-01T00:00:00.000Z",
      oauth_redirect_uri: "https://gitfusion.test/api/integrations/gitlab/callback",
    });

    const token = await getValidProviderAccessToken({
      userId: "user-1",
      account,
    });

    expect(token).toBe("next-access-token");
    expect(refreshProviderTokenMock).toHaveBeenCalledWith({
      provider: "gitlab",
      refreshToken: "current-refresh-token",
      redirectUri: "https://gitfusion.test/api/integrations/gitlab/callback",
    });
    expect(updateConnectedAccountTokensMock).toHaveBeenCalledOnce();

    const update = updateConnectedAccountTokensMock.mock.calls[0][0];
    expect(update).toMatchObject({
      userId: "user-1",
      provider: "gitlab",
      tokenType: "bearer",
      scopes: ["read_user", "read_api"],
    });
    expect(decryptProviderToken(update.accessTokenEncrypted)).toBe("next-access-token");
    expect(decryptProviderToken(update.refreshTokenEncrypted)).toBe("next-refresh-token");
  });

  it("requires reconnection only when the refresh credential is rejected", async () => {
    refreshProviderTokenMock.mockRejectedValue(
      new ProviderTokenRefreshError("github", "bad_refresh_token", 400, true),
    );

    await expect(
      getValidProviderAccessToken({
        userId: "user-1",
        account: createAccount({
          expires_at: "2020-01-01T00:00:00.000Z",
        }),
      }),
    ).rejects.toThrow(
      "GitHub authorization could not be renewed. Reconnect the account and try again.",
    );
  });
});

describe("shouldRefreshProviderToken", () => {
  it("refreshes tokens inside the five minute safety window", () => {
    const now = Date.parse("2026-09-19T12:00:00.000Z");

    expect(
      shouldRefreshProviderToken("2026-09-19T12:04:59.000Z", now),
    ).toBe(true);
    expect(
      shouldRefreshProviderToken("2026-09-19T12:05:01.000Z", now),
    ).toBe(false);
    expect(shouldRefreshProviderToken(null, now)).toBe(false);
  });
});
