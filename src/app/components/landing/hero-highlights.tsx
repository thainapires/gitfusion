import { IconType } from "react-icons";
import {
  FiActivity,
  FiGitMerge,
  FiGithub,
  FiLayers,
} from "react-icons/fi";

const highlights: Array<{
  title: string;
  description: string;
  Icon: IconType;
}> = [
  {
    title: "GitHub + GitLab",
    description: "All contributions together",
    Icon: FiGitMerge,
  },
  {
    title: "Unified analytics",
    description: "One view for your activity",
    Icon: FiActivity,
  },
  {
    title: "Developer insights",
    description: "Patterns, streaks and progress",
    Icon: FiLayers,
  },
  {
    title: "Open source",
    description: "Free and built for developers",
    Icon: FiGithub,
  },
];

export function HeroHighlights() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 pt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 lg:pt-12">
      {highlights.map(({ title, description, Icon }) => (
        <div key={title} className="group flex items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-500/10 text-violet-300 transition duration-300 group-hover:bg-violet-500/15 group-hover:text-violet-200">
            <Icon className="size-6" aria-hidden />
          </div>

          <div>
            <p className="text-base font-bold text-slate-100">
              {title}
            </p>

            <p className="mt-1.5 max-w-[15rem] text-sm leading-6 text-slate-400">
              {description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}