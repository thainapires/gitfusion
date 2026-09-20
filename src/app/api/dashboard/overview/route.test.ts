import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/server/errors/app-error";
import { getDashboardOverview } from "@/server/modules/dashboard/dashboard.service";
import { DashboardOverview, DashboardSyncStatus } from "@/types/dashboard";

import { GET } from "./route";

vi.mock("@/server/modules/dashboard/dashboard.service", () => ({
  getDashboardOverview: vi.fn(),
}));

const getDashboardOverviewMock = vi.mocked(getDashboardOverview);

function createRequest(
  url: string,
  init?: ConstructorParameters<typeof NextRequest>[1],
) {
  return new NextRequest(url, init);
}

function createOverview(
  overrides: Partial<DashboardOverview> = {},
): DashboardOverview {
  return {
    hasConnections: false,
    connectedProviders: [],
    metrics: [],
    activeDays: 0,
    currentStreak: 0,
    dailyContributions: [],
    recentActivity: [],
    topRepositories: [],
    generatedAt: "2026-09-13T14:00:00.000Z",
    ...overrides,
  };
}

function createSyncStatus(
  overrides: Partial<DashboardSyncStatus> = {},
): DashboardSyncStatus {
  return {
    status: "synced",
    progressPercent: 100,
    startedAt: "2026-09-13T14:00:00.000Z",
    finishedAt: "2026-09-13T14:01:00.000Z",
    errorMessage: null,
    ...overrides,
  };
}

describe("/api/dashboard/overview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects overview requests without a Supabase access token", async () => {
    const response = await GET(
      createRequest("https://gitfusion.test/api/dashboard/overview"),
    );

    await expect(response.json()).resolves.toEqual({
      error: "Missing Supabase access token.",
    });
    expect(response.status).toBe(401);
    expect(getDashboardOverviewMock).not.toHaveBeenCalled();
  });

  it("loads the dashboard overview with refresh disabled by default", async () => {
    const payload = {
      overview: createOverview(),
      cache: {
        hit: true,
        source: "overview_cache" as const,
        expiresAt: "2026-09-14T00:00:00.000Z",
      },
      sync: createSyncStatus(),
    };
    getDashboardOverviewMock.mockResolvedValue(payload);

    const response = await GET(
      createRequest("https://gitfusion.test/api/dashboard/overview", {
        headers: {
          authorization: "Bearer supabase-token",
        },
      }),
    );

    await expect(response.json()).resolves.toEqual(payload);
    expect(response.status).toBe(200);
    expect(getDashboardOverviewMock).toHaveBeenCalledWith({
      accessToken: "supabase-token",
      forceRefresh: false,
      requestOrigin: "https://gitfusion.test",
    });
  });

  it("passes through the forced refresh flag", async () => {
    getDashboardOverviewMock.mockResolvedValue({
      overview: createOverview({
        hasConnections: true,
        connectedProviders: ["github"],
      }),
      cache: {
        hit: false,
        source: "stored_snapshot" as const,
        expiresAt: "2026-09-14T00:00:00.000Z",
      },
      sync: createSyncStatus({
        status: "syncing",
        progressPercent: null,
        finishedAt: null,
      }),
    });

    const response = await GET(
      createRequest(
        "https://gitfusion.test/api/dashboard/overview?refresh=1",
        {
          headers: {
            authorization: "Bearer supabase-token",
          },
        },
      ),
    );

    expect(response.status).toBe(200);
    expect(getDashboardOverviewMock).toHaveBeenCalledWith({
      accessToken: "supabase-token",
      forceRefresh: true,
      requestOrigin: "https://gitfusion.test",
    });
  });

  it("maps known application errors from dashboard loading", async () => {
    getDashboardOverviewMock.mockRejectedValue(
      new AppError(
        "One or more connected provider tokens are unavailable. Reconnect the affected account.",
        409,
      ),
    );

    const response = await GET(
      createRequest("https://gitfusion.test/api/dashboard/overview", {
        headers: {
          authorization: "Bearer supabase-token",
        },
      }),
    );

    await expect(response.json()).resolves.toEqual({
      error:
        "One or more connected provider tokens are unavailable. Reconnect the affected account.",
    });
    expect(response.status).toBe(409);
  });
});
