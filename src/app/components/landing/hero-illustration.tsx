import { FaCodeMerge, FaGithub, FaGitlab } from "react-icons/fa6";
import { FiGrid, FiSettings } from "react-icons/fi";

const metrics = [
  { label: "Contributions", value: "2,482", note: "312 active days" },
  { label: "Repos", value: "30", note: "6 active" },
  { label: "PRs / MRs", value: "86", note: "last year" },
  { label: "Streak", value: "24", note: "days" },
];

const repositories = [
  { name: "gitfusion", platform: "github", language: "TypeScript", contributions: 342 },
  { name: "portfolio", platform: "github", language: "TypeScript", contributions: 288 },
  { name: "master3", platform: "gitlab", language: "PHP", contributions: 226 },
];

const weeks = Array.from({ length: 42 }, (_, index) => index);

function levelFor(index: number) {
  const pattern = [0, 1, 2, 3, 1, 0, 4, 2, 3, 1, 0, 2, 4, 3, 1, 2, 0, 3, 4, 1, 2];
  return pattern[index % pattern.length];
}

function PlatformIcon({ platform }: { platform: "github" | "gitlab" }) {
  return platform === "github" ? (
    <FaGithub className="size-3 text-slate-200" aria-hidden />
  ) : (
    <FaGitlab className="size-3 text-orange-400" aria-hidden />
  );
}

export function HeroIllustration() {
  return (
    <div className="animate-hero-illustration relative mx-auto mt-10 w-full max-w-[46rem] lg:mt-0">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-700/70 bg-[#060d1c]/95 shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(139,92,246,0.16),transparent_34%),radial-gradient(circle_at_82%_74%,rgba(16,185,129,0.12),transparent_28%)]" aria-hidden />

        <div className="absolute inset-0 origin-top-left scale-[0.52] sm:scale-[0.64] md:scale-[0.73] lg:scale-[0.67] xl:scale-[0.73]">
          <div className="grid h-[560px] w-[1000px] grid-cols-[180px_minmax(0,1fr)] bg-[#060d1c] text-white">
            <aside className="flex flex-col border-r border-slate-800/90 bg-slate-950/35 p-5">
              <div className="mb-8 flex items-center gap-2 text-sm font-extrabold">
                <FaCodeMerge className="size-5 text-primary" aria-hidden />
                Git Fusion
              </div>

              <nav className="space-y-2 text-xs font-extrabold">
                <div className="flex items-center gap-2 rounded-md bg-primary px-3 py-2.5">
                  <FiGrid className="size-3.5" aria-hidden />
                  Dashboard
                </div>
                <div className="flex items-center gap-2 rounded-md px-3 py-2.5 text-slate-500">
                  <span className="size-3.5 rounded-sm border border-slate-700" />
                  Repositories
                </div>
                <div className="flex items-center gap-2 rounded-md px-3 py-2.5 text-slate-500">
                  <span className="size-3.5 rounded-sm border border-slate-700" />
                  Analytics
                </div>
                <div className="flex items-center gap-2 rounded-md px-3 py-2.5 text-slate-500">
                  <FiSettings className="size-3.5" aria-hidden />
                  Settings
                </div>
              </nav>

              <div className="mt-auto rounded-md bg-slate-950/80 p-3">
                <div className="text-xs font-extrabold">Thainá Pires</div>
                <div className="mt-1 truncate text-[0.68rem] font-semibold text-slate-500">thaina@example.com</div>
              </div>
            </aside>

            <section className="min-w-0 p-6">
              <header className="mb-4 flex items-end justify-between border-b border-slate-800 pb-4">
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-primary">Git Fusion</p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-normal">Good to see you again, Thainá</h2>
                  <p className="mt-1 text-xs font-medium text-slate-400">Connected GitHub and GitLab activity overview.</p>
                </div>
                <button className="h-9 rounded-md border border-slate-700 px-3 text-xs font-extrabold text-slate-300">Refresh</button>
              </header>

              <div className="grid grid-cols-4 gap-3">
                {metrics.map((metric) => (
                  <article key={metric.label} className="h-24 rounded-lg border border-slate-800 bg-slate-900/80 p-3">
                    <p className="text-[0.65rem] font-bold text-slate-500">{metric.label}</p>
                    <p className="mt-2 text-2xl font-extrabold">{metric.value}</p>
                    <p className="mt-1 text-[0.65rem] font-bold text-emerald-300">{metric.note}</p>
                  </article>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_250px] gap-4">
                <div className="space-y-4">
                  <article className="rounded-lg border border-slate-800 bg-slate-900/80 p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-extrabold">Contribution graph</h3>
                        <p className="mt-1 text-[0.68rem] font-medium text-slate-500">Daily activity across connected platforms.</p>
                      </div>
                      <div className="flex gap-3 text-[0.68rem] font-bold text-slate-500">
                        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-slate-200" />GitHub</span>
                        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-orange-500" />GitLab</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-[repeat(42,minmax(0,1fr))] gap-1" aria-hidden>
                      {weeks.map((week) => (
                        <div key={week} className="grid gap-1">
                          {Array.from({ length: 7 }, (_, day) => {
                            const colors = ["bg-[#172033]", "bg-[#1f6f4a]", "bg-[#2e9f63]", "bg-[#55c878]", "bg-[#9be36f]"];
                            return <span key={day} className={`size-2.5 rounded-[2px] ${colors[levelFor(week * 7 + day)]}`} />;
                          })}
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="rounded-lg border border-slate-800 bg-slate-900/80 p-4">
                    <h3 className="text-sm font-extrabold">Top repositories</h3>
                    <div className="mt-2 divide-y divide-slate-800">
                      {repositories.map((repo) => (
                        <div key={repo.name} className="grid grid-cols-[minmax(0,1fr)_82px_48px] items-center gap-3 py-2 text-xs">
                          <div className="min-w-0">
                            <div className="truncate font-extrabold">{repo.name}</div>
                            <div className="mt-0.5 text-[0.68rem] text-slate-500">{repo.language}</div>
                          </div>
                          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-400">
                            <PlatformIcon platform={repo.platform as "github" | "gitlab"} />
                            {repo.platform}
                          </span>
                          <span className="text-right font-extrabold text-slate-200">{repo.contributions}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>

                <aside className="space-y-3">
                  <ProviderCard provider="github" name="GitHub" username="mockhub" />
                  <ProviderCard provider="gitlab" name="GitLab" username="mocklab" />

                  <article className="rounded-lg border border-slate-800 bg-slate-900/80 p-4">
                    <h3 className="text-sm font-extrabold">Recent activity</h3>
                    <div className="mt-3 space-y-3">
                      <Activity provider="github" title="Pushed commits" repo="gitfusion/dashboard" />
                      <Activity provider="gitlab" title="Opened merge request" repo="portfolio/analytics" />
                    </div>
                  </article>
                </aside>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProviderCard({ provider, name, username }: { provider: "github" | "gitlab"; name: string; username: string }) {
  return (
    <article className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`grid size-9 place-items-center rounded-md ${provider === "github" ? "bg-slate-950 text-white" : "bg-orange-950/60 text-orange-400"}`}>
            <PlatformIcon platform={provider} />
          </span>
          <div>
            <p className="text-xs font-extrabold">{name}</p>
            <p className="text-[0.68rem] text-slate-500">@{username}</p>
          </div>
        </div>
        <span className="rounded-md bg-emerald-500 px-2 py-1 text-[0.65rem] font-extrabold">Connected</span>
      </div>
    </article>
  );
}

function Activity({ provider, title, repo }: { provider: "github" | "gitlab"; title: string; repo: string }) {
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-slate-950 text-slate-300">
        <PlatformIcon platform={provider} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-extrabold">{title}</p>
        <p className="truncate text-[0.68rem] text-slate-500">{repo}</p>
      </div>
    </div>
  );
}
