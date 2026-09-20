import { useState } from "react";
import { FaGithub, FaGitlab } from "react-icons/fa";
import { ActivityItem } from "@/types/mock-app";

export function ActivityList({ activities, className = "" }: { activities: ActivityItem[]; className?: string }) {
  const [showAllOnMobile, setShowAllOnMobile] = useState(false);
  const visibleActivities = activities.slice(0, 6);

  return (
    <section className={`min-w-0 flex flex-col rounded-lg border border-border bg-card/85 p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-extrabold">Recent activity</h2>
        <span className="text-xs font-bold text-muted-foreground">Latest</span>
      </div>
      <div className="mt-4 divide-y divide-border/70 overflow-hidden">
        {!activities.length && (
          <div className="rounded-md border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
            No recent provider activity was returned yet.
          </div>
        )}
        {visibleActivities.map((activity, index) => {
          const Icon = activity.platform === "github" ? FaGithub : FaGitlab;
          const isExtraOnMobile = index >= 4 && !showAllOnMobile;

          return (
            <article
              key={activity.id}
              className={`gap-3 py-3 first:pt-0 last:pb-0 sm:flex ${isExtraOnMobile ? "hidden" : "flex"}`}
            >
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg border border-primary/15 bg-primary/12 text-primary">
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 truncate text-sm font-extrabold">{activity.title}</h3>
                  <time className="shrink-0 text-xs font-semibold text-muted-foreground">{activity.time}</time>
                </div>
                <p className="mt-1 overflow-hidden text-ellipsis text-xs font-semibold text-muted-foreground sm:truncate">{activity.description}</p>
              </div>
            </article>
          );
        })}
      </div>
      {visibleActivities.length > 4 && (
        <button
          type="button"
          onClick={() => setShowAllOnMobile((current) => !current)}
          className="mt-3 text-center text-xs font-extrabold text-primary sm:hidden"
        >
          {showAllOnMobile ? "Show less" : "View all"}
        </button>
      )}
    </section>
  );
}
