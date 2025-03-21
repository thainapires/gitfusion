import { NextResponse } from 'next/server';
// @ts-ignore

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const githubUsername = searchParams.get('github_username');
  const gitlabUsername = searchParams.get('gitlab_username');

  const apiUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const contributionsUrl = `${apiUrl}/api/contributions?github_username=${githubUsername}&gitlab_username=${gitlabUsername}`;
  const response = await fetch(contributionsUrl);

  if (!response.ok) {
    throw new Error('Error getting contributions data');
  }

  const data = await response.json();
  const contributions = data.data.contributions;

  // Extract the start and end dates
  const startDate = new Date(contributions[0].date);
  const endDate = new Date(contributions[contributions.length - 1].date);

  // Function to get the month name from a date
  const getMonthName = (date: Date) => {
    return date.toLocaleString('default', { month: 'short' });
  };

  // Generate the list of months and their start positions
  let months: { name: string; weekIndex: number }[] = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const weekIndex = Math.floor((firstDayOfMonth.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    months.push({ name: getMonthName(currentDate), weekIndex });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  months = months.filter(item => item.weekIndex > 0);
  const nextMonthDate = new Date(currentDate);
  const firstDayOfNextMonth = new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), 1);
  const nextMonthWeekIndex = Math.floor((firstDayOfNextMonth.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  months.push({ name: getMonthName(nextMonthDate), weekIndex: nextMonthWeekIndex });

  // Calculate dynamic SVG width based on the number of weeks
  const weekWidth = 15; // Width allocated per week
  const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const svgWidth = 50 + totalWeeks * weekWidth; // Add padding and dynamic width

  // Calculate dynamic SVG height to accommodate the legend at the bottom
  const svgHeight = 200 + 30; // Add extra space for the legend

  const getColor = (count: number) => {
    if (!count) return '#18181B';
    if (count >= 1 && count < 10) return '#196127';
    if (count >= 10 && count < 20) return '#239a3b';
    if (count >= 20 && count < 30) return '#7bc96f';
    if (count >= 30) return '#c6e48b';
    return '#18181B';
  };

  // Function to calculate the x and y position of a contribution based on its date
    const getPosition = (dateString: string) => {
    const date = new Date(dateString);
    const weekIndex = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
  
    // Calculate x position based on week
    const x = 50 + weekIndex * weekWidth; // Assuming `weekWidth` is defined elsewhere
    const y = 40 + dayOfWeek * 20; // Assuming `dayHeight` is defined elsewhere
  
    return { x, y };
  };

  // Create the SVG string
  let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Add a dark background with rounded corners and a border
  svg += `<rect width="100%" height="100%" fill="#2D3748" stroke="#ffffff" stroke-width="4" rx="20" ry="20" />`;

  // Add month labels (white text)
  months.forEach((month) => {
    const x = 50 + month.weekIndex * weekWidth;
    svg += `<text x="${x}" y="20" font-family="Arial" font-size="12" fill="#ffffff">${month.name}</text>`;
  });

  // Add day labels (white text)
  svg += `<text x="10" y="50" font-family="Arial" font-size="12" fill="#ffffff">Sun</text>`;
  svg += `<text x="10" y="90" font-family="Arial" font-size="12" fill="#ffffff">Tue</text>`;
  svg += `<text x="10" y="130" font-family="Arial" font-size="12" fill="#ffffff">Thu</text>`;
  svg += `<text x="10" y="170" font-family="Arial" font-size="12" fill="#ffffff">Sat</text>`;

  // Add contribution squares
  contributions.forEach((c: any) => {
    const { x, y } = getPosition(c.date);
    svg += `<rect x="${x}" y="${y}" width="13" height="13" fill="${getColor(c.count)}" data-date="${c.date}" data-count="${c.count}" />`;
  });

  // Add legend (white text)
  svg += `<text x="50" y="${svgHeight - 20}" font-family="Arial" font-size="12" fill="#ffffff">Less</text>`;
  svg += `<rect x="90" y="${svgHeight - 30}" width="13" height="13" fill="#18181B" />`;
  svg += `<rect x="110" y="${svgHeight - 30}" width="13" height="13" fill="#196127" />`;
  svg += `<rect x="130" y="${svgHeight - 30}" width="13" height="13" fill="#239a3b" />`;
  svg += `<rect x="150" y="${svgHeight - 30}" width="13" height="13" fill="#7bc96f" />`;
  svg += `<rect x="170" y="${svgHeight - 30}" width="13" height="13" fill="#c6e48b" />`;
  svg += `<text x="190" y="${svgHeight - 20}" font-family="Arial" font-size="12" fill="#ffffff">More</text>`;

  svg += `</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  });
}