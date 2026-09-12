import axios from 'axios';
import { NextResponse } from 'next/server';
import { Contribution, ContributionTotals } from '@/app/types/contributions';

type SourceContribution = {
  date: string;
  count: number;
};

type GitHubContributionDay = {
  contributionCount: number;
  date: string;
};

type GitHubContributionWeek = {
  contributionDays: GitHubContributionDay[];
};

type GitHubContributionsResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          weeks?: GitHubContributionWeek[];
        };
      };
    };
  };
  errors?: {
    type?: string;
    message?: string;
  }[];
};

type GitLabCalendarResponse = Record<string, number>;

export async function GET(req: Request) {

  try{
    const { searchParams } = new URL(req.url)
    const githubUsername = searchParams.get('github_username')
    const gitlabUsername = searchParams.get('gitlab_username')

    if(!githubUsername){
      return new NextResponse(
        JSON.stringify({ error: 'Github username is required' }),
        { status: 400 }
      )
    }

    if(!gitlabUsername){
      return new NextResponse(
        JSON.stringify({ error: 'GitLab username is required' }),
        { status: 400 }
      )
    }

    const [githubResponse, gitlabResponse] = await Promise.all([
      getGithubContributionsData(githubUsername),
      getGitlabContributionsData(gitlabUsername),
    ])

    if("error" in githubResponse) {
      return new NextResponse(
        JSON.stringify({ error: `GitHub API error: ${githubResponse.error}` }),
        { status: 400 }
      )
    }

    if("error" in gitlabResponse) {
      return new NextResponse(
        JSON.stringify({ error: `Gitlab API error: ${gitlabResponse.error}` }),
        { status: 400 }
      )
    }

    const contributions = mergeContributions(githubResponse, gitlabResponse)
    const totals = getContributionTotals(contributions)

    return new NextResponse(
      JSON.stringify({ data: { totalContributionsCount: totals.total, totals, contributions } }), 
      { status: 200 }
    )

  } catch (error) {
    console.error("Unexpected Error", {
      endpoint: "GET /api/contributions",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      location: "GET function in contributions API",
      timestamp: new Date().toISOString(),
      possibleCause: "Possibly an issue with fetching GitHub/GitLab data or a server error",
      stackTrace: error instanceof Error ? error.stack : "No stack trace available",
    });
    return new NextResponse(
      JSON.stringify({ error: "An unexpected error ocurred. Please try again later."}),
      { status: 500 }
    )
  }
}

async function getGithubContributionsData(githubUsername: string): Promise<SourceContribution[] | { error: string }> {
  try{
    const githubToken = process.env.GITHUB_PERSONAL_TOKEN;

    if (!githubToken) {
      return { error: "GitHub token is not configured" };
    }

    const response = await axios.post('https://api.github.com/graphql', {
      query: `
          query($login: String!) { 
              user(login: $login) { 
                  contributionsCollection { 
                      contributionCalendar { 
                          weeks { 
                              contributionDays { 
                                  contributionCount 
                                  date 
                              } 
                          } 
                      } 
                  } 
              } 
          }
      `,
      variables: {
        login: githubUsername,
      },
    }, {
        headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.status !== 200) {
      return { error: "Failed to fetch data from GitHub" };
    }

    const responseData = response.data as GitHubContributionsResponse;

    if(responseData.errors){
      let errorMessage = { error: "Failed to fetch data from GitHub"}
      
      switch(responseData.errors[0].type){
        case 'NOT_FOUND':
          errorMessage = { error: `User ${githubUsername} not found.`}
          break
        default:
          break
      }

      return errorMessage
    }

    const weeks = responseData.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];

    const githubData: SourceContribution[] = weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
      }))
    );

    return githubData
  } catch(error) {
    console.error("Unexpected Error in GitHub Data Fetching", {
      endpoint: "POST https://api.github.com/graphql",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      location: "getGithubContributionsData function",
      timestamp: new Date().toISOString(),
      possibleCause: "Possibly an issue with the GitHub API, network error, or invalid credentials",
      stackTrace: error instanceof Error ? error.stack : "No stack trace available",
    });
    return { error: "An unexpected error ocurred. Please try again later."}
  }
}

async function getGitlabContributionsData(gitlabUsername: string): Promise<SourceContribution[] | { error: string }> {
  try{
    const response = await axios.get<GitLabCalendarResponse>(
      `https://gitlab.com/users/${encodeURIComponent(gitlabUsername)}/calendar.json`
    )

    if(response.status !== 200) {
      return {error: "Failed to fetch data from Gitlab"}
    }

    const gitlabData: SourceContribution[] = Object.entries(response.data).map(([key, value]) => ({
      date: key,
      count: Number(value)
    }));
  
    return gitlabData

  } catch(error) {
    console.error("Unexpected Error in Gitlab Data Fetching", {
      endpoint: "GET https://gitlab.com/users/${gitlabUsername}/calendar.json",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      location: "getGitlabContributionsData function",
      timestamp: new Date().toISOString(),
      possibleCause: "Possibly an issue with the Gitlab API, network error, or invalid credentials",
      stackTrace: error instanceof Error ? error.stack : "No stack trace available",
    });
    return { error: "An unexpected error ocurred. Please try again later or check if the user is valid or if the contributios visibility for the user are public."}
  }
}

function mergeContributions(githubContributions: SourceContribution[], gitlabContributions: SourceContribution[]): Contribution[] {
  const contributionsByDate = new Map<string, Contribution>();

  githubContributions.forEach(({ date, count }) => {
    const contribution = getEmptyContribution(date, contributionsByDate);
    contribution.githubCount += count;
    contribution.count += count;
  });

  gitlabContributions.forEach(({ date, count }) => {
    const contribution = getEmptyContribution(date, contributionsByDate);
    contribution.gitlabCount += count;
    contribution.count += count;
  });

  return Array.from(contributionsByDate.values())
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getEmptyContribution(date: string, contributionsByDate: Map<string, Contribution>) {
  const existingContribution = contributionsByDate.get(date);

  if (existingContribution) {
    return existingContribution;
  }

  const contribution = { date, count: 0, githubCount: 0, gitlabCount: 0 };
  contributionsByDate.set(date, contribution);
  return contribution;
}

function getContributionTotals(contributions: Contribution[]): ContributionTotals {
  return contributions.reduce(
    (totals, contribution) => ({
      github: totals.github + contribution.githubCount,
      gitlab: totals.gitlab + contribution.gitlabCount,
      total: totals.total + contribution.count,
    }),
    { github: 0, gitlab: 0, total: 0 },
  );
}
