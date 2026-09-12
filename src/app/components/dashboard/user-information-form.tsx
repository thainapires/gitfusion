"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { FaGithub } from "react-icons/fa";
import { FaGitlab } from "react-icons/fa6";
import { IoIosWarning } from "react-icons/io";
import { Tooltip } from 'react-tooltip';
import { toast } from "sonner";
import { z } from "zod";
import { ContributionsResponse } from "../../types/contributions";

const recentProfilesKey = "gitfusion:recent-profiles";

const FormData = z.object({
    github_username: z.string().trim().min(1, "GitHub username is required"),
    gitlab_username: z.string().trim().min(1, "GitLab username is required"),
})

type FormData = z.infer<typeof FormData>

type RecentProfile = {
    githubUsername: string;
    gitlabUsername: string;
};

export type UsernameData = RecentProfile;

interface UserInformationFormProps {
    onContributionsFetch: (contributionsData: ContributionsResponse, usernameData: UsernameData) => void;
    initialGithubUsername?: string;
    initialGitlabUsername?: string;
    isLoading?: boolean;
}

export default function UserInformationForm({onContributionsFetch, initialGithubUsername = "", initialGitlabUsername = "", isLoading = false}: UserInformationFormProps) {
    const [recentProfiles, setRecentProfiles] = useState<RecentProfile[]>([]);
    const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm<FormData>({
        resolver: zodResolver(FormData),
        defaultValues: {
            github_username: initialGithubUsername,
            gitlab_username: initialGitlabUsername,
        },
    })

    useEffect(() => {
        reset({
            github_username: initialGithubUsername,
            gitlab_username: initialGitlabUsername,
        });
    }, [initialGithubUsername, initialGitlabUsername, reset]);

    useEffect(() => {
        const savedProfiles = window.localStorage.getItem(recentProfilesKey);
        if (!savedProfiles) return;

        try {
            const parsedProfiles = JSON.parse(savedProfiles) as RecentProfile[];
            setRecentProfiles(parsedProfiles.slice(0, 5));
        } catch {
            window.localStorage.removeItem(recentProfilesKey);
        }
    }, []);

    const fetchContributions = async (data: FormData) => {
        try {
            const response = await fetch(
                `/api/contributions?github_username=${encodeURIComponent(data.github_username)}&gitlab_username=${encodeURIComponent(data.gitlab_username)}`
            )

            const result = await response.json()
            
            if(!response.ok){
                throw new Error(result.error || "Unknown error occurred while fetching contributions.");
            }

            const usernameData = {
                githubUsername: data.github_username,
                gitlabUsername: data.gitlab_username
            };

            saveRecentProfile(usernameData);
            onContributionsFetch(result, usernameData)

        } catch (error) {
            toast.error(error instanceof Error ? error.message : "An unexpected error occurred.");
        }
    };

    const saveRecentProfile = (profile: RecentProfile) => {
        const nextProfiles = [
            profile,
            ...recentProfiles.filter((recentProfile) => (
                recentProfile.githubUsername !== profile.githubUsername || recentProfile.gitlabUsername !== profile.gitlabUsername
            )),
        ].slice(0, 5);

        setRecentProfiles(nextProfiles);
        window.localStorage.setItem(recentProfilesKey, JSON.stringify(nextProfiles));
    };

    const selectRecentProfile = (profile: RecentProfile) => {
        reset({
            github_username: profile.githubUsername,
            gitlab_username: profile.gitlabUsername,
        });
    };

    const onError = (errors: FieldErrors<FormData>) => {
        Object.values(errors).forEach((error) => {
            if (error?.message) {
                toast.error(error.message);
            }
        });
    };

    const isButtonLoading = isSubmitting || isLoading;

    return (
        <div className="flex justify-center h-full items-center p-6 sm:p-8">
            <form onSubmit={handleSubmit(fetchContributions, onError)} className="space-y-6 p-8 w-full max-w-xl">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="github-username" className="label font-bold">GitHub Username</label>
                        <div className="relative mt-2">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaGithub className="h-5 w-5 text-gray-600 dark:text-white" />
                            </div>
                            <input 
                                type="text" 
                                id="github-username" 
                                {...register("github_username")}
                                className="block w-full pl-10 pr-3 py-2 rounded-md text-slate-600 dark:text-slate-300 bg-card border border-gray-300 dark:border-none placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="Enter your github username"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="gitlab-username" className="label font-bold">Gitlab Username</label>
                        <div className="relative mt-2">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaGitlab className="h-4 w-4 text-gray-600 dark:text-white" />
                            </div>

                            <input 
                                type="text" 
                                id="gitlab-username" 
                                {...register("gitlab_username")}
                                className="block w-full pl-10 pr-3 py-2 rounded-md text-slate-600 dark:text-slate-300 bg-card border border-gray-300 dark:border-none placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="Enter your gitlab username"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <Tooltip id="gitlab-warning"/>
                                <IoIosWarning 
                                    className="h-5 w-5 text-yellow-500"
                                    data-tooltip-id="gitlab-warning"
                                    data-tooltip-content="Don't forget to enable contributions visibility in your GitLab account. You can do this by accessing gitlab profile settings"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {recentProfiles.length > 0 && (
                    <div className="space-y-2">
                        <div className="text-sm font-semibold text-muted-foreground">Recent profiles</div>
                        <div className="flex flex-wrap gap-2">
                            {recentProfiles.map((profile) => (
                                <button
                                    type="button"
                                    key={`${profile.githubUsername}-${profile.gitlabUsername}`}
                                    onClick={() => selectRecentProfile(profile)}
                                    className="px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-sm hover:border-primary"
                                >
                                    {profile.githubUsername} / {profile.gitlabUsername}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <button 
                    type="submit"
                    className="w-full flex justify-center cursor-pointer py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold bg-primary hover:bg-violet-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isButtonLoading}
                >
                    {isButtonLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        <>Generate contributions graph</>
                    )}
                </button>
            </form>
        </div>
    )
}
