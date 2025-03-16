"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Contributions } from "../api/contributions/route";
import ContributionsGraph from "./ContributionsGraph";
import ProfilePicture from "./ProfilePicture";
interface ContributionsContainerProps {
    contributions: Contributions;
    totalContributionsCount: number | null;
    githubUsername: string
    gitlabUsername: string
    setContributions: React.Dispatch<React.SetStateAction<Contributions | null>>
    closeButton?: boolean,
}

export default function ContributionsContainer({contributions, setContributions, closeButton = true, totalContributionsCount, githubUsername, gitlabUsername}: ContributionsContainerProps) {
    const [profilePictureUrl, setProfilePictureUrl] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(true)

    const getGithubProfilePicture = async () => {
        try {
            const response = await axios.get(`https://api.github.com/users/thainapires`)
            setProfilePictureUrl(response.data.avatar_url)
        }catch(error){
            console.log("Error fetching profile picture:", error)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getGithubProfilePicture()
    }, [])

    const onClose = () => {
        setContributions(null)
    } 

    return (
        <div className="relative p-4 sm:p-6">
            { closeButton && (
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-[#1a202c] rounded-full cursor-pointer"
                    aria-label="Close"
                 >
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}

            <div className="flex flex-col items-center">
                <div className="relative w-20 h-20 sm:w-30 sm:h-30 mb-6">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-700 rounded-full">
                            <svg className="animate-spin h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : (
                        <ProfilePicture
                            profilePictureUrl={profilePictureUrl}
                        />
                    )}
                </div>

                <div className="space-y-6 w-full mb-4">
                    <div className="flex flex-wrap justify-center gap-4">
                        <a 
                            href={`https://github.com/${githubUsername}`} 
                            target="_blank" 
                            className="flex items-center px-4 py-2 bg-[#262d3c] rounded-lg hover:bg-[#1d232f] transition-colors"
                        >
                            <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <span className="ml-2 text-white font-medium">{githubUsername}</span>
                        </a>
                        <a 
                            href={`https://gitlab.com/${gitlabUsername}`} 
                            target="_blank" 
                            className="flex items-center px-4 py-2 bg-[#262d3c] rounded-lg hover:bg-[#1d232f] transition-colors"
                        >
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"/>
                            </svg>
                            <span className="ml-2 text-white font-medium">{gitlabUsername}</span>
                        </a>
                    </div>
                </div>

                <div className="bg-[#262d3c] rounded-xl p-4 sm:p-6 backdrop-blur-sm w-full">
                    <div className="text-center">
                        {totalContributionsCount === 0 ? (
                            <Skeleton width={80} height={35} baseColor="#1A202C" highlightColor="#2D3748"/>
                        ): (
                            <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{totalContributionsCount}</div>
                        )}
                        <div className="text-sm font-medium text-gray-400 uppercase tracking-wide">Total Contributions</div>
                    </div>
                </div>
                
            </div>

            <div className="p-2 sm:p-4">
                {contributions.length ? (
                    <ContributionsGraph contributions={contributions} />
                ) : (
                    <Skeleton className="w-full h-10 md:h-20 lg:h-24" baseColor="#1A202C" highlightColor="#2D3748"/>
                )}
            </div>
        </div>
    )
}
