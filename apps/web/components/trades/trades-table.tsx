'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import type { Direction, Trade, TradeOutcome } from '@zenith/types';
import { PnlValue } from '@/components/ui/pnl-value';
import { fmtDateTime, fmtHold, fmtR } from '@/lib/format';

type OutcomeFilter = TradeOutcome | 'all';
type DirectionFilter = Direction | 'all';

function outcomeOf(t: Trade): TradeOutcome {
  const pnl = t.netPnl ?? 0;
  return pnl > 0 ? 'win' : pnl < 0 ? 'loss' : 'breakeven';
}

export function TradesTable({ trades }: { trades: Trade[] }) {
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
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-3.5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search symbol or setup…"
          className="h-8 w-56 rounded-md border border-edge bg-high px-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-edge-strong"
        />
        <Segmented
          value={direction}
          onChange={setDirection}
          options={[
            { value: 'all', label: 'All' },
            { value: 'long', label: 'Long' },
            { value: 'short', label: 'Short' },
          ]}
        />
        <Segmented
          value={outcome}
          onChange={setOutcome}
          options={[
            { value: 'all', label: 'All' },
            { value: 'win', label: 'Wins' },
            { value: 'loss', label: 'Losses' },
            { value: 'breakeven', label: 'BE' },
          ]}
        />
        <span className="z-numeric ml-auto text-[12px] text-ink-muted">
          {filtered.length} / {trades.length} trades
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-y border-edge-subtle bg-high text-left text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              <Th>Opened</Th>
              <Th>Symbol</Th>
              <Th>Side</Th>
              <Th className="text-right">Qty</Th>
              <Th className="text-right">Entry</Th>
              <Th className="text-right">Exit</Th>
              <Th className="text-right">Net P&L</Th>
              <Th className="text-right">R</Th>
              <Th className="text-right">Hold</Th>
              <Th>Setup</Th>
              <Th>Grade</Th>
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
                  No trades match these filters.
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
