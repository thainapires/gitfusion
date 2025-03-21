"use client";

import { FaGithub } from "react-icons/fa";
import { FaGitlab } from "react-icons/fa6";
import { ThemeToggle } from "./components/layout/theme-toggle";

export default function Home() {
  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="max-w-3xl text-center px-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <FaGithub size={36} className="text-primary" />
          <div className="text-3xl font-bold">+</div>
          <FaGitlab size={36} className="text-primary" />
        </div>
        
        <h1 className="text-5xl font-bold mb-4">Git Fusion</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Seamlessly combine your GitHub and GitLab contributions into a unified, interactive visualization
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button className="gap-2">
            <span>Get Started</span>
          </button>
          <button>
            Learn More
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-lg font-medium mb-2">Unified View</h3>
            <p className="text-muted-foreground">See all your contributions in one place, regardless of platform</p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-lg font-medium mb-2">Interactive Graphs</h3>
            <p className="text-muted-foreground">Explore your activity with detailed, interactive visualizations</p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-lg font-medium mb-2">Cross-Platform Insights</h3>
            <p className="text-muted-foreground">Gain valuable insights across all your repositories</p>
          </div>
        </div>
        
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
      </div>
    </main>
  );
}
