'use client';

import clsx from 'clsx';
import type { BreakdownRow } from '@/lib/analytics';
import { fmtPct, fmtPnl } from '@/lib/format';

/**
 * Horizontal breakdown — each row gets a bar sized by |net P&L| relative to
 * the group max, colored by sign. Dense, scannable, no chart library needed.
 */
export function BreakdownBars({ rows, maxRows = 8 }: { rows: BreakdownRow[]; maxRows?: number }) {
  const shown = rows.slice(0, maxRows);
  const max = Math.max(1, ...shown.map((r) => Math.abs(r.netPnl)));

  if (shown.length === 0) {
    return <p className="px-5 py-10 text-center text-[13px] text-ink-muted">No closed trades.</p>;
  }

  return (
    <ul className="space-y-1 px-5 pb-5 pt-2">
      {shown.map((r) => (
        <li key={r.key} className="group grid grid-cols-[110px_1fr_150px] items-center gap-3 py-1">
          <span className="truncate text-[12.5px] text-ink-secondary" title={r.label}>
            {r.label}
          </span>
          <div className="h-[18px] overflow-hidden rounded-xs bg-high">
            <div
              className={clsx(
                'h-full rounded-xs transition-all duration-slow',
                r.netPnl >= 0 ? 'bg-profit/70' : 'bg-loss/70',
              )}
              style={{ width: `${Math.max(2, (Math.abs(r.netPnl) / max) * 100)}%` }}
            />
          </div>
          <span className="z-numeric whitespace-nowrap text-right text-[12px] text-ink-muted">
            <span className={clsx('font-medium', r.netPnl >= 0 ? 'text-profit' : 'text-loss')}>
              {fmtPnl(r.netPnl)}
            </span>{' '}
            · {r.count} · {fmtPct(r.winRate, 0)}
          </span>
        </li>
      ))}
    </ul>
  );
}
