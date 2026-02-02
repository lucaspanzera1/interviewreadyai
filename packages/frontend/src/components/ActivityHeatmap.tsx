import React, { useMemo, useState } from 'react';

interface ActivityHeatmapProps {
    data: { date: string; count: number }[];
    totalActivities?: number;
    startDate?: Date;
    endDate?: Date;
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data, totalActivities, startDate: propStartDate, endDate: propEndDate }) => {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: React.ReactNode } | null>(null);

    // Group into weeks
    const weeks = useMemo(() => {
        const weeksArray: { date: Date; dateString: string; count: number; level: number }[][] = [];

        let startDate: Date;
        let endDate: Date;

        if (propStartDate) {
            startDate = new Date(propStartDate);
            // Ensure we include the end date if provided, otherwise default to 1 year from start? 
            // Or if endDate not provided, default to today.
            endDate = propEndDate ? new Date(propEndDate) : new Date();
            // If endDate is before startDate (e.g. today is start), maybe we want to show a future range?
            // The user said "start on that date". If current date is start date, and we want to show "Github style" which is usually a year,
            // maybe we should show the year AHEAD? Or just the range that exists?
            // If I show range [Feb 1, Feb 1], it is 1 cell.
            // Let's assume if startDate is fixed, we show up to endDate.
        } else {
            // Default behavior: Last 365 days ending today
            const today = new Date();
            endDate = today;
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 365);
        }

        // Align start date to previous Sunday
        const dayOfWeek = startDate.getDay(); // 0 is Sunday
        const alignedStartDate = new Date(startDate);
        alignedStartDate.setDate(alignedStartDate.getDate() - dayOfWeek);

        // Calculate end date alignment (optional, but good for grid)
        // We just loop until we cover endDate

        const normalizedData: { date: Date; dateString: string; count: number; level: number }[] = [];
        const loopDate = new Date(alignedStartDate);

        // Create map
        const dataMap = new Map();
        data.forEach(item => {
            const dateKey = new Date(item.date).toISOString().split('T')[0];
            dataMap.set(dateKey, (dataMap.get(dateKey) || 0) + item.count);
        });

        // Loop until loopDate is after endDate AND we have completed the week (Saturday)
        // Actually GitHub graph stops at "today" usually, even if mid-week.
        // But if we are defining a fixed range, maybe we want full weeks.
        // Let's loop until loopDate > endDate using a strict check, but ensure we finish the current week chunk in the final slice logic.

        // Safety: Limit 400 days ~ 57 weeks
        let iterations = 0;

        while ((loopDate <= endDate || loopDate.getDay() !== 0) && iterations < 400) {
            const dateKey = loopDate.toISOString().split('T')[0];
            const count = dataMap.get(dateKey) || 0;

            let level = 0;
            if (count > 0) level = 1;
            if (count > 2) level = 2;
            if (count > 4) level = 3;
            if (count >= 6) level = 4;

            normalizedData.push({
                date: new Date(loopDate),
                dateString: dateKey,
                count,
                level
            });

            loopDate.setDate(loopDate.getDate() + 1);
            iterations++;
        }

        // Chunk into 7
        for (let i = 0; i < normalizedData.length; i += 7) {
            weeksArray.push(normalizedData.slice(i, i + 7));
        }

        return weeksArray;
    }, [data, propStartDate, propEndDate]);

    const monthLabels = useMemo(() => {
        // Determine months positions based on weeks
        // We check the month of the first day of each week
        const labels: { index: number; label: string }[] = [];
        let lastMonth = -1;

        weeks.forEach((week, index) => {
            if (!week[0]) return;
            const month = week[0].date.getMonth();
            // Show label if month changed AND either it's the first label or sufficient space (e.g. 2 weeks)
            // GitHub logic is more complex but simple spacing check helps.
            if (month !== lastMonth) {
                // Formatting: "jan"
                const label = week[0].date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
                // Capitalize first letter
                const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);

                // Do not add if too close to previous label (e.g. < 2 weeks) to avoid overlap
                // But always add the first one? Or prioritizing correct placement?
                // If index - lastIndex < 2, maybe skip?
                // Let's just push.

                labels.push({ index, label: formattedLabel });
                lastMonth = month;
            }
        });

        // Post-processing to remove overlapping labels if needed could be done here, 
        // but basic week-check is usually enough if weeks are correct.

        return labels;
    }, [weeks]);

    const getColor = (level: number) => {
        // GitHub green scale
        // 0: #ebedf0 (light) or #161b22 (dark)
        // 1: #9be9a8 or #0e4429
        // 2: #40c463 or #006d32
        // 3: #30a14e or #26a641
        // 4: #216e39 or #39d353

        switch (level) {
            case 1: return 'bg-emerald-200 dark:bg-emerald-900';
            case 2: return 'bg-emerald-400 dark:bg-emerald-700';
            case 3: return 'bg-emerald-600 dark:bg-emerald-500';
            case 4: return 'bg-emerald-800 dark:bg-emerald-300';
            default: return 'bg-slate-100 dark:bg-slate-800';
        }
    };

    const handleMouseEnter = (e: React.MouseEvent, count: number, date: Date) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top,
            content: (
                <span>
                    <strong>{count} atividades</strong> em {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </span>
            )
        });
    };

    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
    }, [weeks]);

    return (
        <div className="relative w-full max-w-full">
            {/* Fixed Tooltip - escapes overflow */}
            {tooltip && (
                <div
                    className="fixed z-[9999] px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2 whitespace-nowrap"
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    {tooltip.content}
                    {/* Little triangle arrow */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[4px] border-4 border-transparent border-t-slate-900"></div>
                </div>
            )}

            <div
                ref={scrollContainerRef}
                className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent"
            >
                <div className="min-w-max px-1">
                    {/* Month labels - restoring simpler layout since padding isn't needed for tooltip anymore */}
                    <div className="flex mb-2 text-xs text-slate-400 dark:text-slate-500 relative h-4">
                        {monthLabels.map((month, i) => (
                            <div
                                key={i}
                                style={{ left: `${month.index * 14}px`, position: 'absolute' }}
                            >
                                {month.label}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-[3px]">
                        {/* Day labels */}
                        <div className="flex flex-col gap-[3px] text-[10px] text-slate-400 dark:text-slate-500 pr-2 pt-2 sticky left-0 bg-white dark:bg-slate-900 z-10">
                            <div className="h-[10px]"></div>
                            <div className="h-[10px]">Seg</div>
                            <div className="h-[10px]"></div>
                            <div className="h-[10px]">Qua</div>
                            <div className="h-[10px]"></div>
                            <div className="h-[10px]">Sex</div>
                            <div className="h-[10px]"></div>
                        </div>

                        {/* Grid */}
                        {weeks.map((week, wIndex) => (
                            <div key={wIndex} className="flex flex-col gap-[3px]">
                                {week.map((day, dIndex) => (
                                    <div
                                        key={`${wIndex}-${dIndex}`}
                                        className={`w-[10px] h-[10px] rounded-[2px] ${getColor(day.level)} transition-colors cursor-pointer hover:scale-125 hover:z-20`}
                                        onMouseEnter={(e) => handleMouseEnter(e, day.count, day.date)}
                                        onMouseLeave={() => setTooltip(null)}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 sticky left-0">
                        <div>
                            {totalActivities !== undefined && (
                                <span>Total de {totalActivities} atividades no último ano</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <span>Menos</span>
                            <div className={`w-[10px] h-[10px] rounded-[2px] ${getColor(0)}`}></div>
                            <div className={`w-[10px] h-[10px] rounded-[2px] ${getColor(1)}`}></div>
                            <div className={`w-[10px] h-[10px] rounded-[2px] ${getColor(2)}`}></div>
                            <div className={`w-[10px] h-[10px] rounded-[2px] ${getColor(3)}`}></div>
                            <div className={`w-[10px] h-[10px] rounded-[2px] ${getColor(4)}`}></div>
                            <span>Mais</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityHeatmap;
