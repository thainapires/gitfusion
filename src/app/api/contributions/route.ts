import axios from 'axios';
import { NextResponse } from 'next/server';

export type Contribution = {
  date: string;
  count: number;
}

export type Contributions = Contribution[]

export async function GET(req: Request) {

  const contributions: Contribution[] = []
  
  const { searchParams } = new URL(req.url)
  const githubUsername = searchParams.get('github_username')
  const gitlabUsername = searchParams.get('gitlab_username')

  if(!githubUsername || !gitlabUsername){
    return new NextResponse(
      JSON.stringify({ error: 'GitLab username is required' }),
      { status: 400 }
    );
  }

  const githubResponse = await getGithubContributionsData(githubUsername)
  const gitlabResponse = await getGitlabContributionsData(gitlabUsername)

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

  const totalContributionsCount = contributions.reduce((accumulator, contribution) => {
    return accumulator + contribution.count;
  }, 0);

  return new NextResponse(JSON.stringify({ data: { totalContributionsCount, contributions } }), {
    status: 200,
  })
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

    const weeks = response.data?.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];

    const githubData: Contribution[] = weeks.flatMap((week: any) =>
      week.contributionDays.map((day: any) => ({
        date: day.date,
        count: day.contributionCount,
      }))
    );

    return githubData
  } catch(error) {
    console.error("Error fetching Github data:", error);
    return { error: error instanceof Error ? error.message : String(error) };
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
    console.error("Error fetching Gitlab data:", error);

    if(axios.isAxiosError(error)){
      return {error: error.response ? error.response.data : "Internal error, unable to fetch data from GitLab." };
    }

    return { error: "Unknown error occurred"}
  }
}