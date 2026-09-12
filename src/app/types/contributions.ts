export type ContributionPlatform = "combined" | "github" | "gitlab";
export type ContributionPeriod = "all" | "30d" | "90d" | "year" | "last-year" | "custom";

export type Contribution = {
  date: string;
  count: number;
  githubCount: number;
  gitlabCount: number;
};

export type Contributions = Contribution[];

export type ContributionTotals = {
  total: number;
  github: number;
  gitlab: number;
};

export type ContributionsResponse = {
  data: {
    contributions: Contributions;
    totalContributionsCount: number;
    totals: ContributionTotals;
  };
};

export type ContributionFilters = {
  platform: ContributionPlatform;
  period: ContributionPeriod;
  from?: string;
  to?: string;
};

export type ContributionSummary = {
  total: number;
  githubTotal: number;
  gitlabTotal: number;
  activeDays: number;
  longestStreak: number;
  currentStreak: number;
  averagePerWeek: number;
  githubShare: number;
  gitlabShare: number;
  bestWeek: {
    label: string;
    count: number;
  };
  bestMonth: {
    label: string;
    count: number;
  };
};
