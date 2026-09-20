import { FaGithub, FaGitlab } from "react-icons/fa";
import { RepositorySummary } from "@/types/mock-app";

export function RepositoryTable({ repositories }: { repositories: RepositorySummary[] }) {
  const maxContributions = Math.max(...repositories.map((repo) => repo.contributions), 1);

  return (
    <section className="min-w-0 rounded-lg border border-border bg-card/85 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-extrabold">Top repositories</h2>
        <span className="text-xs font-bold text-muted-foreground">Top {Math.min(repositories.length, 5)}</span>
      </div>
      {!repositories.length ? (
        <div className="mt-4 rounded-md border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
          No repositories were returned by the connected providers yet.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {repositories.slice(0, 5).map((repo, index) => {
            const Icon = repo.platform === "github" ? FaGithub : FaGitlab;
            const width = `${Math.max((repo.contributions / maxContributions) * 100, 8)}%`;

            return (
              <article key={`${repo.platform}-${repo.name}`} className="grid min-w-0 grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-3">
                <span className="text-xs font-extrabold text-muted-foreground">{index + 1}</span>
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon className={"size-3.5 shrink-0 " + (repo.platform === "github" ? "text-slate-200" : "text-orange-400")} aria-hidden />
                    <h3 className="truncate text-sm font-extrabold">{repo.name}</h3>
                    <span className="hidden shrink-0 rounded-full bg-background px-2 py-0.5 text-[0.65rem] font-bold text-muted-foreground sm:inline">{repo.visibility}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="w-20 shrink-0 truncate text-xs font-semibold text-muted-foreground">{repo.language}</span>
                    <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                      <span className="block h-full rounded-full bg-primary" style={{ width }} />
                    </span>
                  </div>
                </div>
                <span className="text-sm font-extrabold">{repo.contributions.toLocaleString("en-US")}</span>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
