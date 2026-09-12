import { DashboardMetric } from "../../types/mock-app";

export function MetricCard({ metric }: { metric: DashboardMetric }) {
  return (
    <article className="rounded-lg border border-gray-200 bg-card p-5 shadow-sm dark:border-gray-800">
      <p className="text-sm font-bold text-muted-foreground">{metric.label}</p>
      <div className="mt-3 text-3xl font-extrabold tracking-normal">{metric.value}</div>
      <p className="mt-2 text-sm text-muted-foreground">{metric.helper}</p>
      <p className="mt-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">{metric.trend}</p>
    </article>
  );
}
