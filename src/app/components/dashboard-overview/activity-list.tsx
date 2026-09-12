import { FaGithub, FaGitlab } from "react-icons/fa";
import { ActivityItem } from "../../types/mock-app";

export function ActivityList({ activities }: { activities: ActivityItem[] }) {
  return (
    <section className="min-w-0 rounded-lg border border-gray-200 bg-card p-4 shadow-sm dark:border-gray-800 sm:p-5">
      <h2 className="text-lg font-extrabold">Recent activity</h2>
      <div className="mt-4 space-y-4">
        {!activities.length && (
          <div className="rounded-md border border-gray-200 bg-background p-4 text-sm leading-6 text-muted-foreground dark:border-gray-800">
            No recent provider activity was returned yet.
          </div>
        )}
        {activities.map((activity) => {
          const Icon = activity.platform === "github" ? FaGithub : FaGitlab;
          return (
            <article key={activity.id} className="flex gap-3">
              <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-md bg-background text-muted-foreground">
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-bold">{activity.title}</h3>
                  <time className="text-xs font-semibold text-muted-foreground">{activity.time}</time>
                </div>
                <p className="mt-1 overflow-hidden text-ellipsis text-sm text-muted-foreground sm:truncate">{activity.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
