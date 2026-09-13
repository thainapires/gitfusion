import { AccountProvider, ActivityItem, DailyContribution, DashboardMetric, RepositorySummary } from "./mock-app";

export type DashboardOverview = {
  hasConnections: boolean;
  connectedProviders: AccountProvider[];
  metrics: DashboardMetric[];
  activeDays: number;
  currentStreak: number;
  dailyContributions: DailyContribution[];
  recentActivity: ActivityItem[];
  topRepositories: RepositorySummary[];
  generatedAt: string;
};

export type DashboardSyncStatus = {
  status: "idle" | "syncing" | "synced" | "failed";
  progressPercent: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  errorMessage: string | null;
};
