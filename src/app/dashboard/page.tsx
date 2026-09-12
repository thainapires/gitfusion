"use client";

import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import ContributionsContainer from "../components/dashboard/contributions-container";
import UserInformationForm, { UsernameData } from "../components/dashboard/user-information-form";
import { Header } from "../components/layout/header";
import { Contributions, ContributionsResponse } from "../types/contributions";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent />
      </Suspense>
      <Toaster richColors/>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contributions, setContributions] = useState<Contributions | null>(null)
  const [totalContributionsCount, setTotalContributionsCount] = useState<number| null>(0)
  const [githubUsername, setGithubUsername] = useState<string>('')
  const [gitlabUsername, setGitlabUsername] = useState<string>('')
  const [isInitialLoading, setIsInitialLoading] = useState(false)

  const handleContributionsFetch = useCallback((contributionsData: ContributionsResponse, usernameData: UsernameData) => {
    setContributions(contributionsData.data.contributions)
    setTotalContributionsCount(contributionsData.data.totalContributionsCount)
    setGithubUsername(usernameData.githubUsername)
    setGitlabUsername(usernameData.gitlabUsername)

    const nextUrl = `/dashboard?github=${encodeURIComponent(usernameData.githubUsername)}&gitlab=${encodeURIComponent(usernameData.gitlabUsername)}`;
    router.replace(nextUrl, { scroll: false });
  }, [router]);

  const handleClose = useCallback(() => {
    setContributions(null);
    setTotalContributionsCount(0);
    setGithubUsername('');
    setGitlabUsername('');
    router.replace('/dashboard', { scroll: false });
  }, [router]);

  useEffect(() => {
    const github = searchParams.get("github");
    const gitlab = searchParams.get("gitlab");

    if (!github || !gitlab || contributions || isInitialLoading) {
      return;
    }

    const fetchSharedDashboard = async () => {
      try {
        setIsInitialLoading(true);
        const response = await fetch(`/api/contributions?github_username=${encodeURIComponent(github)}&gitlab_username=${encodeURIComponent(gitlab)}`);
        const result = await response.json() as ContributionsResponse | { error?: string };

        if (!response.ok || !("data" in result)) {
          throw new Error("error" in result && result.error ? result.error : "Unable to load shared dashboard");
        }

        handleContributionsFetch(result, { githubUsername: github, gitlabUsername: gitlab });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load shared dashboard");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchSharedDashboard();
  }, [searchParams, contributions, isInitialLoading, handleContributionsFetch])

  return (
    <>
      {!contributions ? (
        <>
          <UserInformationForm
            onContributionsFetch={handleContributionsFetch}
            initialGithubUsername={searchParams.get("github") || ""}
            initialGitlabUsername={searchParams.get("gitlab") || ""}
            isLoading={isInitialLoading}
          />
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }} 
          className="h-full min-h-0"
        >
          <ContributionsContainer 
            contributions={contributions} 
            totalContributionsCount={totalContributionsCount} 
            githubUsername={githubUsername} 
            gitlabUsername={gitlabUsername}
            setContributions={setContributions}
            onClose={handleClose}
            closeButton/>
        </motion.div>
      )}
    </>
  );
}

function DashboardLoading() {
  return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading dashboard...</div>;
}
