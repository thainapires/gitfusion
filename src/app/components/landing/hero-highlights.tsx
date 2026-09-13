const productPillars = [
  { label: "Collect", value: "GitHub, GitLab and repository activity" },
  { label: "Understand", value: "Trends, streaks, languages and comparisons" },
  { label: "Share", value: "Public dashboard, README card and achievements" },
];

export function HeroHighlights() {
  return (
    <div className="grid w-full border-y border-slate-700/50 text-sm text-slate-300 sm:grid-cols-3">
      {productPillars.map((pillar) => (
        <div key={pillar.label} className="border-slate-700/50 py-4 sm:border-r sm:px-6 sm:last:border-r-0 lg:px-8">
          <div className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.2em] text-primary">
            {pillar.label}
          </div>
          <div className="mt-1 max-w-[18rem] font-bold leading-6 text-slate-100">{pillar.value}</div>
        </div>
      ))}
    </div>
  );
}
