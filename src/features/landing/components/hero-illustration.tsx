import { FaGithub, FaGitlab } from "react-icons/fa6";
import { FiAward, FiBarChart2, FiCompass, FiGitPullRequest, FiGrid, FiHome, FiSettings, FiTarget, FiZap } from "react-icons/fi";
import { AppLogo } from "@/shared/components/app-logo";

const metrics = [
  { label: "Contributions", value: "2,482", trend: "+12%", icon: FiZap },
  { label: "Repositories", value: "30", trend: "+6%", icon: FiGrid },
  { label: "Pull requests", value: "86", trend: "+24%", icon: FiGitPullRequest },
  { label: "Current streak", value: "24 days", trend: "+4%", icon: FiTarget },
];

const navItems = [
  { label: "Dashboard", icon: FiHome, active: true },
  { label: "Integrations", icon: FiGrid },
  { label: "Analytics", icon: FiBarChart2 },
  { label: "Repositories", icon: FaGithub },
  { label: "Achievements", icon: FiAward },
  { label: "Explore", icon: FiCompass },
  { label: "Settings", icon: FiSettings },
];

const repositories = [
  ["gitfusion", "TypeScript", 92, "1,234"],
  ["portfolio", "TypeScript", 72, "892"],
  ["jobflow", "PHP", 55, "654"],
  ["dotfiles", "Shell", 30, "321"],
  ["study-notes", "Markdown", 24, "287"],
] as const;

const activities = [
  ["Pushed commits", "to gitfusion", "2h ago", FaGithub],
  ["Opened a pull request", "in portfolio", "5h ago", FiGitPullRequest],
  ["Merged pull request", "dotfiles", "1d ago", FaGithub],
] as const;

const heatmap = Array.from({ length: 52 }, (_, week) =>
  Array.from({ length: 7 }, (_, day) => (week * 3 + day * 5 + (week % 5)) % 5),
);

const chartPoints = "0,108 70,92 140,120 210,38 280,105 350,102 420,72 490,112 560,60 630,92";
const gitlabPoints = "0,112 70,88 140,72 210,96 280,66 350,94 420,86 490,82 560,78 630,58";

export function HeroIllustration() {
  return (
    <div id="product-preview" className="relative mx-auto mt-14 w-full max-w-[1120px] animate-hero-illustration sm:mt-16 lg:mt-20">
      <div className="absolute -inset-x-12 -inset-y-8 rounded-[2rem] bg-primary/18 blur-3xl" aria-hidden />
      <div className="relative mx-auto h-[236px] w-[347px] max-w-full min-[420px]:h-[268px] min-[420px]:w-[394px] sm:h-[441px] sm:w-[650px] md:h-[478px] md:w-[704px] lg:h-[679px] lg:w-[1000px] xl:h-[760px] xl:w-[1120px]">
        <div className="absolute left-0 top-0 h-[760px] w-[1120px] origin-top-left scale-[0.31] overflow-hidden rounded-lg border border-primary/45 bg-[#080a17] shadow-[0_26px_90px_rgba(0,0,0,0.42),0_0_60px_rgba(139,92,246,0.18)] min-[420px]:scale-[0.352] sm:scale-[0.58] md:scale-[0.629] lg:scale-[0.893] xl:scale-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.16),transparent_34rem)]" aria-hidden />
          <div className="relative grid h-full grid-cols-[190px_minmax(0,1fr)] text-white">
            <aside className="flex min-h-0 flex-col border-r border-white/10 bg-[#080b18]/95 px-4 py-5">
              <div className="mb-8 flex items-center gap-2 text-sm font-extrabold">
                <AppLogo className="size-6" />
                GitFusion
              </div>
              <nav className="space-y-2" aria-label="Preview navigation">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-extrabold ${item.active ? "bg-primary text-white" : "text-slate-500"}`}>
                      <Icon className="size-4" aria-hidden />
                      {item.label}
                    </div>
                  );
                })}
              </nav>
              <div className="mt-auto flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3">
                <span className="grid size-9 place-items-center rounded-full bg-primary text-xs font-extrabold">TP</span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-extrabold">Thainá Pires</p>
                  <p className="truncate text-[0.65rem] text-slate-500">@thainapires</p>
                </div>
              </div>
            </aside>

            <section className="min-w-0 p-5">
              <div className="mb-5 flex h-12 items-center rounded-lg border border-white/8 bg-white/[0.03] px-4">
                <FiHome className="mr-4 size-4 text-primary" aria-hidden />
                <div className="h-3 w-44 rounded-full bg-white/6" />
              </div>

              <header className="flex items-start justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-normal">Good to see you again, Jane! 👋</h2>
                  <p className="mt-1 text-sm font-medium text-slate-400">Here&apos;s your activity across GitHub and GitLab.</p>
                </div>
                <button className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-extrabold text-slate-300">Last 30 days</button>
              </header>

              <div className="mt-6 grid grid-cols-4 gap-4">
                {metrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <article key={metric.label} className="rounded-lg border border-white/10 bg-[#121827]/92 p-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-md border border-primary/30 bg-primary/15 text-primary">
                          <Icon className="size-5" aria-hidden />
                        </span>
                        <div>
                          <p className="text-xl font-extrabold leading-none">{metric.value}</p>
                          <p className="mt-1 text-xs font-bold text-slate-400">{metric.label}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs font-extrabold text-emerald-400">↑ {metric.trend}</p>
                    </article>
                  );
                })}
              </div>

              <article className="mt-4 rounded-lg border border-white/10 bg-[#101421]/95 p-4">
                <h3 className="text-sm font-extrabold">Contribution activity</h3>
                <div className="mt-4 flex gap-3 text-[0.64rem] font-bold text-slate-500">
                  <span className="w-8 pt-5">Mon</span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 grid grid-cols-12 text-center text-[0.62rem] text-slate-500">
                      { ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => <span key={month}>{month}</span>) }
                    </div>
                    <div className="grid grid-cols-52 gap-1">
                      {heatmap.map((week, weekIndex) => (
                        <div key={weekIndex} className="grid gap-1">
                          {week.map((level, dayIndex) => <span key={`${weekIndex}-${dayIndex}`} className={`size-2.5 rounded-[2px] ${heatColor(level)}`} />)}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-1.5 text-[0.62rem] text-slate-500">
                      Less {[0, 1, 2, 3, 4].map((level) => <span key={level} className={`size-2.5 rounded-[2px] ${heatColor(level)}`} />)} More
                    </div>
                  </div>
                </div>
              </article>

              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
                <TopRepositories />
                <ActivityOverview />
              </div>

              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] gap-4">
                <ConnectedAccounts />
                <RecentActivity />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopRepositories() {
  return (
    <article className="rounded-lg border border-white/10 bg-[#101421]/95 p-4">
      <h3 className="text-sm font-extrabold">Top repositories</h3>
      <div className="mt-4 space-y-3">
        {repositories.map(([name, language, width, count]) => (
          <div key={name} className="grid grid-cols-[1fr_130px_44px] items-center gap-4 text-xs">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-8 place-items-center rounded-md bg-white/[0.05]"><FaGithub className="size-4" aria-hidden /></span>
              <div className="min-w-0">
                <p className="truncate font-extrabold">{name}</p>
                <p className="text-[0.65rem] text-slate-500">{language}</p>
              </div>
            </div>
            <span className="h-1.5 rounded-full bg-white/8"><span className="block h-full rounded-full bg-primary" style={{ width: `${width}%` }} /></span>
            <span className="text-right font-extrabold">{count}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function ActivityOverview() {
  return (
    <article className="rounded-lg border border-white/10 bg-[#101421]/95 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold">Activity overview</h3>
        <div className="flex gap-4 text-[0.65rem] font-bold text-slate-400"><span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-primary" />GitHub</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-orange-500" />GitLab</span></div>
      </div>
      <svg viewBox="0 0 630 150" className="mt-5 h-36 w-full overflow-visible" role="img" aria-label="GitHub and GitLab activity line chart">
        <defs>
          <linearGradient id="gfChartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.34" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" /></linearGradient>
        </defs>
        {[30, 70, 110].map((y) => <line key={y} x1="0" x2="630" y1={y} y2={y} stroke="rgba(255,255,255,0.06)" />)}
        <polyline points={`0,150 ${chartPoints} 630,150`} fill="url(#gfChartFill)" />
        <polyline points={chartPoints} fill="none" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={gitlabPoints} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </article>
  );
}

function ConnectedAccounts() {
  return (
    <article className="rounded-lg border border-white/10 bg-[#101421]/95 p-4">
      <h3 className="text-sm font-extrabold">Connected accounts</h3>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Provider provider="github" name="GitHub" username="@thainapires" />
        <Provider provider="gitlab" name="GitLab" username="@thainapires" />
      </div>
    </article>
  );
}

function Provider({ provider, name, username }: { provider: "github" | "gitlab"; name: string; username: string }) {
  const Icon = provider === "github" ? FaGithub : FaGitlab;
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-white/[0.025] p-3">
      <div className="flex min-w-0 items-center gap-3"><Icon className={`size-7 shrink-0 ${provider === "gitlab" ? "text-orange-400" : "text-white"}`} aria-hidden /><div className="min-w-0"><p className="truncate text-xs font-extrabold">{name}</p><p className="truncate text-[0.65rem] text-slate-500">{username}</p></div></div>
      <span className="rounded-md bg-emerald-500/15 px-2 py-1 text-[0.62rem] font-extrabold text-emerald-400">Connected</span>
    </div>
  );
}

function RecentActivity() {
  return (
    <article className="rounded-lg border border-white/10 bg-[#101421]/95 p-4">
      <h3 className="text-sm font-extrabold">Recent activity</h3>
      <div className="mt-4 space-y-3">
        {activities.map(([title, description, time, Icon]) => (
          <div key={title} className="flex items-center gap-3 text-xs">
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/12 text-primary"><Icon className="size-4" aria-hidden /></span>
            <div className="min-w-0 flex-1"><p className="truncate font-extrabold">{title}</p><p className="truncate text-[0.65rem] text-slate-500">{description}</p></div>
            <time className="text-[0.65rem] font-bold text-slate-500">{time}</time>
          </div>
        ))}
      </div>
    </article>
  );
}

function heatColor(level: number) {
  if (level === 0) return "bg-[#1b2030]";
  if (level === 1) return "bg-[#3b256f]";
  if (level === 2) return "bg-[#6d28d9]";
  if (level === 3) return "bg-[#8b5cf6]";
  return "bg-[#c084fc]";
}
