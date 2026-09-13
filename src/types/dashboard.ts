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
