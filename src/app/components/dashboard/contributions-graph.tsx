"use client";
// @ts-ignore
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import { Contribution, Contributions } from "../../types/contributions";
import { parseDateStringAsLocalDate } from '../../utils/index';
import ContributionsLegend from './contributions-legend';
interface ContributionsProps {
    contributions: Contributions
}

export default function ContributionsGraph({contributions}: ContributionsProps) {

    const graphContributions = contributions.map((contribution) => ({
        ...contribution,
        date: parseDateStringAsLocalDate(contribution.date),
    }));

    const startDate = parseDateStringAsLocalDate(contributions[0]?.date);
    const endDate = parseDateStringAsLocalDate(contributions[contributions.length - 1]?.date);

    const tooltipDataAttrs = (value: { date?: Date, count?: number }) => {
        if (value && value.date) {
            const contributionsOnDate = value.count || 0;
            return {
                'data-tooltip-id': 'contributions-tooltip',
                'data-tooltip-content': `${contributionsOnDate} contribution${contributionsOnDate !== 1 ? 's' : ''} on ${value.date.toLocaleDateString('pt-BR')}`,
            };
        }
        return {};
    };

    const classForValue = (value: Contribution) => {
        if (!value) {
            return 'color-scale-0'; 
        }
        if (value.count >= 1 && value.count < 10) {
            return 'color-scale-1';
        } else if (value.count >= 10 && value.count < 20) {
            return 'color-scale-2'; 
        } else if (value.count >= 20 && value.count < 30) {
            return 'color-scale-3';
        } else if (value.count >= 30 && value.count < 50) {
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