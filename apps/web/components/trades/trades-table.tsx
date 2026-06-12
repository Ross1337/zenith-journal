'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import type { Direction, Trade, TradeOutcome } from '@zenith/types';
import { PnlValue } from '@/components/ui/pnl-value';
import { fmtDateTime, fmtHold, fmtR } from '@/lib/format';
import { useT } from '@/lib/i18n-context';

type OutcomeFilter = TradeOutcome | 'all';
type DirectionFilter = Direction | 'all';

function outcomeOf(t: Trade): TradeOutcome {
  const pnl = t.netPnl ?? 0;
  return pnl > 0 ? 'win' : pnl < 0 ? 'loss' : 'breakeven';
}

export function TradesTable({ trades }: { trades: Trade[] }) {
  const t = useT();
  const [query, setQuery] = useState('');
  const [direction, setDirection] = useState<DirectionFilter>('all');
  const [outcome, setOutcome] = useState<OutcomeFilter>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    return trades.filter((t) => {
      if (q && !t.symbol.toUpperCase().includes(q) && !(t.setup ?? '').toUpperCase().includes(q))
        return false;
      if (direction !== 'all' && t.direction !== direction) return false;
      if (outcome !== 'all' && outcomeOf(t) !== outcome) return false;
      return true;
    });
  }, [trades, query, direction, outcome]);

  return (
    <div>
      {/* Filter bar — stacks vertically on mobile, single row on sm+. */}
      <div className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:px-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('tt_search')}
          className="h-8 w-full rounded-md border border-edge bg-high px-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-edge-strong sm:w-56"
        />
        <Segmented
          value={direction}
          onChange={setDirection}
          options={[
            { value: 'all', label: t('tt_all') },
            { value: 'long', label: t('tt_long') },
            { value: 'short', label: t('tt_short') },
          ]}
        />
        <Segmented
          value={outcome}
          onChange={setOutcome}
          options={[
            { value: 'all', label: t('tt_all') },
            { value: 'win', label: t('tt_wins') },
            { value: 'loss', label: t('tt_losses') },
            { value: 'breakeven', label: t('tt_be') },
          ]}
        />
        <span className="z-numeric text-[12px] text-ink-muted sm:ml-auto">
          {filtered.length} / {trades.length} {t('tt_trades')}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-y border-edge-subtle bg-high text-left text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              <Th>{t('tt_th_opened')}</Th>
              <Th>{t('tt_th_symbol')}</Th>
              <Th>{t('tt_th_side')}</Th>
              <Th className="text-right">{t('tt_th_qty')}</Th>
              <Th className="text-right">{t('tt_th_entry')}</Th>
              <Th className="text-right">{t('tt_th_exit')}</Th>
              <Th className="text-right">{t('tt_th_net')}</Th>
              <Th className="text-right">{t('tt_th_r')}</Th>
              <Th className="text-right">{t('tt_th_hold')}</Th>
              <Th>{t('tt_th_setup')}</Th>
              <Th>{t('tt_th_grade')}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge-subtle">
            {filtered.map((t) => (
              <tr key={t.id} className="transition-colors duration-fast hover:bg-hover">
                <Td className="z-numeric whitespace-nowrap text-ink-secondary">
                  {fmtDateTime(t.openedAt)}
                </Td>
                <Td className="z-numeric font-medium text-ink">{t.symbol}</Td>
                <Td>
                  <span
                    className={clsx(
                      'z-numeric rounded-xs px-1.5 py-0.5 text-[10.5px] font-semibold uppercase',
                      t.direction === 'long'
                        ? 'bg-profit-wash text-profit'
                        : 'bg-loss-wash text-loss',
                    )}
                  >
                    {t.direction}
                  </span>
                </Td>
                <Td className="z-numeric text-right text-ink-secondary">{t.qty}</Td>
                <Td className="z-numeric text-right text-ink-secondary">{t.avgEntry}</Td>
                <Td className="z-numeric text-right text-ink-secondary">{t.avgExit ?? '—'}</Td>
                <Td className="text-right">
                  <PnlValue value={t.netPnl ?? 0} className="font-medium" />
                </Td>
                <Td className="z-numeric whitespace-nowrap text-right text-ink-secondary">
                  {fmtR(t.rRealized)}
                </Td>
                <Td className="z-numeric text-right text-ink-muted">{fmtHold(t.holdSeconds)}</Td>
                <Td className="max-w-44 truncate text-ink-secondary">{t.setup ?? '—'}</Td>
                <Td>
                  {t.grade ? (
                    <span
                      className={clsx(
                        'z-numeric rounded-xs px-1.5 py-0.5 text-[11px] font-semibold',
                        t.grade.startsWith('A')
                          ? 'bg-gold-wash text-gold'
                          : 'bg-high text-ink-muted',
                      )}
                    >
                      {t.grade}
                    </span>
                  ) : (
                    <span className="text-ink-faint">—</span>
                  )}
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="px-5 py-14 text-center text-[13px] text-ink-muted">
                  {t('tt_no_match')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ className, children }: { className?: string; children: React.ReactNode }) {
  return <th className={clsx('px-4 py-2.5 font-medium first:pl-5 last:pr-5', className)}>{children}</th>;
}

function Td({ className, children }: { className?: string; children: React.ReactNode }) {
  return <td className={clsx('px-4 py-2.5 first:pl-5 last:pr-5', className)}>{children}</td>;
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="flex h-8 items-center gap-0.5 rounded-md border border-edge bg-high p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={clsx(
            'rounded-[5px] px-2.5 py-1 text-[12px] font-medium transition-colors duration-fast',
            value === o.value
              ? 'bg-overlay text-ink shadow-inner-light'
              : 'text-ink-muted hover:text-ink-secondary',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
