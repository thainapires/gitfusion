import Link from "next/link";
import { useState } from "react";
import { FaCodeMerge } from "react-icons/fa6";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
    const [ isConnected, setIsConnected ] = useState(false);

    const navItems = [
        { name: "Dashboard", path: "/dashboard" },
        /* { name: "Profile", path: "/profile" },
        { name: "Settings", path: "/settings" }, */
    ];

    return (
        <header className="border-b border-gray-700">
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2">
                        <FaCodeMerge className="h-6 w-6 text-primary" />
                        <span className="font-bold text-xl">Git Fusion</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                                /* className={`text-sm font-medium transition-colors hover:text-primary ${
                                    location.pathname === item.path
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                }`} */
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    {/* {isConnected ? (
                        <div>Logged menu</div>
                    ): (
                        <button >
                            <Link href="/dashboard">Get Started</Link>
                        </button>
                    )} */}
                </div>
            </div>
            
            {/* <ThemeToggle /> */}
        </header>
    )
    
}