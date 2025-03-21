"use client";

import { LuGithub } from "react-icons/lu";
import { RiGitlabLine } from "react-icons/ri";
import { ThemeToggle } from "./components/layout/theme-toggle";

export default function Home() {
  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center bg-background text-foreground pt-24 md:pt-0">
      <div className="max-w-4xl text-center px-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <LuGithub size={36} className="text-primary" />
          <div className="text-3xl font-bold">+</div>
          <RiGitlabLine size={36} className="text-primary" />
        </div>
        
        <h1 className="text-5xl font-bold mb-4">Git Fusion</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Seamlessly combine your GitHub and GitLab contributions into a unified, interactive visualization
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              className="bg-primary hover:bg-violet-600 hover:text-white py-[0.4rem] px-8 rounded-md text-sm font-medium shadow text-background h-10 cursor-pointer"
              onClick={() => window.location.href = '/dashboard'}
            >
              <span>Get Started</span>
            </button>
            <button 
              className="py-[0.4rem] px-8 rounded-md text-sm font-medium shadow border border-gray-200 dark:border-gray-600 h-10 cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
              onClick={() => window.location.href = '/dashboard'}
            >
              Learn More
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-3">Unified View</h3>
            <p className="mb-4 text-muted-foreground">See all your contributions in one place, regardless of platform</p>
            <span className="mt-2 bg-emerald-600 px-3 py-1 text-sm font-medium text-white opacity-90 ring-offset-background  rounded-sm">Available</span>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-card bg-muted p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-3">Interactive Graphs</h3>
            <p className="mb-4 text-muted-foreground">Explore your activity with detailed, interactive visualizations</p>
            <span className="mt-2 animate-pulse bg-yellow-600 px-3 py-1 text-sm font-medium text-white opacity-90 ring-offset-background dark:bg-yellow-500 rounded-sm">Coming Soon</span>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-card bg-muted p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-3">Cross-Platform Insights</h3>
            <p className="mb-4 text-muted-foreground">Gain valuable insights across all your repositories</p>
            <span className="mt-2 animate-pulse bg-yellow-600 px-3 py-1 text-sm font-medium text-white opacity-90 ring-offset-background dark:bg-yellow-500 rounded-sm">Coming Soon</span>
          </div>
        </div>
        
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
      </div>
    </main>
  );
}
