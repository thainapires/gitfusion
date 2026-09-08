"use client";
import { SVGAttributes } from "react";
import CalendarHeatmap, { ReactCalendarHeatmapValue } from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import { Contributions } from "../../types/contributions";
import { parseDateStringAsLocalDate } from '../../utils/index';
import ContributionsLegend from './contributions-legend';

interface ContributionsProps {
    contributions: Contributions
}

type CalendarContribution = ReactCalendarHeatmapValue<Date> & {
    count: number;
};

export default function ContributionsGraph({contributions}: ContributionsProps) {

    const graphContributions: CalendarContribution[] = contributions.map((contribution) => ({
        ...contribution,
        date: parseDateStringAsLocalDate(contribution.date),
    }));

    const startDate = parseDateStringAsLocalDate(contributions[0]?.date);
    const endDate = parseDateStringAsLocalDate(contributions[contributions.length - 1]?.date);

    const tooltipDataAttrs = (value?: ReactCalendarHeatmapValue<Date>): SVGAttributes<SVGSVGElement> => {
        if (value?.date) {
            const contributionsOnDate = Number(value.count || 0);
            return {
                'data-tooltip-id': 'contributions-tooltip',
                'data-tooltip-content': `${contributionsOnDate} contribution${contributionsOnDate !== 1 ? 's' : ''} on ${value.date.toLocaleDateString('pt-BR')}`,
            } as unknown as SVGAttributes<SVGSVGElement>;
        }
        return {};
    };

    const classForValue = (value?: ReactCalendarHeatmapValue<Date>) => {
        const count = Number(value?.count || 0);

        if (!count) {
            return 'color-scale-0'; 
        }
        if (count >= 1 && count < 10) {
            return 'color-scale-1';
        } else if (count >= 10 && count < 20) {
            return 'color-scale-2'; 
        } else if (count >= 20 && count < 30) {
            return 'color-scale-3';
        } else if (count >= 30 && count < 50) {
            return 'color-scale-4'; 
        } else {
            return 'color-scale-5';
        }
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
