"use client";

export default function Footer() {
    return (
        <footer className="flex flex-col justify-center items-center py-6">
            <span className="text-xs text-zinc-300">
                Made with ❤️ by <a href="https://github.com/thainapires" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Thainá</a>
            </span>
            <span className="text-xs text-zinc-300 mt-1">
                View the project on <a href="https://github.com/thainapires/gitfusion" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">GitHub</a>
            </span>
        </footer> 
    )
}