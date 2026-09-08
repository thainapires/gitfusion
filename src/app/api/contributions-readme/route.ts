import { NextResponse } from 'next/server';
import { ContributionsResponse } from '@/app/types/contributions';
import { parseDateStringAsLocalDate } from '@/app/utils';

const defaultSvgWidth = 620;
const svgHeight = 230;

export async function GET(req: Request) {
  try {
    const { searchParams, origin } = new URL(req.url);
    const githubUsername = searchParams.get('github_username');
    const gitlabUsername = searchParams.get('gitlab_username');

    if (!githubUsername || !gitlabUsername) {
      return svgResponse(createErrorSvg('GitHub and GitLab usernames are required'), 400);
    }

    const apiUrl = process.env.NEXT_PUBLIC_BASE_URL || origin;
    const contributionsUrl = `${apiUrl}/api/contributions?github_username=${encodeURIComponent(githubUsername)}&gitlab_username=${encodeURIComponent(gitlabUsername)}`;
    const response = await fetch(contributionsUrl);

    if (!response.ok) {
      return svgResponse(createErrorSvg('Unable to load contributions'), response.status);
    }

    const data = await response.json() as ContributionsResponse;
    const contributions = data.data.contributions;

    if (!contributions.length) {
      return svgResponse(createErrorSvg('No contributions found'), 404);
    }

    const startDate = parseDateStringAsLocalDate(contributions[0].date);
    const endDate = parseDateStringAsLocalDate(contributions[contributions.length - 1].date);
    const weekWidth = 15;
    const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const svgWidth = 50 + totalWeeks * weekWidth;
    const months = getMonthLabels(startDate, endDate);

    let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="100%" height="100%" fill="#2D3748" stroke="#ffffff" stroke-width="4" rx="20" ry="20" />`;

    months.forEach((month) => {
      const x = 50 + month.weekIndex * weekWidth;
      svg += `<text x="${x}" y="20" font-family="Arial" font-size="12" fill="#ffffff">${month.name}</text>`;
    });

    svg += `<text x="10" y="50" font-family="Arial" font-size="12" fill="#ffffff">Sun</text>`;
    svg += `<text x="10" y="90" font-family="Arial" font-size="12" fill="#ffffff">Tue</text>`;
    svg += `<text x="10" y="130" font-family="Arial" font-size="12" fill="#ffffff">Thu</text>`;
    svg += `<text x="10" y="170" font-family="Arial" font-size="12" fill="#ffffff">Sat</text>`;

    contributions.forEach((contribution) => {
      const { x, y } = getContributionPosition(contribution.date, startDate, weekWidth);
      svg += `<rect x="${x}" y="${y}" width="13" height="13" fill="${getColor(contribution.count)}" data-date="${contribution.date}" data-count="${contribution.count}" />`;
    });

    svg += `<text x="50" y="${svgHeight - 20}" font-family="Arial" font-size="12" fill="#ffffff">Less</text>`;
    svg += `<rect x="90" y="${svgHeight - 30}" width="13" height="13" fill="#18181B" />`;
    svg += `<rect x="110" y="${svgHeight - 30}" width="13" height="13" fill="#196127" />`;
    svg += `<rect x="130" y="${svgHeight - 30}" width="13" height="13" fill="#239a3b" />`;
    svg += `<rect x="150" y="${svgHeight - 30}" width="13" height="13" fill="#7bc96f" />`;
    svg += `<rect x="170" y="${svgHeight - 30}" width="13" height="13" fill="#c6e48b" />`;
    svg += `<text x="190" y="${svgHeight - 20}" font-family="Arial" font-size="12" fill="#ffffff">More</text>`;
    svg += `</svg>`;

    return svgResponse(svg);
  } catch (error) {
    console.error('Unexpected Error in contributions README API', {
      endpoint: 'GET /api/contributions-readme',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
      stackTrace: error instanceof Error ? error.stack : 'No stack trace available',
    });

    return svgResponse(createErrorSvg('Unexpected error loading contributions'), 500);
  }
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

  const firstDayOfNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const nextMonthWeekIndex = Math.floor((firstDayOfNextMonth.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  months.push({ name: currentDate.toLocaleString('default', { month: 'short' }), weekIndex: nextMonthWeekIndex });

  return months;
}

function getContributionPosition(dateString: string, startDate: Date, weekWidth: number) {
  const date = parseDateStringAsLocalDate(dateString);
  const weekIndex = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const dayOfWeek = date.getDay();

  return {
    x: 50 + weekIndex * weekWidth,
    y: 40 + dayOfWeek * 20,
  };
}

function getColor(count: number) {
  if (!count) return '#18181B';
  if (count >= 1 && count < 10) return '#196127';
  if (count >= 10 && count < 20) return '#239a3b';
  if (count >= 20 && count < 30) return '#7bc96f';
  return '#c6e48b';
}

function createErrorSvg(message: string) {
  return `<svg width="${defaultSvgWidth}" height="120" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#2D3748" stroke="#ffffff" stroke-width="4" rx="20" ry="20" />
    <text x="24" y="54" font-family="Arial" font-size="16" font-weight="700" fill="#ffffff">Git Fusion</text>
    <text x="24" y="82" font-family="Arial" font-size="13" fill="#cbd5e1">${escapeSvgText(message)}</text>
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
