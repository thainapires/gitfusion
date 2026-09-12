import { FaGithub, FaGitlab } from "react-icons/fa";
import { RepositorySummary } from "../../types/mock-app";

export function RepositoryTable({ repositories }: { repositories: RepositorySummary[] }) {
  return (
    <section className="min-w-0 rounded-lg border border-gray-200 bg-card p-4 shadow-sm dark:border-gray-800 sm:p-5">
      <h2 className="text-lg font-extrabold">Top repositories</h2>
      {!repositories.length ? (
        <div className="mt-4 rounded-md border border-gray-200 bg-background p-4 text-sm leading-6 text-muted-foreground dark:border-gray-800">
          No repositories were returned by the connected providers yet.
        </div>
      ) : (
      <div className="mt-4 max-w-full overflow-x-auto">
        <table className="w-full min-w-[30rem] text-left text-sm sm:min-w-[34rem]">
          <thead className="border-b border-gray-200 text-xs uppercase text-muted-foreground dark:border-gray-800">
            <tr>
              <th className="py-3 pr-4">Repository</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Language</th>
              <th className="px-4 py-3 text-right">Contributions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {repositories.map((repo) => {
              const Icon = repo.platform === "github" ? FaGithub : FaGitlab;
              return (
                <tr key={repo.name}>
                  <td className="py-4 pr-4">
                    <div className="max-w-[13rem] truncate font-bold sm:max-w-none">{repo.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{repo.visibility}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <Icon className="size-4" aria-hidden />
                      {repo.platform}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">{repo.language}</td>
                  <td className="px-4 py-4 text-right font-extrabold">{repo.contributions}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </section>
  );
}
