import Link from 'next/link';
import clsx from 'clsx';
import type { Trade } from '@zenith/types';
import { PnlValue } from '@/components/ui/pnl-value';
import { fmtDateTime, fmtR } from '@/lib/format';

export function RecentTrades({ trades }: { trades: Trade[] }) {
  return (
    <ul className="divide-y divide-edge-subtle">
      {trades.map((t) => (
        <li key={t.id} className="flex items-center gap-4 px-5 py-3">
          <span
            className={clsx(
              'z-numeric w-12 rounded-xs px-1.5 py-0.5 text-center text-[10.5px] font-semibold uppercase',
              t.direction === 'long' ? 'bg-profit-wash text-profit' : 'bg-loss-wash text-loss',
            )}
          >
            {t.direction}
          </span>
          <div className="min-w-0 flex-1">
            <p className="z-numeric truncate text-[13.5px] font-medium text-ink">{t.symbol}</p>
            <p className="truncate text-[12px] text-ink-muted">{t.setup ?? '—'}</p>
          </div>
          <div className="text-right">
            <PnlValue value={t.netPnl ?? 0} className="text-[13.5px] font-medium" />
            <p className="z-numeric text-[11.5px] text-ink-muted">{fmtR(t.rRealized)}</p>
          </div>
          <span className="z-numeric hidden w-28 text-right text-[11.5px] text-ink-faint sm:block">
            {fmtDateTime(t.openedAt)}
          </span>
        </li>
      ))}
      <li className="px-5 py-3">
        <Link
          href="/trades"
          className="text-[12.5px] font-medium text-gold transition-colors duration-fast hover:text-gold-hover"
        >
          View all trades →
        </Link>
      </li>
    </ul>
  );
}
