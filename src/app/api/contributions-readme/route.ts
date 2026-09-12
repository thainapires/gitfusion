import { NextResponse } from 'next/server';
import { ContributionFilters, ContributionPeriod, ContributionPlatform, ContributionsResponse } from '@/app/types/contributions';
import { applyContributionFilters, buildContributionSummary, getPlatformLabel } from '@/app/utils/contributions';
import { parseDateStringAsLocalDate } from '@/app/utils';

const defaultSvgWidth = 760;
const svgHeight = 270;
const platforms: ContributionPlatform[] = ['combined', 'github', 'gitlab'];
const periods: ContributionPeriod[] = ['all', '30d', '90d', 'year', 'last-year', 'custom'];

export async function GET(req: Request) {
  try {
    const { searchParams, origin } = new URL(req.url);
    const githubUsername = searchParams.get('github_username');
    const gitlabUsername = searchParams.get('gitlab_username');
    const theme = searchParams.get('theme') === 'light' ? 'light' : 'dark';
    const platform = parsePlatform(searchParams.get('platform'));
    const period = parsePeriod(searchParams.get('period'));
    const filters: ContributionFilters = {
      platform,
      period,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
    };

    if (!githubUsername || !gitlabUsername) {
      return svgResponse(createErrorSvg('GitHub and GitLab usernames are required', theme), 400);
    }

    const apiUrl = process.env.NEXT_PUBLIC_BASE_URL || origin;
    const contributionsUrl = `${apiUrl}/api/contributions?github_username=${encodeURIComponent(githubUsername)}&gitlab_username=${encodeURIComponent(gitlabUsername)}`;
    const response = await fetch(contributionsUrl);

    if (!response.ok) {
      return svgResponse(createErrorSvg('Unable to load contributions', theme), response.status);
    }

    const data = await response.json() as ContributionsResponse;
    const contributions = applyContributionFilters(data.data.contributions, filters);

    if (!contributions.length) {
      return svgResponse(createErrorSvg('No contributions found for this filter', theme), 404);
    }

    const summary = buildContributionSummary(contributions, platform);
    const colors = getThemeColors(theme);
    const startDate = parseDateStringAsLocalDate(contributions[0].date);
    const endDate = parseDateStringAsLocalDate(contributions[contributions.length - 1].date);
    const weekWidth = 13;
    const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const graphWidth = Math.max(420, totalWeeks * weekWidth);
    const svgWidth = Math.max(defaultSvgWidth, 310 + graphWidth);
    const months = getMonthLabels(startDate, endDate);

    let svg = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="100%" height="100%" fill="${colors.background}" stroke="${colors.border}" stroke-width="1" rx="12" />`;
    svg += `<text x="24" y="40" font-family="Arial" font-size="20" font-weight="700" fill="${colors.text}">Git Fusion</text>`;
    svg += `<text x="24" y="66" font-family="Arial" font-size="13" fill="${colors.muted}">${escapeSvgText(githubUsername)} + ${escapeSvgText(gitlabUsername)} · ${getPlatformLabel(platform)}</text>`;
    svg += `<text x="24" y="112" font-family="Arial" font-size="34" font-weight="700" fill="${colors.text}">${summary.total}</text>`;
    svg += `<text x="24" y="136" font-family="Arial" font-size="12" fill="${colors.muted}">total contributions</text>`;
    svg += `<text x="24" y="172" font-family="Arial" font-size="13" fill="${colors.text}">GitHub ${summary.githubTotal} · ${summary.githubShare}%</text>`;
    svg += `<text x="24" y="196" font-family="Arial" font-size="13" fill="${colors.text}">GitLab ${summary.gitlabTotal} · ${summary.gitlabShare}%</text>`;
    svg += `<text x="24" y="232" font-family="Arial" font-size="12" fill="${colors.muted}">Best month: ${escapeSvgText(summary.bestMonth.label)} (${summary.bestMonth.count})</text>`;

    const graphX = 290;
    const graphY = 34;

    months.forEach((month) => {
      const x = graphX + month.weekIndex * weekWidth;
      svg += `<text x="${x}" y="20" font-family="Arial" font-size="11" fill="${colors.muted}">${month.name}</text>`;
    });

    svg += `<text x="${graphX - 36}" y="50" font-family="Arial" font-size="11" fill="${colors.muted}">Sun</text>`;
    svg += `<text x="${graphX - 36}" y="86" font-family="Arial" font-size="11" fill="${colors.muted}">Tue</text>`;
    svg += `<text x="${graphX - 36}" y="122" font-family="Arial" font-size="11" fill="${colors.muted}">Thu</text>`;
    svg += `<text x="${graphX - 36}" y="158" font-family="Arial" font-size="11" fill="${colors.muted}">Sat</text>`;

    contributions.forEach((contribution) => {
      const { x, y } = getContributionPosition(contribution.date, startDate, weekWidth, graphX, graphY);
      svg += `<rect x="${x}" y="${y}" width="11" height="11" rx="2" fill="${getColor(contribution.count, theme)}" data-date="${contribution.date}" data-count="${contribution.count}" />`;
    });

    const legendY = svgHeight - 34;
    svg += `<text x="${graphX}" y="${legendY + 10}" font-family="Arial" font-size="11" fill="${colors.muted}">Less</text>`;
    [0, 1, 2, 3, 4].forEach((level) => {
      svg += `<rect x="${graphX + 34 + level * 17}" y="${legendY}" width="11" height="11" rx="2" fill="${getLegendColor(level, theme)}" />`;
    });
    svg += `<text x="${graphX + 128}" y="${legendY + 10}" font-family="Arial" font-size="11" fill="${colors.muted}">More</text>`;
    svg += `</svg>`;

    return svgResponse(svg);
  } catch (error) {
    console.error('Unexpected Error in contributions README API', {
      endpoint: 'GET /api/contributions-readme',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
      stackTrace: error instanceof Error ? error.stack : 'No stack trace available',
    });

    return svgResponse(createErrorSvg('Unexpected error loading contributions', 'dark'), 500);
  }
}

function parsePlatform(value: string | null): ContributionPlatform {
  return platforms.includes(value as ContributionPlatform) ? value as ContributionPlatform : 'combined';
}

function parsePeriod(value: string | null): ContributionPeriod {
  return periods.includes(value as ContributionPeriod) ? value as ContributionPeriod : 'all';
}

function getMonthLabels(startDate: Date, endDate: Date) {
  let months: { name: string; weekIndex: number }[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const weekIndex = Math.floor((firstDayOfMonth.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    months.push({ name: currentDate.toLocaleString('default', { month: 'short' }), weekIndex });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  months = months.filter((item) => item.weekIndex > 0);
  return months;
}

function getContributionPosition(dateString: string, startDate: Date, weekWidth: number, graphX: number, graphY: number) {
  const date = parseDateStringAsLocalDate(dateString);
  const weekIndex = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const dayOfWeek = date.getDay();

  return {
    x: graphX + weekIndex * weekWidth,
    y: graphY + dayOfWeek * 18,
  };
}

function getColor(count: number, theme: 'light' | 'dark') {
  if (!count) return theme === 'light' ? '#ebedf0' : '#232e44';
  if (count < 10) return theme === 'light' ? '#c6e48b' : '#196127';
  if (count < 20) return theme === 'light' ? '#7bc96f' : '#239a3b';
  if (count < 30) return theme === 'light' ? '#239a3b' : '#7bc96f';
  return theme === 'light' ? '#196127' : '#c6e48b';
}

function getLegendColor(level: number, theme: 'light' | 'dark') {
  return getColor([0, 1, 10, 20, 30][level], theme);
}

function getThemeColors(theme: 'light' | 'dark') {
  if (theme === 'light') {
    return {
      background: '#ffffff',
      border: '#d0d7de',
      text: '#24292f',
      muted: '#57606a',
    };
  }

  return {
    background: '#0d1117',
    border: '#30363d',
    text: '#f0f6fc',
    muted: '#8b949e',
  };
}

function createErrorSvg(message: string, theme: 'light' | 'dark') {
  const colors = getThemeColors(theme);

  return `<svg width="${defaultSvgWidth}" height="120" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${colors.background}" stroke="${colors.border}" stroke-width="1" rx="12" />
    <text x="24" y="54" font-family="Arial" font-size="16" font-weight="700" fill="${colors.text}">Git Fusion</text>
    <text x="24" y="82" font-family="Arial" font-size="13" fill="${colors.muted}">${escapeSvgText(message)}</text>
  </svg>`;
}

function svgResponse(svg: string, status = 200) {
  return new NextResponse(svg, {
    status,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store',
    },
  });
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
