import Image from "next/image";
import { FaGithub, FaGitlab } from "react-icons/fa6";
import { FiGitPullRequest, FiGrid, FiRefreshCw, FiSettings } from "react-icons/fi";
import { AppLogo } from "../ui/app-logo";

const metrics = [
  { label: "Total contributions", value: "2,482", helper: "GitHub 1,420 · GitLab 1,062", trend: "312 active days" },
  { label: "Repositories", value: "30", helper: "Connected provider repositories", trend: "Loaded from providers" },
  { label: "Pull / merge requests", value: "86", helper: "Detected from provider APIs", trend: "Last year window" },
];

const repositories = [
  { name: "jane/gitfusion", platform: "github", language: "TypeScript", contributions: 342, visibility: "Public" },
  { name: "jane/portfolio", platform: "github", language: "TypeScript", contributions: 288, visibility: "Public" },
  { name: "work/master3", platform: "gitlab", language: "PHP", contributions: 226, visibility: "Private" },
];

const weeks = Array.from({ length: 42 }, (_, index) => index);

function levelFor(index: number) {
  const pattern = [0, 1, 2, 3, 1, 0, 4, 2, 3, 1, 0, 2, 4, 3, 1, 2, 0, 3, 4, 1, 2];
  return pattern[index % pattern.length];
}

function PlatformIcon({ platform }: { platform: "github" | "gitlab" }) {
  return platform === "github" ? (
    <FaGithub className="size-3.5 text-slate-200" aria-hidden />
  ) : (
    <FaGitlab className="size-3.5 text-orange-400" aria-hidden />
  );
}

export function HeroIllustration() {
  return (
    <div className="animate-hero-illustration relative mx-auto w-full max-w-[46rem] lg:mt-0 mb-10 lg:mb-0">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-700/70 bg-[#060d1c]/95 shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_52%_6%,rgba(16,185,129,0.12),transparent_34%),radial-gradient(ellipse_at_82%_82%,rgba(139,92,246,0.12),transparent_32%)]" aria-hidden />

        <div className="absolute inset-0 origin-top-left scale-[0.35] sm:scale-[0.57] md:scale-[0.64] lg:scale-[0.6] xl:scale-[0.64]">
          <div className="grid h-[560px] w-[1000px] grid-cols-[180px_minmax(0,1fr)] bg-[#060d1c] text-white">
            <aside className="flex flex-col border-r border-slate-800/90 bg-slate-950/35 p-5">
              <div className="mb-8 flex items-center gap-2 text-sm font-extrabold">
                <AppLogo className="size-6" />
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
                  <FiGitPullRequest className="size-3.5" aria-hidden />
                  Analytics
                </div>
                <div className="flex items-center gap-2 rounded-md px-3 py-2.5 text-slate-500">
                  <FiSettings className="size-3.5" aria-hidden />
                  Settings
                </div>
              </nav>

              <div className="mt-auto rounded-md bg-slate-950/80 p-3">
                <div className="text-xs font-extrabold">Jane Doe</div>
                <div className="mt-1 truncate text-[0.68rem] font-semibold text-slate-500">janedoe@example.com</div>
              </div>
            </aside>

            <section className="min-w-0 p-6">
              <header className="mb-4 flex items-end justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-normal">Good to see you again, Jane</h2>
                  <p className="mt-1 text-xs font-medium text-slate-400">Here is your connected GitHub and GitLab activity overview.</p>
                </div>
                <button className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-700 px-3 text-xs font-extrabold text-slate-300">
                  <FiRefreshCw className="size-3.5" aria-hidden />
                  Refresh
                </button>
              </header>

              <article className="relative mb-4 min-h-[116px] overflow-hidden rounded-lg border border-primary/35 bg-slate-900/80 p-4">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_58%_100%,rgba(139,92,246,0.30)_0%,rgba(139,92,246,0.12)_40%,transparent_74%)]" aria-hidden />
                <Image
                  src="/images/keep-going-mountains.png"
                  alt=""
                  width={1536}
                  height={512}
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 -bottom-32 z-10 w-full object-contain opacity-70"
                />
                <div className="relative z-20 flex items-center justify-between gap-6">
                  <div className="min-w-0">
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-primary">Keep the streak going!</p>
                    <h3 className="mt-2 text-xl font-extrabold">Your consistency is paying off.</h3>
                    <p className="mt-1 text-xs font-medium text-slate-400">You&apos;ve been active for <span className="font-bold text-slate-100">312 days</span> out of 366 days this year.</p>
                  </div>
                  <div className="w-[170px] shrink-0 rounded-lg border border-white/10 bg-slate-950/55 p-4 backdrop-blur-sm">
                    <p className="text-xs font-bold text-slate-400">Current streak</p>
                    <p className="mt-2 text-2xl font-extrabold">24 <span className="text-sm">days</span></p>
                    <p className="mt-1 text-[0.68rem] font-medium text-slate-500">Nice momentum.</p>
                  </div>
                </div>
              </article>

              <div className="grid grid-cols-[minmax(0,1fr)_250px] gap-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {metrics.map((metric) => (
                      <article key={metric.label} className="h-28 rounded-lg border border-slate-800 bg-slate-900/80 p-3 shadow-sm">
                        <p className="truncate text-[0.72rem] font-bold text-slate-500">{metric.label}</p>
                        <p className="mt-2 text-2xl font-extrabold">{metric.value}</p>
                        <p className="mt-1 truncate text-[0.65rem] font-medium text-slate-500">{metric.helper}</p>
                        <p className="mt-2 truncate text-[0.65rem] font-bold text-primary">{metric.trend}</p>
                      </article>
                    ))}
                  </div>

                  <article className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-extrabold">Contribution graph</h3>
                        <p className="mt-1 text-[0.68rem] font-medium text-slate-500">Daily synced activity across connected platforms.</p>
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

                  <article className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
                    <h3 className="text-sm font-extrabold">Top repositories</h3>
                    <div className="mt-2 divide-y divide-slate-800">
                      {repositories.map((repo) => (
                        <div key={repo.name} className="grid grid-cols-[minmax(0,1fr)_82px_48px] items-center gap-3 py-2 text-xs">
                          <div className="min-w-0">
                            <div className="truncate font-extrabold">{repo.name}</div>
                            <div className="mt-0.5 text-[0.68rem] text-slate-500">{repo.language} · {repo.visibility}</div>
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
                  <ProviderCard provider="github" name="GitHub" username="mockhub" stats="1,420 contributions" />
                  <ProviderCard provider="gitlab" name="GitLab" username="mocklab" stats="1,062 contributions" />

                  <article className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
                    <h3 className="text-sm font-extrabold">Recent activity</h3>
                    <div className="mt-3 space-y-3">
                      <Activity provider="github" title="Pushed commits" repo="jane/gitfusion" />
                      <Activity provider="gitlab" title="Opened merge request" repo="work/master3" />
                      <Activity provider="github" title="Updated pull request" repo="jane/portfolio" />
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

function ProviderCard({ provider, name, username, stats }: { provider: "github" | "gitlab"; name: string; username: string; stats: string }) {
  return (
    <article className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`grid size-9 shrink-0 place-items-center rounded-md ${provider === "github" ? "bg-slate-950 text-white" : "bg-orange-950/60 text-orange-400"}`}>
            <PlatformIcon platform={provider} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-extrabold">{name}</p>
            <p className="truncate text-[0.68rem] text-slate-500">@{username}</p>
          </div>
        </div>
        <span className="rounded-md bg-emerald-500 px-2 py-1 text-[0.65rem] font-extrabold text-emerald-950">Connected</span>
      </div>
      <p className="mt-3 border-t border-slate-800 pt-2 text-[0.68rem] font-bold text-slate-500">{stats}</p>
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
