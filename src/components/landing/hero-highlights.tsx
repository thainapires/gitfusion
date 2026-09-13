const productPillars = [
  { label: "Collect", value: "GitHub, GitLab and repository activity" },
  { label: "Understand", value: "Trends, streaks, languages and comparisons" },
  { label: "Share", value: "Public dashboard, README card and achievements" },
];

export function HeroHighlights() {
  return (
    <div className="grid w-full gap-2 border-y border-slate-700/50 py-3 text-sm text-slate-300 md:grid-cols-3 md:gap-3 md:border-y-0 md:py-0 lg:gap-0 lg:border-y lg:border-slate-700/50">
      {productPillars.map((pillar, index) => (
        <div
          key={pillar.label}
          className="flex items-start gap-4 rounded-lg border border-slate-700/50 bg-slate-950/30 px-4 py-3 md:block md:min-h-32 md:px-4 md:py-4 lg:min-h-0 lg:rounded-none lg:border-0 lg:border-r lg:bg-transparent lg:px-8 lg:py-4 lg:last:border-r-0"
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 font-mono text-[0.65rem] font-bold text-primary md:mb-3 lg:hidden">
            {String(index + 1).padStart(2, "0")}
          </div>

          <div className="min-w-0">
            <div className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.2em] text-primary">
              {pillar.label}
            </div>

            <div className="mt-1 max-w-[18rem] font-bold leading-5 text-slate-100 lg:leading-6">
              {pillar.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}