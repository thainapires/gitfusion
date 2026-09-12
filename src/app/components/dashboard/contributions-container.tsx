"use client";

import axios from "axios";
import { useMemo, useState, useEffect } from "react";
import { FaGithub, FaGitlab } from "react-icons/fa";
import { IoArrowBack, IoCopyOutline } from "react-icons/io5";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "sonner";
import { ContributionFilters, ContributionPeriod, ContributionPlatform, Contributions } from "../../types/contributions";
import { applyContributionFilters, buildContributionSummary, getPlatformLabel } from "../../utils/contributions";
import ContributionsGraph from "./contributions-graph";
import ProfilePicture from "./profile-picture";

interface ContributionsContainerProps {
    contributions: Contributions;
    totalContributionsCount: number | null;
    githubUsername: string
    gitlabUsername: string
    setContributions: React.Dispatch<React.SetStateAction<Contributions | null>>
    closeButton?: boolean,
    onClose?: () => void,
}

const platformOptions: { value: ContributionPlatform; label: string }[] = [
    { value: "combined", label: "Combined" },
    { value: "github", label: "GitHub" },
    { value: "gitlab", label: "GitLab" },
];

const periodOptions: { value: ContributionPeriod; label: string }[] = [
    { value: "all", label: "All" },
    { value: "30d", label: "30 days" },
    { value: "90d", label: "90 days" },
    { value: "year", label: "This year" },
    { value: "last-year", label: "Last year" },
    { value: "custom", label: "Custom" },
];

export default function ContributionsContainer({contributions, setContributions, closeButton = true, totalContributionsCount, githubUsername, gitlabUsername, onClose: handleClose}: ContributionsContainerProps) {
    const [profilePictureUrl, setProfilePictureUrl] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(true)
    const [filters, setFilters] = useState<ContributionFilters>({ platform: "combined", period: "all" })

    const filteredContributions = useMemo(() => applyContributionFilters(contributions, filters), [contributions, filters]);
    const summary = useMemo(() => buildContributionSummary(filteredContributions, filters.platform), [filteredContributions, filters.platform]);
    const readmeUrl = `/api/contributions-readme?github_username=${encodeURIComponent(githubUsername)}&gitlab_username=${encodeURIComponent(gitlabUsername)}&platform=${filters.platform}&period=${filters.period}${filters.from ? `&from=${filters.from}` : ""}${filters.to ? `&to=${filters.to}` : ""}`;

    useEffect(() => {
        const getGithubProfilePicture = async () => {
            try {
                setLoading(true)
                const response = await axios.get(`https://api.github.com/users/${encodeURIComponent(githubUsername)}`)
                setProfilePictureUrl(response.data.avatar_url)
            }catch(error){
                console.log("Error fetching profile picture:", error)
                setProfilePictureUrl("")
            } finally {
                setLoading(false);
            }
        }

        getGithubProfilePicture()
    }, [githubUsername])

    const onClose = () => {
        if (handleClose) {
            handleClose();
            return;
        }

        setContributions(null)
    }

    const updateFilter = (nextFilters: Partial<ContributionFilters>) => {
        setFilters((currentFilters) => ({ ...currentFilters, ...nextFilters }));
    };

    const copyShareUrl = async () => {
        const url = `${window.location.origin}/dashboard?github=${encodeURIComponent(githubUsername)}&gitlab=${encodeURIComponent(gitlabUsername)}`;
        await navigator.clipboard.writeText(url);
        toast.success("Dashboard URL copied");
    };

    const copyReadmeMarkdown = async () => {
        const url = `${window.location.origin}${readmeUrl}`;
        await navigator.clipboard.writeText(`![Git Fusion contributions](${url})`);
        toast.success("README markdown copied");
    };

    return (
        <div className="w-full max-w-7xl flex flex-col h-full items-center p-4 sm:p-6 mx-auto overflow-y-auto">
            { closeButton && (
                <button 
                    onClick={onClose}
                    className="self-start flex justify-center items-center gap-2 p-2 m-2 text-gray-700 dark:text-gray-400 hover:text-primary hover:dark:text-white hover:dark:bg-gray-800 rounded-full cursor-pointer"
                    aria-label="Close"
                 >
                    <IoArrowBack className="w-5 h-5"/> 
                    Voltar
                </button>
            )}

            <div className="flex flex-col items-center w-full gap-5">
                <div className="relative w-20 h-20 sm:w-32 sm:h-32">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-700 rounded-full">
                            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : (
                        <ProfilePicture profilePictureUrl={profilePictureUrl} />
                    )}
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                    <a href={`https://github.com/${githubUsername}`} target="_blank" className="flex items-center px-4 py-2 bg-card border border-gray-200 dark:border-gray-700 rounded-md hover:border-primary transition-colors">
                        <FaGithub className="w-5 h-5" />
                        <span className="ml-2 font-medium">{githubUsername}</span>
                    </a>
                    <a href={`https://gitlab.com/${gitlabUsername}`} target="_blank" className="flex items-center px-4 py-2 bg-card border border-gray-200 dark:border-gray-700 rounded-md hover:border-primary transition-colors">
                        <FaGitlab className="w-5 h-5" />
                        <span className="ml-2 font-medium">{gitlabUsername}</span>
                    </a>
                </div>
            </div>

            <div className="w-full grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 mt-6">
                <div className="space-y-4">
                    <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                        <div className="flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
                            <div className="space-y-2">
                                <div className="text-sm font-semibold text-muted-foreground">Platform</div>
                                <div className="flex flex-wrap gap-2">
                                    {platformOptions.map((option) => (
                                        <button key={option.value} type="button" onClick={() => updateFilter({ platform: option.value })} className={`px-3 py-2 rounded-md text-sm border transition-colors ${filters.platform === option.value ? "bg-primary text-white border-primary" : "border-gray-200 dark:border-gray-700 hover:border-primary"}`}>
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-semibold text-muted-foreground">Period</div>
                                <div className="flex flex-wrap gap-2">
                                    {periodOptions.map((option) => (
                                        <button key={option.value} type="button" onClick={() => updateFilter({ period: option.value })} className={`px-3 py-2 rounded-md text-sm border transition-colors ${filters.period === option.value ? "bg-primary text-white border-primary" : "border-gray-200 dark:border-gray-700 hover:border-primary"}`}>
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {filters.period === "custom" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <label className="text-sm font-medium text-muted-foreground">
                                    From
                                    <input type="date" value={filters.from || ""} onChange={(event) => updateFilter({ from: event.target.value })} className="mt-1 block w-full rounded-md bg-background border border-gray-200 dark:border-gray-700 px-3 py-2 text-foreground" />
                                </label>
                                <label className="text-sm font-medium text-muted-foreground">
                                    To
                                    <input type="date" value={filters.to || ""} onChange={(event) => updateFilter({ to: event.target.value })} className="mt-1 block w-full rounded-md bg-background border border-gray-200 dark:border-gray-700 px-3 py-2 text-foreground" />
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5">
                        {filteredContributions.length ? (
                            <ContributionsGraph contributions={filteredContributions} platform={filters.platform} />
                        ) : (
                            <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">No contributions for this filter</div>
                        )}
                    </div>
                </div>

                <aside className="space-y-4">
                    <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="text-sm font-semibold text-muted-foreground">{getPlatformLabel(filters.platform)} total</div>
                        {totalContributionsCount === null ? (
                            <Skeleton width={80} height={35} baseColor="#1A202C" highlightColor="#2D3748"/>
                        ) : (
                            <div className="text-4xl font-bold mt-1">{summary.total}</div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Metric label="GitHub" value={summary.githubTotal} />
                        <Metric label="GitLab" value={summary.gitlabTotal} />
                        <Metric label="Active days" value={summary.activeDays} />
                        <Metric label="Avg/week" value={summary.averagePerWeek} />
                        <Metric label="Best streak" value={summary.longestStreak} />
                        <Metric label="Current streak" value={summary.currentStreak} />
                    </div>

                    <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                        <div className="text-sm font-semibold text-muted-foreground">Platform split</div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800 flex">
                            <div className="bg-[#24292f]" style={{ width: `${summary.githubShare}%` }} />
                            <div className="bg-[#fc6d26]" style={{ width: `${summary.gitlabShare}%` }} />
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>GitHub {summary.githubShare}%</span>
                            <span>GitLab {summary.gitlabShare}%</span>
                        </div>
                    </div>

                    <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                        <ComparisonRow label="Best week" value={`${summary.bestWeek.count} · ${summary.bestWeek.label}`} />
                        <ComparisonRow label="Best month" value={`${summary.bestMonth.count} · ${summary.bestMonth.label}`} />
                    </div>

                    <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                        <button type="button" onClick={copyShareUrl} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark">
                            <IoCopyOutline className="w-4 h-4" />
                            Copy dashboard URL
                        </button>
                        <button type="button" onClick={copyReadmeMarkdown} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-sm font-semibold hover:border-primary">
                            <IoCopyOutline className="w-4 h-4" />
                            Copy README card
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    )
}

function Metric({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase">{label}</div>
            <div className="text-xl font-bold mt-1">{value}</div>
        </div>
    );
}

function ComparisonRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value}</span>
        </div>
    );
}
