import { FaGithub, FaGitlab } from "react-icons/fa6";
import { FiActivity, FiAward, FiBarChart2, FiCompass, FiFolder, FiGitPullRequest, FiGrid } from "react-icons/fi";
import { AppLogo } from "@/shared/components/app-logo";

const metrics = [
  { label: "Total contributions", value: "2,482", helper: "GitHub 1,846 · GitLab 636", trend: "217 active days", icon: FiActivity, visual: "line" },
  { label: "Repositories", value: "18", helper: "Across 2 providers", trend: "Loaded from providers", icon: FiFolder, visual: "bars" },
  { label: "Pull / merge requests", value: "86", helper: "Detected from provider APIs", trend: "Last year window", icon: FiGitPullRequest, visual: "bars" },
] as const;

const navItems = [
  { label: "Dashboard", icon: FiGrid, active: true },
  { label: "Repositories", icon: FiGitPullRequest, active: false },
  { label: "Analytics", icon: FiBarChart2, active: false },
  { label: "Achievements", icon: FiAward, active: false },
  { label: "Explore", icon: FiCompass, active: false },
] as const;

const repositories = [
  ["gitfusion", "TypeScript", "284", FaGithub],
  ["atlas-ui", "TypeScript", "193", FaGitlab],
  ["pulse-api", "Python", "146", FaGithub],
] as const;

const activities = [
  ["Merged pull request", "gitfusion/web", "2h", FaGithub],
  ["Pushed 4 commits", "atlas-ui", "1d", FaGitlab],
  ["Opened pull request", "gitfusion/api", "2d", FaGithub],
] as const;

const heatmap = Array.from({ length: 52 }, (_, week) =>
  Array.from({ length: 7 }, (_, day) => (week * 5 + day * 3 + (week % 4)) % 5),
);

const githubPoints = "0,91 70,74 140,88 210,38 280,84 350,62 420,70 490,34 560,49 630,22";
const gitlabPoints = "0,98 70,83 140,70 210,82 280,61 350,76 420,58 490,66 560,44 630,52";

export function HeroIllustration() {
  return (
    <div
      id="product-preview"
      className="relative mx-auto mt-14 w-full max-w-[1120px] animate-hero-illustration sm:mt-16 lg:mt-20"
      role="img"
      aria-label="Preview of the GitFusion dashboard showing developer metrics, connected GitHub and GitLab accounts, contribution activity, repositories, and recent activity"
    >
      <div className="absolute -inset-x-12 -inset-y-8 rounded-[2rem] bg-primary/18 blur-3xl" aria-hidden />
      <div className="relative mx-auto h-[236px] w-[347px] max-w-full min-[420px]:h-[268px] min-[420px]:w-[394px] sm:h-[441px] sm:w-[650px] md:h-[478px] md:w-[704px] lg:h-[679px] lg:w-[1000px] xl:h-[760px] xl:w-[1120px]">
        <div className="absolute left-0 top-0 h-[760px] w-[1120px] origin-top-left scale-[0.31] overflow-hidden rounded-xl border border-primary/40 bg-[#080a17] text-white shadow-[0_26px_90px_rgba(0,0,0,0.42),0_0_60px_rgba(139,92,246,0.18)] min-[420px]:scale-[0.352] sm:scale-[0.58] md:scale-[0.629] lg:scale-[0.893] xl:scale-100">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_16%,rgba(139,92,246,0.2),transparent_30rem)]" aria-hidden />

          <div className="relative flex h-16 items-center gap-6 border-b border-white/10 bg-[#080a17]/90 px-6 backdrop-blur-xl">
            <div className="flex shrink-0 items-center gap-2.5 text-sm font-extrabold">
              <AppLogo className="size-7" />
              GitFusion
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${item.active ? "bg-primary/18 text-primary ring-1 ring-primary/25" : "text-slate-500"}`}>
                    <Icon className="size-3.5" aria-hidden />
                    {item.label}
                  </div>
                );
              })}
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300">Last year</div>
            <span className="grid size-9 place-items-center rounded-full bg-primary text-xs font-extrabold ring-1 ring-white/15">AM</span>
          </div>

          <main className="px-7 py-5">
            <section className="relative min-h-36 overflow-hidden py-3">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_45%,rgba(139,92,246,0.23),rgba(139,92,246,0.06)_36%,transparent_68%)]" aria-hidden />
              <div className="relative grid grid-cols-[minmax(0,1fr)_280px] items-center gap-8">
                <div>
                  <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-primary">Dashboard</p>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-normal">Good to see you again, Alex! 👋</h2>
                  <p className="mt-2 text-sm font-medium text-slate-400">Here&apos;s your connected GitHub and GitLab activity overview.</p>
                </div>
                <div className="rounded-lg border border-primary/25 bg-[#111526]/75 p-4 shadow-xl shadow-primary/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full border border-primary/30 bg-primary/15 text-xl">🔥</span>
                    <div><p className="text-[0.65rem] font-bold text-slate-400">Current streak</p><p className="mt-0.5 text-xl font-extrabold">9 <span className="text-xs text-slate-400">days</span></p></div>
                  </div>
                  <div className="mt-3 flex gap-1.5">{Array.from({ length: 8 }, (_, index) => <span key={index} className={`h-2 flex-1 rounded-full ${index < 5 ? "bg-primary" : "bg-white/8"}`} />)}</div>
                </div>
              </div>
            </section>

            <div className="mt-3 grid grid-cols-[repeat(3,minmax(0,1fr))_250px] gap-4">
              {metrics.map((metric) => <MetricPreview key={metric.label} metric={metric} />)}
              <ConnectedAccounts />
            </div>

            <div className="mt-4 grid grid-cols-[minmax(0,1fr)_250px] gap-4">
              <div className="space-y-4">
                <ContributionActivity />
                <div className="grid grid-cols-2 gap-4">
                  <TopRepositories />
                  <ActivityOverview />
                </div>
              </div>
              <div className="space-y-4">
                <RecentActivity />
                <Languages />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function MetricPreview({ metric }: { metric: (typeof metrics)[number] }) {
  const Icon = metric.icon;
  return (
    <article className="min-w-0 rounded-lg border border-primary/18 bg-[#111526]/88 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-primary/25 bg-primary/14 text-primary"><Icon className="size-4" aria-hidden /></span>
        <div className="min-w-0"><p className="truncate text-[0.68rem] font-bold text-slate-400">{metric.label}</p><p className="mt-2 text-2xl font-extrabold">{metric.value}</p><p className="mt-1 truncate text-[0.6rem] font-semibold text-slate-500">{metric.helper}</p></div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2"><p className="truncate text-[0.65rem] font-bold text-primary">{metric.trend}</p><MetricVisual type={metric.visual} /></div>
    </article>
  );
}

function MetricVisual({ type }: { type: "line" | "bars" }) {
  if (type === "bars") return <div className="flex h-7 items-end gap-1">{[9, 14, 20, 16, 24, 28].map((height, index) => <span key={index} className="w-1.5 rounded-t-sm bg-primary/80" style={{ height }} />)}</div>;
  return <svg viewBox="0 0 70 28" className="h-7 w-16" aria-hidden><path d="M1 24 C10 8 17 22 25 13 S36 24 45 12 59 6 69 5" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" /></svg>;
}

function ConnectedAccounts() {
  return (
    <article className="rounded-lg border border-white/10 bg-[#111526]/88 p-4">
      <div className="flex items-center justify-between"><h3 className="text-xs font-extrabold">Connected accounts</h3><span className="text-[0.6rem] font-semibold text-slate-500">2/2 connected</span></div>
      <div className="mt-3 space-y-2"><Provider icon={FaGithub} name="GitHub" username="@alexdev" /><Provider icon={FaGitlab} name="GitLab" username="@alex.morgan" gitlab /></div>
    </article>
  );
}

function Provider({ icon: Icon, name, username, gitlab = false }: { icon: typeof FaGithub; name: string; username: string; gitlab?: boolean }) {
  return <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-black/10 p-2.5"><span className={`grid size-8 shrink-0 place-items-center rounded-md ${gitlab ? "bg-orange-500/15 text-orange-400" : "bg-slate-950 text-white"}`}><Icon className="size-4" aria-hidden /></span><div className="min-w-0 flex-1"><p className="truncate text-[0.68rem] font-extrabold">{name}</p><p className="truncate text-[0.58rem] text-slate-500">{username}</p></div><span className="rounded-full bg-emerald-500/12 px-2 py-1 text-[0.55rem] font-extrabold text-emerald-400">Connected</span></div>;
}

function ContributionActivity() {
  return (
    <article className="rounded-lg border border-white/10 bg-[#111526]/88 p-4">
      <div className="flex items-start justify-between"><div><h3 className="text-sm font-extrabold">Contribution activity</h3><p className="mt-1 text-[0.65rem] text-slate-500">Daily activity across connected platforms.</p></div><div className="flex gap-4 text-[0.6rem] font-bold text-slate-400"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />GitHub</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-orange-500" />GitLab</span></div></div>
      <div className="mt-3 flex gap-3 text-[0.55rem] font-bold text-slate-500"><span className="w-7 pt-5">Mon</span><div className="min-w-0 flex-1"><div className="mb-2 grid grid-cols-12 text-center">{["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((month) => <span key={month}>{month}</span>)}</div><div className="grid grid-cols-52 gap-1">{heatmap.map((week, weekIndex) => <div key={weekIndex} className="grid gap-1">{week.map((level, dayIndex) => <span key={`${weekIndex}-${dayIndex}`} className={`size-2 rounded-[2px] ${heatColor(level)}`} />)}</div>)}</div></div></div>
    </article>
  );
}

function TopRepositories() {
  return <article className="rounded-lg border border-white/10 bg-[#111526]/88 p-4"><h3 className="text-xs font-extrabold">Top repositories</h3><div className="mt-3 space-y-2.5">{repositories.map(([name, language, count, Icon]) => <div key={name} className="flex items-center gap-3 text-[0.65rem]"><span className="grid size-7 place-items-center rounded-md bg-white/[0.05]"><Icon className="size-3.5" aria-hidden /></span><div className="min-w-0 flex-1"><p className="truncate font-extrabold">{name}</p><p className="text-[0.55rem] text-slate-500">{language}</p></div><span className="font-extrabold">{count}</span></div>)}</div></article>;
}

function ActivityOverview() {
  return <article className="rounded-lg border border-white/10 bg-[#111526]/88 p-4"><div className="flex items-center justify-between"><h3 className="text-xs font-extrabold">Activity overview</h3><div className="flex gap-2 text-[0.55rem] text-slate-500"><span>● GitHub</span><span className="text-orange-400">● GitLab</span></div></div><svg viewBox="0 0 630 115" className="mt-3 h-24 w-full" role="presentation">{[28, 60, 92].map((y) => <line key={y} x1="0" x2="630" y1={y} y2={y} stroke="rgba(255,255,255,0.06)" />)}<polyline points={gitlabPoints} fill="none" stroke="#f97316" strokeWidth="3" /><polyline points={githubPoints} fill="none" stroke="#8b5cf6" strokeWidth="4" /></svg></article>;
}

function RecentActivity() {
  return <article className="rounded-lg border border-white/10 bg-[#111526]/88 p-4"><h3 className="text-xs font-extrabold">Recent activity</h3><div className="mt-3 space-y-3">{activities.map(([title, repo, time, Icon]) => <div key={title} className="flex items-center gap-2.5"><span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary/12 text-primary"><Icon className="size-3.5" aria-hidden /></span><div className="min-w-0 flex-1"><p className="truncate text-[0.63rem] font-extrabold">{title}</p><p className="truncate text-[0.54rem] text-slate-500">{repo}</p></div><time className="text-[0.54rem] font-bold text-slate-500">{time}</time></div>)}</div></article>;
}

function Languages() {
  const languages = [["TypeScript", "43%", "bg-cyan-300"], ["Python", "24%", "bg-violet-400"], ["Vue", "18%", "bg-pink-300"], ["Go", "15%", "bg-amber-300"]] as const;
  return <article className="rounded-lg border border-white/10 bg-[#111526]/88 p-4"><h3 className="text-xs font-extrabold">Languages</h3><div className="mt-3 flex items-center gap-4"><div className="relative size-20 shrink-0 rounded-full bg-[conic-gradient(#67e8f9_0_43%,#a78bfa_43%_67%,#f9a8d4_67%_85%,#fbbf24_85%)]"><span className="absolute inset-3 rounded-full bg-[#111526]" /></div><div className="min-w-0 flex-1 space-y-2">{languages.map(([name, percent, color]) => <div key={name} className="flex items-center gap-2 text-[0.58rem]"><span className={`size-2 rounded-full ${color}`} /><span className="flex-1 text-slate-400">{name}</span><span className="font-extrabold">{percent}</span></div>)}</div></div></article>;
}

function heatColor(level: number) {
  if (level === 0) return "bg-[#1b2030]";
  if (level === 1) return "bg-[#3b256f]";
  if (level === 2) return "bg-[#6d28d9]";
  if (level === 3) return "bg-[#8b5cf6]";
  return "bg-[#c084fc]";
}
