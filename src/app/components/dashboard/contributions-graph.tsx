"use client";
import { SVGAttributes } from "react";
import CalendarHeatmap, { ReactCalendarHeatmapValue } from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import { ContributionPlatform, Contributions } from "../../types/contributions";
import { getPlatformLabel } from '../../utils/contributions';
import { parseDateStringAsLocalDate } from '../../utils/index';
import ContributionsLegend from './contributions-legend';

interface ContributionsProps {
    contributions: Contributions;
    platform: ContributionPlatform;
}

type CalendarContribution = ReactCalendarHeatmapValue<Date> & {
    count: number;
    githubCount: number;
    gitlabCount: number;
};

export default function ContributionsGraph({contributions, platform}: ContributionsProps) {
    if (!contributions.length) {
        return null;
    }

    const graphContributions: CalendarContribution[] = contributions.map((contribution) => ({
        ...contribution,
        date: parseDateStringAsLocalDate(contribution.date),
    }));

    const startDate = parseDateStringAsLocalDate(contributions[0].date);
    const endDate = parseDateStringAsLocalDate(contributions[contributions.length - 1].date);

    const tooltipDataAttrs = (value?: ReactCalendarHeatmapValue<Date>): SVGAttributes<SVGSVGElement> => {
        if (value?.date) {
            const count = Number(value.count || 0);
            const githubCount = Number(value.githubCount || 0);
            const gitlabCount = Number(value.gitlabCount || 0);

            return {
                'data-tooltip-id': 'contributions-tooltip',
                'data-tooltip-content': `${getPlatformLabel(platform)}: ${count} on ${value.date.toLocaleDateString('pt-BR')} | GitHub: ${githubCount} | GitLab: ${gitlabCount}`,
            } as unknown as SVGAttributes<SVGSVGElement>;
        }
        return {};
    };

    const classForValue = (value?: ReactCalendarHeatmapValue<Date>) => {
        const count = Number(value?.count || 0);

        if (!count) return 'color-scale-0';
        if (count < 10) return 'color-scale-1';
        if (count < 20) return 'color-scale-2';
        if (count < 30) return 'color-scale-3';
        if (count < 50) return 'color-scale-4';
        return 'color-scale-5';
    };

    return (
       <div className="flex w-full flex-col">
            <CalendarHeatmap
                startDate={startDate}
                endDate={endDate}
                values={graphContributions}
                showWeekdayLabels
                showOutOfRangeDays
                gutterSize={2}
                tooltipDataAttrs={tooltipDataAttrs}
                classForValue={classForValue}
            />
            <Tooltip id="contributions-tooltip" />
            <ContributionsLegend />
       </div>
    )
}
