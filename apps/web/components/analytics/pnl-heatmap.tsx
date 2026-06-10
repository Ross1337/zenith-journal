'use client';

import { useState } from 'react';
import clsx from 'clsx';
import type { HeatWeek } from '@/lib/analytics';
import { fmtPnl } from '@/lib/format';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

/**
 * Trading-week heatmap (Mon–Fri columns of the last N weeks).
 * Intensity scales with |net P&L| relative to the period max.
 */
export function PnlHeatmap({ weeks }: { weeks: HeatWeek[] }) {
  const [hover, setHover] = useState<{ date: string; netPnl: number; count: number } | null>(null);

  const max = Math.max(
    1,
    ...weeks.flatMap((w) => w.days.map((d) => Math.abs(d?.netPnl ?? 0))),
  );

  return (
    <div className="px-5 pb-5 pt-2">
      <div className="flex gap-2.5">
        <div className="flex flex-col justify-between py-0.5">
          {DAY_LABELS.map((d) => (
            <span key={d} className="h-[16px] text-[9.5px] uppercase leading-[16px] tracking-wider text-ink-faint">
              {d}
            </span>
          ))}
        </div>
        <div className="flex flex-1 justify-between gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.days.map((day, di) => {
                if (!day) return <span key={di} className="h-[16px] w-[16px]" />;
                const intensity = Math.abs(day.netPnl) / max;
                return (
                  <button
                    key={di}
                    type="button"
                    aria-label={`${day.date}: ${fmtPnl(day.netPnl)}`}
                    onMouseEnter={() => setHover(day)}
                    onMouseLeave={() => setHover(null)}
                    className={clsx(
                      'h-[16px] w-[16px] rounded-[3px] border transition-transform duration-fast hover:scale-125',
                      day.count === 0
                        ? 'border-edge-subtle bg-high'
                        : day.netPnl >= 0
                          ? 'border-profit/30'
                          : 'border-loss/30',
                    )}
                    style={
                      day.count > 0
                        ? {
                            background:
                              day.netPnl >= 0
                                ? `rgba(65, 224, 163, ${0.15 + intensity * 0.75})`
                                : `rgba(242, 85, 95, ${0.15 + intensity * 0.75})`,
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="z-numeric mt-3 h-4 text-[12px] text-ink-muted">
        {hover
          ? `${hover.date} — ${hover.count === 0 ? 'no trades' : `${fmtPnl(hover.netPnl)} · ${hover.count} trade${hover.count > 1 ? 's' : ''}`}`
          : ' '}
      </p>
    </div>
  );
}
