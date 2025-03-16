"use client";

import { useEffect, useState } from "react";
import { Contributions } from "../api/contributions/route";
import ContributionsContainer from "../components/ContributionsContainer";
import Footer from "../components/Footer";

export default function ThainaPiresPage() {
    const [contributions, setContributions] = useState<Contributions>([])
    const [totalContributionsCount, setTotalContributionsCount] = useState<number | null>(0)

    const fetchContributions = async (data: { github_username: string, gitlab_username: string }) => {
        try {
            const response = await fetch(`/api/contributions?github_username=${data.github_username}&gitlab_username=${data.gitlab_username}`);
            if (!response.ok) {
                throw new Error('Failed to fetch contributions')
            }

            const contributionsData = await response.json()

            setContributions(contributionsData.data.contributions)
            setTotalContributionsCount(contributionsData.data.totalContributionsCount)
        } catch (error) {
            console.log("Error fetching contributions: " + (error instanceof Error ? error.message : ""));
        }
    };

    useEffect(() => {
        fetchContributions({github_username: 'thainapires', gitlab_username: 'thainapires'})
    }, [])

    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
            <div className="container px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-neutral-800 rounded-lg shadow-xl border border-neutral-700">
                        <ContributionsContainer
                            contributions={contributions}
                            totalContributionsCount={totalContributionsCount}
                            githubUsername={'thainapires'}
                            gitlabUsername={'thainapires'}
                        />
                    </div>
                    <Footer />  
                </div>
            </div>
        </div>
    );
}