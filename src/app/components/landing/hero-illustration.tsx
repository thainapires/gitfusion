import { FaCodeMerge, FaGithub, FaGitlab } from "react-icons/fa6";

const weeks = Array.from({ length: 20 }, (_, index) => index);
const modules = [
  { label: "Repos", value: "42", note: "tracked" },
  { label: "Languages", value: "8", note: "active" },
  { label: "Best streak", value: "17", note: "days" },
];
const navItems = ["Overview", "Repos", "Analytics", "Compare", "Badges"];

function levelFor(index: number) {
  const pattern = [0, 1, 3, 4, 2, 0, 2, 1, 3, 4, 2, 0, 1, 3, 2, 4];
  return pattern[index % pattern.length];
}

export function HeroIllustration() {
  return (
    <div className="animate-hero-illustration relative mx-auto mt-10 w-full max-w-[45rem] lg:mt-0">
      <div className="relative border border-slate-700/70 bg-slate-950/50 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
        <div className="grid grid-cols-1 md:min-h-[25rem] md:grid-cols-[9rem_1fr]">
          <div className="hidden border-r border-slate-800/90 p-4 md:block">
            <div className="mb-6 flex items-center gap-2 text-sm font-extrabold text-white">
              <span className="grid size-7 place-items-center border border-emerald-400/40 text-emerald-300"><FaCodeMerge className="size-4" aria-hidden /></span>
              Git Fusion
            </div>
            <div className="space-y-2">
              {navItems.map((item, index) => (
                <div key={item} className={`px-3 py-2 text-xs font-bold ${index === 0 ? "bg-emerald-300 text-slate-950" : "text-slate-500"}`}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="mb-5 flex flex-col gap-4 border-b border-slate-800 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Activity profile</p>
                <p className="mt-1 text-xl font-extrabold text-white">Thaina developer map</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                <span className="flex items-center gap-1.5"><FaGithub className="size-4" /> GitHub</span>
                <span className="text-slate-600">+</span>
                <span className="flex items-center gap-1.5"><FaGitlab className="size-4 text-[#fc6d26]" /> GitLab</span>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_13rem]">
              <div>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-200">Contributions</p>
                    <p className="text-xs font-medium text-slate-500">Merged calendar, not a single-source snapshot.</p>
                  </div>
                  <p className="font-mono text-xs font-bold text-emerald-300">2,482 commits</p>
                </div>

                <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1" aria-hidden>
                  {weeks.map((week) => (
                    <div key={week} className="grid gap-1">
                      {Array.from({ length: 7 }, (_, day) => {
                        const level = levelFor(week * 7 + day);
                        const colors = [
                          "bg-slate-800/80",
                          "bg-emerald-950",
                          "bg-emerald-800",
                          "bg-emerald-600",
                          "bg-emerald-300",
                        ];

                        return <span key={day} className={`aspect-square w-full ${colors[level]}`} />;
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
                {modules.map((module) => (
                  <div key={module.label} className="border border-slate-800 bg-slate-900/55 p-3">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-500">{module.label}</p>
                    <p className="mt-2 text-2xl font-extrabold text-white">{module.value}</p>
                    <p className="text-xs font-semibold text-slate-500">{module.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-2 border-t border-slate-800 pt-4 text-xs font-bold text-slate-400 sm:grid-cols-3">
              <span>Compare platform output</span>
              <span>Reveal language patterns</span>
              <span>Turn milestones into badges</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
