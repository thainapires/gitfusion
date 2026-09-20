import type { DashboardOverview, DashboardSyncStatus } from "@/types/dashboard";
import type { DailyContribution } from "@/types/mock-app";

const DAY_IN_MS = 86_400_000;
const DEMO_DAYS = 365;

export const demoSyncStatus: DashboardSyncStatus = {
  status: "synced",
  progressPercent: 100,
  startedAt: "2026-09-20T14:28:00.000Z",
  finishedAt: "2026-09-20T14:28:08.000Z",
  errorMessage: null,
};

export function buildDemoDashboardOverview(now = new Date()): DashboardOverview {
  const dailyContributions = buildDailyContributions(now);
  const activeDays = dailyContributions.filter((day) => day.total > 0).length;

  return {
    hasConnections: true,
    connectedProviders: ["github", "gitlab"],
    metrics: [
      { label: "Pull / merge requests", value: "86", helper: "Across GitHub and GitLab", trend: "+14% from last period" },
    ],
    activeDays,
    currentStreak: 9,
    dailyContributions,
    recentActivity: [
      { id: "demo-1", title: "Merged pull request", description: "feat: add team activity insights · gitfusion/web", platform: "github", time: "2 hours ago" },
      { id: "demo-2", title: "Pushed 4 commits", description: "Improve dashboard accessibility · atlas-ui", platform: "gitlab", time: "Yesterday" },
      { id: "demo-3", title: "Opened pull request", description: "refactor: simplify provider adapters · gitfusion/api", platform: "github", time: "2 days ago" },
      { id: "demo-4", title: "Created release v2.4.0", description: "Performance and chart improvements · pulse", platform: "gitlab", time: "4 days ago" },
      { id: "demo-5", title: "Reviewed pull request", description: "Add repository filters · open-work", platform: "github", time: "5 days ago" },
    ],
    topRepositories: [
      { name: "gitfusion", platform: "github", language: "TypeScript", contributions: 284, visibility: "Public" },
      { name: "atlas-ui", platform: "gitlab", language: "TypeScript", contributions: 193, visibility: "Private" },
      { name: "pulse-api", platform: "github", language: "Python", contributions: 146, visibility: "Public" },
      { name: "developer-portal", platform: "gitlab", language: "Vue", contributions: 121, visibility: "Private" },
      { name: "dotfiles", platform: "github", language: "Shell", contributions: 74, visibility: "Public" },
      { name: "event-worker", platform: "gitlab", language: "Go", contributions: 61, visibility: "Private" },
    ],
    generatedAt: now.toISOString(),
  };
}

function buildDailyContributions(now: Date): DailyContribution[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return Array.from({ length: DEMO_DAYS }, (_, index) => {
    const daysAgo = DEMO_DAYS - index - 1;
    const date = new Date(today.getTime() - daysAgo * DAY_IN_MS);
    const seed = index + date.getMonth() * 11 + date.getDate() * 3;
    const isRecentStreak = daysAgo < 9;
    const isActive = isRecentStreak || (daysAgo !== 9 && seed % 7 !== 0);
    const github = isActive ? (seed * 5) % 8 + (isRecentStreak ? 2 : 0) : 0;
    const gitlab = isActive && seed % 3 !== 0 ? (seed * 3) % 5 : 0;

    return {
      date: formatDate(date),
      total: github + gitlab,
      platforms: { github, gitlab },
    };
  });
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
