'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ActivityHeatmapProps {
  data: Record<string, number>;
  days?: number;
}

function getIntensity(count: number): string {
  if (count === 0) return 'bg-dark-tertiary';
  if (count <= 2) return 'bg-accent/20';
  if (count <= 5) return 'bg-accent/40';
  if (count <= 10) return 'bg-accent/60';
  return 'bg-accent/90';
}

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export function ActivityHeatmap({ data, days = 90 }: ActivityHeatmapProps) {
  const { grid, months } = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days);

    // Align to start of week (Sunday)
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    const weeks: Array<Array<{ date: string; count: number; inRange: boolean }>> = [];
    const monthLabels: Array<{ label: string; weekIndex: number }> = [];
    let currentMonth = -1;
    let currentDate = new Date(startDate);

    while (currentDate <= today || weeks.length === 0 || weeks[weeks.length - 1].length < 7) {
      const weekIndex = weeks.length;
      if (currentDate.getDay() === 0) {
        weeks.push([]);
      }

      if (weeks.length === 0) weeks.push([]);
      const dateStr = currentDate.toISOString().split('T')[0];
      const count = data[dateStr] || 0;
      const isAfterStart = currentDate >= new Date(today.getTime() - days * 86400000);

      weeks[weeks.length - 1].push({
        date: dateStr,
        count,
        inRange: isAfterStart && currentDate <= today,
      });

      // Track month labels
      if (currentDate.getMonth() !== currentMonth) {
        currentMonth = currentDate.getMonth();
        monthLabels.push({
          label: currentDate.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex: weeks.length - 1,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);

      // Prevent infinite loop
      if (weeks.length > 20) break;
    }

    return { grid: weeks, months: monthLabels };
  }, [data, days]);

  const totalActivity = Object.values(data).reduce((a, b) => a + b, 0);
  const activeDays = Object.values(data).filter((v) => v > 0).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-secondary border border-dark-border rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Activity</h3>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{totalActivity} drafts</span>
          <span>{activeDays} active days</span>
        </div>
      </div>

      {/* Month labels */}
      <div className="flex mb-1 ml-8">
        {months.map((m, i) => (
          <div
            key={i}
            className="text-xs text-gray-500"
            style={{
              marginLeft: i === 0 ? `${m.weekIndex * 14}px` : undefined,
              width: `${
                (i < months.length - 1 ? months[i + 1].weekIndex - m.weekIndex : 4) * 14
              }px`,
            }}
          >
            {m.label}
          </div>
        ))}
      </div>

      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-3 text-[10px] text-gray-600 leading-3 w-6 text-right pr-1">
              {label}
            </div>
          ))}
        </div>

        {/* Grid */}
        {grid.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-0.5">
            {week.map((day) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: weekIndex * 0.02 }}
                title={`${day.date}: ${day.count} draft${day.count !== 1 ? 's' : ''}`}
                className={`w-3 h-3 rounded-sm ${
                  day.inRange ? getIntensity(day.count) : 'bg-transparent'
                } hover:ring-1 hover:ring-accent/50 transition-all cursor-default`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end mt-3 gap-1 text-xs text-gray-600">
        <span>Less</span>
        {[0, 2, 5, 10, 15].map((n) => (
          <div key={n} className={`w-3 h-3 rounded-sm ${getIntensity(n)}`} />
        ))}
        <span>More</span>
      </div>
    </motion.div>
  );
}
