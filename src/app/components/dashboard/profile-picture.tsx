"use client";

import Image from "next/image";

interface ProfilePictureProps {
    profilePictureUrl: string | null;
}

export default function ProfilePicture({profilePictureUrl}: ProfilePictureProps) {
    return (
        <>
            {profilePictureUrl ? (
                <Image
                    src={profilePictureUrl}
                    alt="profile picture"
                    className="rounded-full border-4 border-primary p-1" 
                    width={192}
                    height={192}
                />
            ) : (
                <Image
                    src="https://avatars.githubusercontent.com/u/100000000000?v=4"
                    alt="default profile picture"
                    className="rounded-full border-4 border-primary p-1"
                    width={192}
                    height={192}
                />
            )}
        </>
    )
}