import { IconType } from "react-icons";

export type AccountProvider = "github" | "gitlab";

export type AccountConnectionState = "not-connected" | "connecting" | "connected";

export type ConnectedAccount = {
  provider: AccountProvider;
  name: string;
  username: string;
  email: string;
  status: AccountConnectionState;
  repositories: number;
  contributions: number;
  lastSync: string;
};

export type MockUser = {
  name: string;
  email: string;
  username: string;
  role: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
  helper: string;
  trend: string;
  mobile?: boolean;
};

export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  platform: AccountProvider;
  time: string;
};

export type RepositorySummary = {
  name: string;
  platform: AccountProvider;
  language: string;
  contributions: number;
  visibility: "Public" | "Private";
};

export type DailyContribution = {
  date: string;
  total: number;
  platforms: {
    github: number;
    gitlab: number;
  };
};

export type SidebarItem = {
  label: string;
  href?: string;
  disabled?: boolean;
  icon: IconType;
};
