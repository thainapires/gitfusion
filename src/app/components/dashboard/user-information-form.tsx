"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaGithub } from "react-icons/fa";
import { FaGitlab } from "react-icons/fa6";
import { IoIosWarning } from "react-icons/io";
import { MdArrowOutward } from "react-icons/md";
import { toast, Toaster } from "sonner";
import { z } from "zod";
import { Contributions } from "../../api/contributions/route";

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

    const fetchContributions = async (data: {github_username: string, gitlab_username: string}) => {
        try {
            setIsLoading(true)

            const response = await fetch(
                `/api/contributions?github_username=${data.github_username}&gitlab_username=${data.gitlab_username}`
            )

            const result = await response.json()
            
            if(!response.ok){
                throw new Error(result.error || "Unknown error occurred while fetching contributions.");
            }

            onContributionsFetch(result, {
                githubUsername: data.github_username,
                gitlabUsername: data.gitlab_username
            })

        } catch (error) {
            toast.error(error instanceof Error ? error.message : "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = (data: { github_username: string, gitlab_username: string }) => {
        fetchContributions(data);
    }

    const onError = (errors: any) => {
        for (const field in errors) {
            if (errors[field]?.message) {
                toast.error(errors[field].message);
            }
        }
    };

    return (
        <div className="flex justify-center h-full items-center p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6 p-8 w-full max-w-xl">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="github-username" className="label font-bold">GitHub Username</label>
                        <div className="relative mt-2">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaGithub className="h-5 w-5 text-primary" />
                            </div>
                            <input 
                                type="text" 
                                id="github-username" 
                                {...register("github_username", { required: "GitHub username is required" })}
                                className="block w-full pl-10 pr-3 py-2 rounded-md text-slate-600 dark:text-slate-300 bg-card border border-gray-300 dark:border-none placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="Enter your github username"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="gitlab-username" className="label font-bold">Gitlab Username</label>
                        <div className="relative mt-2">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaGitlab className="h-4 w-4  text-primary" />
                            </div>

                            <input 
                                type="text" 
                                id="gitlab-username" 
                                {...register("gitlab_username", { required: "GitLab username is required" })}
                                className="block w-full pl-10 pr-3 py-2 rounded-md text-slate-600 dark:text-slate-300 bg-card border border-gray-300 dark:border-none placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="Enter your gitlab username"
                                required
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                
                                <div className="relative group">
                                    <IoIosWarning 
                                        className="h-5 w-5 text-yellow-500"
                                    />

                                    <div
                                        className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition duration-100 transform group-hover:translate-y-0 translate-y-2"
                                    >
                                        <div className="bg-card w-max max-w-xs text-white rounded-lg px-4 py-4 shadow-xl drop-shadow">
                                            <p className="font-bold text-md mb-1">Hello there! 👋</p>
                                            <p className="text-sm">
                                                Don't forget to enable <strong>contributions visibility</strong> in your GitLab account.
                                                You can do this by accessing gitlab profile settings
                                                <br /><br />
                                                <div className="flex items-center gap-1">
                                                    <a href="/" className="text-primary">Gitlab Profile Settings! </a>
                                                    <MdArrowOutward className="text-primary"/>
                                                </div>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* <button 
              className="py-[0.4rem] px-8 rounded-md text-sm font-medium shadow text-background h-10 cursor-pointer"
              onClick={() => window.location.href = '/dashboard'}
            > */}
                <button 
                    type="submit"
                    className="w-full flex justify-center cursor-pointer py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-primary hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <>Generate contributions graph</>
                    )}
                </button>
                <Toaster richColors/>
            </form>
        </div>
    )
}
