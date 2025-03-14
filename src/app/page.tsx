"use client";

import { useState } from "react";
import { FaGithub, FaPlus } from "react-icons/fa";
import { FaGitlab } from "react-icons/fa6";
import { Contributions } from "./api/contributions/route";
import ContributionsContainer from "./components/ContributionsContainer";
import UserInformationForm, { ContributionsResponse, UsernameData } from "./components/UserInformationForm";
import Footer from "./components/Footer";

export default function Home() {

  const [contributions, setContributions] = useState<Contributions | null>(null)
  const [totalContributionsCount, setTotalContributionsCount] = useState<number| null>(0)
  const [githubUsername, setGithubUsername] = useState<string>('')
  const [gitlabUsername, setGitlabUsername] = useState<string>('')

  const handleContributionsFetch = (contributionsData: ContributionsResponse, usernameData: UsernameData) => {
    setContributions(contributionsData.data.contributions)
    setTotalContributionsCount(contributionsData.data.totalContributionsCount)
    setGithubUsername(usernameData.githubUsername)
    setGitlabUsername(usernameData.gitlabUsername)
  }
  
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
      <div className="container px-4">
        <div className="text-center mb-10">
          <div className="flex mx-auto justify-center items-center align-items-center gap-4">
            <FaGithub className="h-12 w-12 mb-5 text-zinc-400"/>
            <FaPlus className="text-zinc-400"/>
            <FaGitlab className="h-12 w-12 mb-5 text-zinc-400"/>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-300 mb-4">
            Git Fusion
          </h1>
          <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
            Visualize your Github and Gitlab contributions in one graph
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="bg-neutral-800 rounded-lg shadow-xl border border-neutral-700">
            {!contributions ? (
              <UserInformationForm onContributionsFetch={handleContributionsFetch}/>
            ) : (
              <ContributionsContainer contributions={contributions} totalContributionsCount={totalContributionsCount} githubUsername={githubUsername} gitlabUsername={gitlabUsername}/>
            )}
          </div>
          <Footer />        
        </div>
      </div>
    </div>
  );
}
