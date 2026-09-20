"use client";

import { SVGAttributes } from "react";
import CalendarHeatmap, { ReactCalendarHeatmapValue } from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Tooltip } from "react-tooltip";
import { DailyContribution } from "@/types/mock-app";

type CalendarContribution = ReactCalendarHeatmapValue<Date> & Omit<DailyContribution, "date">;

export function ContributionChart({ data }: { data: DailyContribution[] }) {
  const values: CalendarContribution[] = data.map((contribution) => ({
    ...contribution,
    date: parseLocalDate(contribution.date),
    count: contribution.total,
  }));

  const startDate = values[0]?.date ?? new Date();
  const endDate = values[values.length - 1]?.date ?? new Date();

  const tooltipDataAttrs = (value?: ReactCalendarHeatmapValue<Date>): SVGAttributes<SVGElement> => {
    const contribution = value as CalendarContribution | undefined;

    if (!contribution?.date) {
      return {};
    }

    return {
      "data-tooltip-id": "dashboard-contributions-tooltip",
      "data-tooltip-content": `${contribution.total} contributions on ${contribution.date.toLocaleDateString("en-US")} | GitHub: ${contribution.platforms.github} | GitLab: ${contribution.platforms.gitlab}`,
    } as SVGAttributes<SVGElement>;
  };

  return (
    <section className="min-w-0 rounded-lg border border-border bg-card/85 p-5 shadow-sm lg:p-6">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold">Contribution activity</h2>
          <p className="mt-1 text-sm text-muted-foreground">Daily activity across connected platforms.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-bold text-muted-foreground">
          <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-primary" />GitHub</span>
          <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-orange-500" />GitLab</span>
        </div>
      </div>

      <div className="gf-contribution-calendar mt-6 max-w-full overflow-x-auto pb-1">
        <div className="min-w-[48rem] xl:min-w-[58rem] 2xl:min-w-0">
          <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={values}
            showWeekdayLabels
            showOutOfRangeDays
            gutterSize={3}
            tooltipDataAttrs={tooltipDataAttrs}
            classForValue={classForValue}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 text-xs font-medium text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Each square represents one day.</p>
        <div className="flex items-center gap-2">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span key={level} className={`size-3 rounded-sm gf-legend-scale-${level}`} />
          ))}
          <span>More</span>
        </div>
      </div>
      <Tooltip id="dashboard-contributions-tooltip" />
    </section>
  );
}

function classForValue(value?: ReactCalendarHeatmapValue<Date>) {
  const count = Number(value?.count || 0);

  if (!count) return "gf-heatmap-scale-0";
  if (count < 4) return "gf-heatmap-scale-1";
  if (count < 9) return "gf-heatmap-scale-2";
  if (count < 15) return "gf-heatmap-scale-3";
  return "gf-heatmap-scale-4";
}

function parseLocalDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}
