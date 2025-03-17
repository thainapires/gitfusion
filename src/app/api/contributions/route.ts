import axios from 'axios';
import { NextResponse } from 'next/server';

export type Contribution = {
  date: string;
  count: number;
}

export type Contributions = Contribution[]

/**
 * @swagger
 * /api/contributions:
 *   get:
 *     description: Fetches the contribution data for a GitHub and GitLab user and merges their contributions by date.
 *     tags:
 *       - Contributions
 *     parameters:
 *       - in: query
 *         name: github_username
 *         required: true
 *         description: GitHub username to fetch contribution data from GitHub.
 *       - in: query
 *         name: gitlab_username
 *         required: true
 *         description: GitLab username to fetch contribution data from GitLab.
 *     responses:
 *       200:
 *         description: Successfully merged contributions from GitHub and GitLab, returns total contributions count and detailed data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalContributionsCount:
 *                       type: integer
 *                       description: Total number of contributions merged from GitHub and GitLab.
 *                     contributions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             description: The date of the contribution.
 *                           count:
 *                             type: integer
 *                             description: Number of contributions on the given date.
 *       400:
 *         description: Bad Request if either GitHub or GitLab username is missing or if the data fetch fails from either service.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message describing the issue.
 *       500:
 *         description: Internal Server Error if an unexpected error occurs while fetching contribution data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: General error message indicating an issue with the server or API request.
 */
export async function GET(req: Request) {

  try{
    const contributions: Contribution[] = []
    
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

    const githubResponse = await getGithubContributionsData(githubUsername)
    const gitlabResponse = await getGitlabContributionsData(gitlabUsername)

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

    //Merge contributions from both services
    if(Array.isArray(githubResponse)) {
      contributions.push(...githubResponse)
    }else{
      return new NextResponse(
        JSON.stringify({error: 'Failed to fetch Github contributions'}),
        { status: 400 }
      )
    }

    if(Array.isArray(gitlabResponse)) {
      contributions.forEach((element, index) => {
        const itemIndex = gitlabResponse.findIndex(item => item.date === element.date)
        if(itemIndex !== -1){
          contributions[index].count = contributions[index].count + gitlabResponse[itemIndex].count
        }
      })
    }else{
      return new NextResponse(
        JSON.stringify({error: 'Failed to fetch Gitlab contributions'}),
        { status: 400 }
      )
    }

    const totalContributionsCount = contributions.reduce((sum, c) => {
      return sum + c.count
    }, 0)

    return new NextResponse(
      JSON.stringify({ data: { totalContributionsCount, contributions } }), 
      { status: 200 }
    )

  } catch (error) {
    console.error("🚨 Unexpected Error 🚨", {
      endpoint: "GET /api/contributions",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      location: "GET function in contributions API",
      timestamp: new Date().toISOString(),
      possibleCause: "Possibly an issue with fetching GitHub/GitLab data or a server error",
      stacktTrace: error instanceof Error ? error.stack : "No stack trace available",
    });
    return new NextResponse(
      JSON.stringify({ error: "An unexpected error ocurred. Please try again later."}),
      { status: 500 }
    )
  }
}

async function getGithubContributionsData(githubUsername: string): Promise<Contribution[] | { error: string }> {
  try{
    const response = await axios.post('https://api.github.com/graphql', {
      query: `
          query { 
              user(login: "${githubUsername}") { 
                  contributionsCollection { 
                      contributionCalendar { 
                          totalContributions 
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
      `
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_PERSONAL_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.status !== 200) {
      return { error: "Failed to fetch data from GitHub" };
    }

    if(response.data.errors){
      let errorMessage = { error: "Failed to fetch data from GitHub"}
      
      switch(response.data.errors[0].type){
        case 'NOT_FOUND':
          errorMessage = { error: `User ${githubUsername} not found.`}
          break
        default:
          break
      }

      return errorMessage
    }

    const weeks = response.data?.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];

    const githubData: Contribution[] = weeks.flatMap((week: any) =>
      week.contributionDays.map((day: any) => ({
        date: day.date,
        count: day.contributionCount,
      }))
    );

    return githubData
  } catch(error) {
    console.error("🚨 Unexpected Error in GitHub Data Fetching 🚨", {
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

async function getGitlabContributionsData(gitlabUsername: string): Promise<Contribution[] | { error: string }> {
  try{
    const response = await axios.get(`https://gitlab.com/users/${gitlabUsername}/calendar.json`)

    if(response.status !== 200) {
      return {error: "Failed to fetch data from Gitlab"}
    }

    const gitlabData: Contribution[] = Object.entries(response.data).map(([key, value]) => ({
      date: key,
      count: Number(value)
    }));
  
    return gitlabData

  } catch(error) {
    console.error("🚨 Unexpected Error in Gitlab Data Fetching 🚨", {
      endpoint: "POST https://gitlab.com/users/${gitlabUsername}/calendar.json",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      location: "getGitlabContributionsData function",
      timestamp: new Date().toISOString(),
      possibleCause: "Possibly an issue with the Gitlab API, network error, or invalid credentials",
      stackTrace: error instanceof Error ? error.stack : "No stack trace available",
    });
    return { error: "An unexpected error ocurred. Please try again later or check if the user is valid or if the contributios visibility for the user are public."}
  }
}