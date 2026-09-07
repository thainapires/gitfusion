"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import ContributionsContainer from "../components/dashboard/contributions-container";
import UserInformationForm, { UsernameData } from "../components/dashboard/user-information-form";
import { Header } from "../components/layout/header";
import { Contributions, ContributionsResponse } from "../types/contributions";

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
    <div className="flex flex-col h-screen">
        <Header />
        {!contributions ? (
              <UserInformationForm onContributionsFetch={handleContributionsFetch}/>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }} 
            className="h-full"
          >
            <ContributionsContainer 
              contributions={contributions} 
              totalContributionsCount={totalContributionsCount} 
              githubUsername={githubUsername} 
              gitlabUsername={gitlabUsername}
              setContributions={setContributions}
              closeButton/>
          </motion.div>
        )}
    </div>
  );
}
