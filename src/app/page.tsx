"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { FaGithub, FaPlus } from "react-icons/fa";
import { FaGitlab } from "react-icons/fa6";
import { Contributions } from "./api/contributions/route";
import ContributionsContainer from "./components/ContributionsContainer";
import Footer from "./components/Footer";
import UserInformationForm, { ContributionsResponse, UsernameData } from "./components/UserInformationForm";

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
    <div className="min-h-screen bg-[#1a202c] flex items-center justify-center">
      <div className="container px-4">
        <div className="text-center mb-10">
          <div className="flex mx-auto justify-center items-center align-items-center gap-4">
            <FaGithub className="h-12 w-12 mb-5 text-zinc-400 hover:scale-110 hover:text-purple-500"/>
            <FaPlus className="text-zinc-400"/>
            <FaGitlab className="h-12 w-12 mb-5 text-zinc-400 hover:scale-110 hover:text-orange-500"/>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-300 to-emerald-700 bg-clip-text text-transparent mb-4">
            Git Fusion
          </h1>
          <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
            Visualize your Github and Gitlab contributions in one graph
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#2d3748] rounded-lg shadow-lg">
            {!contributions ? (
              <UserInformationForm onContributionsFetch={handleContributionsFetch}/>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }} 
              >
                <ContributionsContainer 
                  contributions={contributions} 
                  totalContributionsCount={totalContributionsCount} 
                  githubUsername={githubUsername} 
                  gitlabUsername={gitlabUsername}
                  setContributions={setContributions}/>
              </motion.div>
            )}
          </div>
          <Footer />        
        </div>
      </div>
    </div>
  );
}
