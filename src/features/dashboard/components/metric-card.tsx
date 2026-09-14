import { DashboardMetric } from "@/types/mock-app";

export function MetricCard({ metric }: { metric: DashboardMetric }) {
  return (
    <article className={`${metric.mobile ? "sm:hidden" : ""} min-w-0 rounded-lg border border-gray-200 bg-card p-4 shadow-sm dark:border-gray-800 sm:p-5`}>
      <p className="text-sm font-bold text-muted-foreground">{metric.label}</p>
      <div className="mt-3 break-words text-2xl font-extrabold tracking-normal sm:text-3xl">{metric.value}</div>
      <p className="mt-2 text-sm text-muted-foreground">{metric.helper}</p>
      <p className="mt-4 text-sm font-bold text-primary">{metric.trend}</p>
    </article>
  );
}
