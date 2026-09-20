import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildDashboardOverview } from "./overview";

describe("buildDashboardOverview", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("surfaces GitHub REST error messages from the GraphQL endpoint", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "Bad credentials" }), {
        status: 401,
        statusText: "Unauthorized",
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      buildDashboardOverview([
        {
          provider: "github",
          username: "octocat",
          provider_user_id: "1",
          access_token: "invalid-token",
        },
      ]),
    ).rejects.toThrow("Bad credentials");
  });

  it("includes the GitHub response status when the error body is empty", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response("", {
        status: 403,
        statusText: "Forbidden",
      }),
    );

    await expect(
      buildDashboardOverview([
        {
          provider: "github",
          username: "octocat",
          provider_user_id: "1",
          access_token: "limited-token",
        },
      ]),
    ).rejects.toThrow("Unable to load GitHub dashboard data (403 Forbidden).");
  });
});
