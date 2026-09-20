import { IconType } from "react-icons";
import { DashboardMetric } from "@/types/mock-app";

type EnhancedMetric = DashboardMetric & {
  icon?: IconType;
  visual?: "sparkline" | "bars" | "progress";
};

export function MetricCard({ metric }: { metric: EnhancedMetric }) {
  const Icon = metric.icon;

  return (
    <article className={`${metric.mobile ? "sm:hidden" : ""} relative min-h-[138px] min-w-0 overflow-hidden rounded-lg border border-primary/18 bg-card/85 p-5 shadow-sm`}>
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          {Icon && (
            <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-primary/25 bg-primary/14 text-primary shadow-[0_0_28px_rgba(139,92,246,0.12)]">
              <Icon className="size-5" aria-hidden />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-muted-foreground">{metric.label}</p>
            <div className="mt-3 break-words text-2xl font-extrabold tracking-normal sm:text-3xl">{metric.value}</div>
            <p className="mt-2 text-xs font-semibold text-muted-foreground">{metric.helper}</p>
          </div>
        </div>
        <span className="grid size-8 shrink-0 place-items-center rounded-full border border-primary/15 bg-background/70 text-primary">↗</span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="min-w-0 truncate text-sm font-bold text-primary">{metric.trend}</p>
        <MetricVisual type={metric.visual} />
      </div>
    </article>
  );
}

function MetricVisual({ type }: { type?: EnhancedMetric["visual"] }) {
  if (type === "bars") {
    return (
      <div className="flex h-10 shrink-0 items-end gap-1.5" aria-hidden>
        {[18, 24, 30, 25, 34, 39, 46].map((height, index) => (
          <span key={index} className="w-2 rounded-t-sm bg-primary/80" style={{ height }} />
        ))}
      </div>
    );
  }

  if (type === "progress") {
    return (
      <div className="flex shrink-0 gap-1.5" aria-hidden>
        {[0, 1, 2, 3, 4, 5, 6].map((index) => (
          <span key={index} className={"h-3 w-2 rounded-full " + (index < 4 ? "bg-primary" : "bg-muted")} />
        ))}
      </div>
    );
  }

  return (
    <svg viewBox="0 0 92 38" className="h-10 w-24 shrink-0" aria-hidden>
      <path d="M1 31 C12 12 20 28 31 18 S47 31 59 17 78 8 91 7" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
      <path d="M1 37 C12 20 20 34 31 24 S47 37 59 23 78 14 91 13 L91 38 L1 38 Z" fill="var(--primary)" opacity="0.16" />
    </svg>
  );
}
