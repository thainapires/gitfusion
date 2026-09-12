import {
  Contribution,
  ContributionFilters,
  ContributionPeriod,
  ContributionPlatform,
  Contributions,
  ContributionSummary,
} from "../types/contributions";
import { parseDateStringAsLocalDate } from ".";

const dayInMs = 24 * 60 * 60 * 1000;

export function getContributionCount(contribution: Contribution, platform: ContributionPlatform) {
  if (platform === "github") return contribution.githubCount;
  if (platform === "gitlab") return contribution.gitlabCount;
  return contribution.count;
}

export function applyContributionFilters(contributions: Contributions, filters: ContributionFilters): Contributions {
  const { from, to } = getPeriodRange(contributions, filters.period, filters.from, filters.to);

  return contributions
    .filter((contribution) => {
      if (from && contribution.date < from) return false;
      if (to && contribution.date > to) return false;
      return true;
    })
    .map((contribution) => ({
      ...contribution,
      count: getContributionCount(contribution, filters.platform),
    }));
}

export function buildContributionSummary(contributions: Contributions, platform: ContributionPlatform): ContributionSummary {
  if (!contributions.length) {
    return emptySummary();
  }

  const total = contributions.reduce((sum, contribution) => sum + getContributionCount(contribution, platform), 0);
  const githubTotal = contributions.reduce((sum, contribution) => sum + contribution.githubCount, 0);
  const gitlabTotal = contributions.reduce((sum, contribution) => sum + contribution.gitlabCount, 0);
  const activeDays = contributions.filter((contribution) => getContributionCount(contribution, platform) > 0).length;
  const { longestStreak, currentStreak } = getStreaks(contributions, platform);
  const averagePerWeek = getAveragePerWeek(contributions, total);
  const platformTotal = githubTotal + gitlabTotal;

  return {
    total,
    githubTotal,
    gitlabTotal,
    activeDays,
    longestStreak,
    currentStreak,
    averagePerWeek,
    githubShare: platformTotal ? Math.round((githubTotal / platformTotal) * 100) : 0,
    gitlabShare: platformTotal ? Math.round((gitlabTotal / platformTotal) * 100) : 0,
    bestWeek: getBestWeek(contributions, platform),
    bestMonth: getBestMonth(contributions, platform),
  };
}

export function getPeriodRange(
  contributions: Contributions,
  period: ContributionPeriod,
  customFrom?: string,
  customTo?: string,
) {
  if (!contributions.length) {
    return { from: customFrom, to: customTo };
  }

  const lastDate = parseDateStringAsLocalDate(contributions[contributions.length - 1].date);
  const currentYear = lastDate.getFullYear();

  if (period === "30d") {
    return { from: formatDate(addDays(lastDate, -29)), to: formatDate(lastDate) };
  }

  if (period === "90d") {
    return { from: formatDate(addDays(lastDate, -89)), to: formatDate(lastDate) };
  }

  if (period === "year") {
    return { from: `${currentYear}-01-01`, to: formatDate(lastDate) };
  }

  if (period === "last-year") {
    return { from: `${currentYear - 1}-01-01`, to: `${currentYear - 1}-12-31` };
  }

  if (period === "custom") {
    return { from: customFrom, to: customTo };
  }

  return {};
}

export function getPlatformLabel(platform: ContributionPlatform) {
  if (platform === "github") return "GitHub";
  if (platform === "gitlab") return "GitLab";
  return "Combined";
}

function getStreaks(contributions: Contributions, platform: ContributionPlatform) {
  let longestStreak = 0;
  let currentRun = 0;

  contributions.forEach((contribution) => {
    if (getContributionCount(contribution, platform) > 0) {
      currentRun += 1;
      longestStreak = Math.max(longestStreak, currentRun);
      return;
    }

    currentRun = 0;
  });

  let currentStreak = 0;
  for (let index = contributions.length - 1; index >= 0; index -= 1) {
    if (getContributionCount(contributions[index], platform) <= 0) break;
    currentStreak += 1;
  }

  return { longestStreak, currentStreak };
}

function getAveragePerWeek(contributions: Contributions, total: number) {
  const firstDate = parseDateStringAsLocalDate(contributions[0].date);
  const lastDate = parseDateStringAsLocalDate(contributions[contributions.length - 1].date);
  const weeks = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime() + dayInMs) / (7 * dayInMs)));

  return Number((total / weeks).toFixed(1));
}

function getBestWeek(contributions: Contributions, platform: ContributionPlatform) {
  const totalsByWeek = new Map<string, number>();

  contributions.forEach((contribution) => {
    const date = parseDateStringAsLocalDate(contribution.date);
    const weekStart = addDays(date, -date.getDay());
    const label = formatDate(weekStart);
    totalsByWeek.set(label, (totalsByWeek.get(label) || 0) + getContributionCount(contribution, platform));
  });

  return getBestEntry(totalsByWeek, "No data");
}

function getBestMonth(contributions: Contributions, platform: ContributionPlatform) {
  const totalsByMonth = new Map<string, number>();

  contributions.forEach((contribution) => {
    const date = parseDateStringAsLocalDate(contribution.date);
    const label = date.toLocaleString("en-US", { month: "short", year: "numeric" });
    totalsByMonth.set(label, (totalsByMonth.get(label) || 0) + getContributionCount(contribution, platform));
  });

  return getBestEntry(totalsByMonth, "No data");
}

function getBestEntry(entries: Map<string, number>, fallbackLabel: string) {
  let best = { label: fallbackLabel, count: 0 };

  entries.forEach((count, label) => {
    if (count > best.count) {
      best = { label, count };
    }
  });

  return best;
}

function emptySummary(): ContributionSummary {
  return {
    total: 0,
    githubTotal: 0,
    gitlabTotal: 0,
    activeDays: 0,
    longestStreak: 0,
    currentStreak: 0,
    averagePerWeek: 0,
    githubShare: 0,
    gitlabShare: 0,
    bestWeek: { label: "No data", count: 0 },
    bestMonth: { label: "No data", count: 0 },
  };
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
