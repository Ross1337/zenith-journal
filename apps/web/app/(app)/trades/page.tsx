import type { Metadata } from 'next';
import { sum } from '@zenith/calc';
import { Card } from '@/components/ui/card';
import { PnlValue } from '@/components/ui/pnl-value';
import { TradesTable } from '@/components/trades/trades-table';
import { getMockTrades } from '@/lib/mock-data';

export const metadata: Metadata = { title: 'Trades' };

export default function TradesPage() {
  const trades = getMockTrades();
  const net = sum(trades.map((t) => t.netPnl ?? 0));

  return (
    <>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-ink">
            Trade log
          </h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            Every execution, grouped into trades. Click a row to review (soon).
          </p>
        </div>
        <p className="text-[13px] text-ink-secondary">
          Total net <PnlValue value={net} className="font-semibold" />
        </p>
      </header>

      <Card>
        <TradesTable trades={trades} />
      </Card>
    </>
  );
}
