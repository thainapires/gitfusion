import { AccountProvider, ActivityItem, DailyContribution, RepositorySummary } from "../../types/mock-app";
import { DashboardOverview } from "../../types/dashboard";

type ConnectedAccountRow = {
  provider: AccountProvider;
  username: string;
  provider_user_id: string;
  access_token: string;
};

type ProviderDashboardData = {
  provider: AccountProvider;
  daily: Map<string, number>;
  repositories: RepositorySummary[];
  activities: ActivityItem[];
  pullOrMergeRequests: number;
};

const dashboardDays = 365;

export async function buildDashboardOverview(accounts: ConnectedAccountRow[]): Promise<DashboardOverview> {
  const dates = buildDateRange(dashboardDays);

  if (!accounts.length) {
    return {
      hasConnections: false,
      connectedProviders: [],
      metrics: buildMetrics({ total: 0, githubTotal: 0, gitlabTotal: 0, repositories: 0, pullOrMergeRequests: 0, currentStreak: 0, activeDays: 0 }),
      dailyContributions: dates.map((date) => ({ date, total: 0, platforms: { github: 0, gitlab: 0 } })),
      recentActivity: [],
      topRepositories: [],
      generatedAt: new Date().toISOString(),
    };
  }

  const providerData = await Promise.all(accounts.map((account) => fetchProviderDashboardData(account, dates[0])));
  const dailyContributions = mergeDailyContributions(dates, providerData);
  const githubTotal = sumProviderTotal(providerData, "github");
  const gitlabTotal = sumProviderTotal(providerData, "gitlab");
  const total = githubTotal + gitlabTotal;
  const repositories = providerData.reduce((sum, item) => sum + item.repositories.length, 0);
  const pullOrMergeRequests = providerData.reduce((sum, item) => sum + item.pullOrMergeRequests, 0);
  const activeDays = dailyContributions.filter((item) => item.total > 0).length;
  const currentStreak = getCurrentStreak(dailyContributions);

  return {
    hasConnections: true,
    connectedProviders: accounts.map((account) => account.provider),
    metrics: buildMetrics({ total, githubTotal, gitlabTotal, repositories, pullOrMergeRequests, currentStreak, activeDays }),
    dailyContributions,
    recentActivity: providerData.flatMap((item) => item.activities).sort(sortActivities).slice(0, 8),
    topRepositories: providerData.flatMap((item) => item.repositories).sort((a, b) => b.contributions - a.contributions).slice(0, 8),
    generatedAt: new Date().toISOString(),
  };
}

async function fetchProviderDashboardData(account: ConnectedAccountRow, since: string): Promise<ProviderDashboardData> {
  if (account.provider === "github") {
    return fetchGitHubDashboardData(account, since);
  }

  return fetchGitLabDashboardData(account, since);
}

async function fetchGitHubDashboardData(account: ConnectedAccountRow, since: string): Promise<ProviderDashboardData> {
  const to = new Date().toISOString();
  const from = new Date(`${since}T00:00:00`).toISOString();
  const graphResponse = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${account.access_token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query GitFusionDashboard($from: DateTime!, $to: DateTime!) {
          viewer {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
              pullRequestContributions(first: 100) {
                totalCount
              }
            }
          }
        }
      `,
      variables: { from, to },
    }),
  });
  const graphJson = await graphResponse.json() as {
    data?: {
      viewer?: {
        contributionsCollection?: {
          contributionCalendar?: { weeks?: { contributionDays?: { date: string; contributionCount: number }[] }[] };
          pullRequestContributions?: { totalCount: number };
        };
      };
    };
    errors?: { message: string }[];
  };

  if (!graphResponse.ok || graphJson.errors?.length) {
    throw new Error(graphJson.errors?.[0]?.message || "Unable to load GitHub dashboard data.");
  }

  const daily = new Map<string, number>();
  graphJson.data?.viewer?.contributionsCollection?.contributionCalendar?.weeks?.forEach((week) => {
    week.contributionDays?.forEach((day) => daily.set(day.date, day.contributionCount));
  });

  const [repos, events] = await Promise.all([
    fetchGitHubRepos(account),
    fetchGitHubEvents(account),
  ]);

  return {
    provider: "github",
    daily,
    repositories: repos,
    activities: events.activities,
    pullOrMergeRequests: graphJson.data?.viewer?.contributionsCollection?.pullRequestContributions?.totalCount || events.pullRequests,
  };
}

async function fetchGitHubRepos(account: ConnectedAccountRow): Promise<RepositorySummary[]> {
  const response = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member", {
    headers: {
      Authorization: `Bearer ${account.access_token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    return [];
  }

  const repos = await response.json() as { name: string; full_name: string; private: boolean; language: string | null; pushed_at: string | null; stargazers_count?: number; forks_count?: number }[];

  return repos.slice(0, 12).map((repo) => ({
    name: repo.full_name || repo.name,
    platform: "github",
    language: repo.language || "Unknown",
    contributions: scoreRecentDate(repo.pushed_at) + (repo.stargazers_count || 0) + (repo.forks_count || 0),
    visibility: repo.private ? "Private" : "Public",
  }));
}

async function fetchGitHubEvents(account: ConnectedAccountRow) {
  const response = await fetch(`https://api.github.com/users/${encodeURIComponent(account.username)}/events?per_page=30`, {
    headers: {
      Authorization: `Bearer ${account.access_token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    return { activities: [], pullRequests: 0 };
  }

  const events = await response.json() as { id: string; type: string; repo?: { name?: string }; created_at: string; payload?: { action?: string } }[];
  let pullRequests = 0;

  const activities = events.slice(0, 8).map((event) => {
    if (event.type === "PullRequestEvent") {
      pullRequests += 1;
    }

    return {
      id: `github-${event.id}`,
      title: githubEventTitle(event.type, event.payload?.action),
      description: event.repo?.name || account.username,
      platform: "github" as const,
      time: relativeTime(event.created_at),
    };
  });

  return { activities, pullRequests };
}

async function fetchGitLabDashboardData(account: ConnectedAccountRow, since: string): Promise<ProviderDashboardData> {
  const [projectsResponse, eventsResponse] = await Promise.all([
    fetch("https://gitlab.com/api/v4/projects?membership=true&simple=true&per_page=100&order_by=last_activity_at&sort=desc", {
      headers: { Authorization: `Bearer ${account.access_token}` },
    }),
    fetch(`https://gitlab.com/api/v4/users/${encodeURIComponent(account.provider_user_id)}/events?after=${since}&per_page=100`, {
      headers: { Authorization: `Bearer ${account.access_token}` },
    }),
  ]);

  const projects = projectsResponse.ok ? await projectsResponse.json() as { name_with_namespace?: string; name: string; visibility: string; last_activity_at: string | null; star_count?: number; forks_count?: number }[] : [];
  const events = eventsResponse.ok ? await eventsResponse.json() as { id: number; action_name?: string; target_type?: string | null; project_id?: number; created_at: string; push_data?: { ref?: string }; author_username?: string }[] : [];
  const daily = new Map<string, number>();
  let mergeRequests = 0;

  events.forEach((event) => {
    const date = event.created_at.slice(0, 10);
    daily.set(date, (daily.get(date) || 0) + 1);

    if ((event.target_type || "").toLowerCase().includes("merge")) {
      mergeRequests += 1;
    }
  });

  return {
    provider: "gitlab",
    daily,
    repositories: projects.slice(0, 12).map((project) => ({
      name: project.name_with_namespace || project.name,
      platform: "gitlab",
      language: "Unknown",
      contributions: scoreRecentDate(project.last_activity_at) + (project.star_count || 0) + (project.forks_count || 0),
      visibility: project.visibility === "public" ? "Public" : "Private",
    })),
    activities: events.slice(0, 8).map((event) => ({
      id: `gitlab-${event.id}`,
      title: gitlabEventTitle(event.action_name || event.target_type || "Activity"),
      description: event.push_data?.ref ? `Branch ${event.push_data.ref}` : account.username,
      platform: "gitlab",
      time: relativeTime(event.created_at),
    })),
    pullOrMergeRequests: mergeRequests,
  };
}

function buildDateRange(days: number) {
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - days + 1);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

function mergeDailyContributions(dates: string[], providerData: ProviderDashboardData[]): DailyContribution[] {
  return dates.map((date) => {
    const github = providerData.find((item) => item.provider === "github")?.daily.get(date) || 0;
    const gitlab = providerData.find((item) => item.provider === "gitlab")?.daily.get(date) || 0;

    return {
      date,
      total: github + gitlab,
      platforms: { github, gitlab },
    };
  });
}

function buildMetrics({ total, githubTotal, gitlabTotal, repositories, pullOrMergeRequests, currentStreak, activeDays }: { total: number; githubTotal: number; gitlabTotal: number; repositories: number; pullOrMergeRequests: number; currentStreak: number; activeDays: number }) {
  return [
    { label: "Total contributions", value: total.toLocaleString("en-US"), helper: `GitHub ${githubTotal.toLocaleString("en-US")} · GitLab ${gitlabTotal.toLocaleString("en-US")}`, trend: `${activeDays} active days` },
    { label: "Repositories", value: repositories.toLocaleString("en-US"), helper: "Connected provider repositories", trend: repositories ? "Loaded from providers" : "No repositories yet" },
    { label: "Pull / merge requests", value: pullOrMergeRequests.toLocaleString("en-US"), helper: "Detected from provider APIs", trend: "Last year window" },
  ];
}

function sumProviderTotal(providerData: ProviderDashboardData[], provider: AccountProvider) {
  return providerData.filter((item) => item.provider === provider).reduce((sum, item) => {
    item.daily.forEach((count) => {
      sum += count;
    });
    return sum;
  }, 0);
}

function getCurrentStreak(days: DailyContribution[]) {
  let streak = 0;

  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (days[index].total <= 0) {
      break;
    }

    streak += 1;
  }

  return streak;
}

function sortActivities(a: ActivityItem, b: ActivityItem) {
  return timeRank(a.time) - timeRank(b.time);
}

function timeRank(value: string) {
  if (value.includes("minute")) return 1;
  if (value.includes("hour")) return 2;
  if (value === "Yesterday") return 3;
  return 4;
}

function scoreRecentDate(value: string | null) {
  if (!value) return 0;
  const ageDays = Math.max((Date.now() - new Date(value).getTime()) / 86400000, 0);
  return Math.max(100 - Math.round(ageDays), 0);
}

function githubEventTitle(type: string, action?: string) {
  if (type === "PushEvent") return "Pushed commits";
  if (type === "PullRequestEvent") return `${capitalize(action || "updated")} pull request`;
  if (type === "IssuesEvent") return `${capitalize(action || "updated")} issue`;
  if (type === "CreateEvent") return "Created repository or branch";
  return type.replace(/Event$/, "");
}

function gitlabEventTitle(action: string) {
  return capitalize(action.replace(/_/g, " "));
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function relativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.max(Math.floor(diff / 60000), 0);

  if (minutes < 60) return `${Math.max(minutes, 1)} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}
