"use client";
// @ts-ignore
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import { Contribution, Contributions } from "../api/contributions/route";
import ContributionsLegend from './ContributionsLegend';

interface ContributionsProps {
    contributions: Contributions
}

export default function ContributionsGraph({contributions}: ContributionsProps) {

    const tooltipDataAttrs = (value: any) => {
        if (value && value.date) {
            const date = new Date(value.date);
            const contributionsOnDate = value.count || 0;
            return {
                'data-tooltip-id': 'contributions-tooltip',
                'data-tooltip-content': `${contributionsOnDate} contribution${contributionsOnDate !== 1 ? 's' : ''} on ${date.toLocaleDateString('en-US')}`,
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
                startDate={new Date('2024-03-14')}
                endDate={new Date('2025-03-14')}
                values={contributions}
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