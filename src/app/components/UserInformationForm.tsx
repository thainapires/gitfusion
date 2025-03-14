"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaGithub } from "react-icons/fa";
import { FaGitlab } from "react-icons/fa6";
import { z } from "zod";
import { Contributions } from "../api/contributions/route";

const FormData = z.object({
    github_username: z.string(),
    gitlab_username: z.string(),
})

type FormData = z.infer<typeof FormData>

export type ContributionsResponse = {
    data: {
        contributions: Contributions        
        totalContributionsCount: number
    }
}

export type UsernameData = {
    githubUsername: string,
    gitlabUsername: string
}
interface UserInformationFormProps {
    onContributionsFetch: (contributionsData: ContributionsResponse, usernameData: UsernameData) => void
}

export default function UserInformationForm({onContributionsFetch}: UserInformationFormProps) {
    const { register, handleSubmit, formState: {errors}} = useForm<FormData>()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchContributions = async (data: {github_username: string, gitlab_username: string}) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await fetch(`/api/contributions?github_username=${data.github_username}&gitlab_username=${data.gitlab_username}`);
            if(!response.ok){
                throw new Error('Failed to fetch contributions')
            }

            const contributionsData = await response.json()

            onContributionsFetch(contributionsData, {githubUsername: data.github_username, gitlabUsername: data.gitlab_username})

        } catch (error) {
            setError("Error fetching contributions: " + (error instanceof Error ? error.message : ""));
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = (data: { github_username: string, gitlab_username: string }) => {
        fetchContributions(data);
    }

    return (
        <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="github-username" className="label text-zinc-300 font-bold">GitHub Username</label>
                        <div className="relative mt-2">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaGithub className="h-5 w-5 text-zinc-300" />
                            </div>
                            <input 
                                type="text" 
                                id="github-username" 
                                {...register("github_username", { required: "GitHub username is required" })}
                                className="block w-full pl-10 pr-3 py-2 border border-neutral-600 rounded-md text-slate-300 bg-neutral-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                placeholder="Enter your github username"
                                required
                            />
                        </div>
                        {errors.github_username && (
                            <span className="text-red-500 text-sm">{errors.github_username.message}</span>
                        )}
                    </div>

                    <div>
                        <label htmlFor="gitlab-username" className="label text-zinc-300 font-bold">Gitlab Username</label>
                        <div className="relative mt-2">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaGitlab className="h-4 w-4 text-zinc-300" />
                            </div>
                            <input 
                                type="text" 
                                id="gitlab-username" 
                                {...register("gitlab_username", { required: "GitLab username is required" })}
                                className="block w-full pl-10 pr-3 py-2 border border-neutral-600 rounded-md text-slate-300 bg-neutral-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                placeholder="Enter your gitlab username"
                                required
                            />
                        </div>
                        {errors.gitlab_username && (
                            <span className="text-red-500 text-sm">{errors.gitlab_username.message}</span>
                        )}
                    </div>
                </div>

                <button 
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-zinc-300 bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        <span>Generate contributions graph</span>
                    )}
                </button>

                {error && (
                    <div className="text-red-500 text-sm mt-4">{error}</div>
                )}

                <div className="mt-6 text-sm text-gray-400">
                    <div className="flex items-center text-yellow-600 mb-2">
                        <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        Don't forget to enable contributions visibility in your GitLab account
                    </div>
                    <a 
                        href="https://gitlab.com/-/profile" 
                        target="_blank" 
                        className="inline-flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        GitLab profile settings
                        <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                        </svg>
                    </a>
                </div>
            </form>
        </div>
    )
}
