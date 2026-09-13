import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/server/errors/app-error";
import {
  disconnectIntegration,
  getUserConnectedAccounts,
} from "@/server/modules/integrations/integration.service";
import { getAuthenticatedUser } from "@/server/auth/auth.service";

import { DELETE, GET } from "./route";

vi.mock("@/server/auth/auth.service", () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock("@/server/modules/integrations/integration.service", () => ({
  disconnectIntegration: vi.fn(),
  getUserConnectedAccounts: vi.fn(),
}));

const getAuthenticatedUserMock = vi.mocked(getAuthenticatedUser);
const getUserConnectedAccountsMock = vi.mocked(getUserConnectedAccounts);
const disconnectIntegrationMock = vi.mocked(disconnectIntegration);

function createRequest(
  url: string,
  init?: ConstructorParameters<typeof NextRequest>[1],
) {
  return new NextRequest(url, init);
}

describe("/api/integrations/accounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects account reads without a Supabase access token", async () => {
    const response = await GET(
      createRequest("https://gitfusion.test/api/integrations/accounts"),
    );

    await expect(response.json()).resolves.toEqual({
      error: "Missing Supabase access token.",
    });
    expect(response.status).toBe(401);
    expect(getAuthenticatedUserMock).not.toHaveBeenCalled();
  });

  it("returns connected accounts for the authenticated user", async () => {
    getAuthenticatedUserMock.mockResolvedValue({
      id: "user-1",
      email: "thai@example.com",
    });
    getUserConnectedAccountsMock.mockResolvedValue([
      {
        provider: "github",
        provider_user_id: "42",
        username: "thai",
        display_name: "Thai",
        avatar_url: null,
        scopes: ["read:user"],
        connected_at: "2026-09-13T14:00:00.000Z",
        updated_at: "2026-09-13T14:00:00.000Z",
      },
    ]);

    const response = await GET(
      createRequest("https://gitfusion.test/api/integrations/accounts", {
        headers: {
          authorization: "Bearer supabase-token",
        },
      }),
    );

    await expect(response.json()).resolves.toEqual({
      accounts: [
        {
          provider: "github",
          provider_user_id: "42",
          username: "thai",
          display_name: "Thai",
          avatar_url: null,
          scopes: ["read:user"],
          connected_at: "2026-09-13T14:00:00.000Z",
          updated_at: "2026-09-13T14:00:00.000Z",
        },
      ],
    });
    expect(response.status).toBe(200);
    expect(getAuthenticatedUserMock).toHaveBeenCalledWith(
      "supabase-token",
    );
    expect(getUserConnectedAccountsMock).toHaveBeenCalledWith("user-1");
  });

  it("maps known application errors when reading accounts", async () => {
    getAuthenticatedUserMock.mockRejectedValue(
      new AppError("You must be signed in.", 401),
    );

    const response = await GET(
      createRequest("https://gitfusion.test/api/integrations/accounts", {
        headers: {
          authorization: "Bearer expired-token",
        },
      }),
    );

    await expect(response.json()).resolves.toEqual({
      error: "You must be signed in.",
    });
    expect(response.status).toBe(401);
  });

  it("rejects disconnect requests for unsupported providers", async () => {
    const response = await DELETE(
      createRequest(
        "https://gitfusion.test/api/integrations/accounts?provider=bitbucket",
        {
          headers: {
            authorization: "Bearer supabase-token",
          },
        },
      ),
    );

    await expect(response.json()).resolves.toEqual({
      error: "Unsupported integration provider.",
    });
    expect(response.status).toBe(400);
    expect(disconnectIntegrationMock).not.toHaveBeenCalled();
  });

  it("disconnects a supported provider for the authenticated user", async () => {
    getAuthenticatedUserMock.mockResolvedValue({
      id: "user-1",
      email: null,
    });

    const response = await DELETE(
      createRequest(
        "https://gitfusion.test/api/integrations/accounts?provider=gitlab",
        {
          headers: {
            authorization: "Bearer supabase-token",
          },
        },
      ),
    );

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(response.status).toBe(200);
    expect(disconnectIntegrationMock).toHaveBeenCalledWith(
      "user-1",
      "gitlab",
    );
  });
});
