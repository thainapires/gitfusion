import { describe, expect, it } from "vitest";
import { buildDemoDashboardOverview } from "./demo-dashboard";

describe("buildDemoDashboardOverview", () => {
  it("builds a complete, internally consistent year of sample data", () => {
    const overview = buildDemoDashboardOverview(new Date(2026, 8, 20));

    expect(overview.hasConnections).toBe(true);
    expect(overview.connectedProviders).toEqual(["github", "gitlab"]);
    expect(overview.dailyContributions).toHaveLength(365);
    expect(overview.dailyContributions.at(-1)?.date).toBe("2026-09-20");
    expect(overview.dailyContributions.slice(-9).every((day) => day.total > 0)).toBe(true);
    expect(overview.dailyContributions.at(-10)?.total).toBe(0);
    expect(overview.dailyContributions.every((day) => day.total === day.platforms.github + day.platforms.gitlab)).toBe(true);
    expect(overview.topRepositories.length).toBeGreaterThan(0);
    expect(overview.recentActivity.length).toBeGreaterThan(0);
  });
});
