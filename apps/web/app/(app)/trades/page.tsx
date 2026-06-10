'use client';

import { sum } from '@zenith/calc';
import { Card } from '@/components/ui/card';
import { PnlValue } from '@/components/ui/pnl-value';
import { Skeleton } from '@/components/ui/skeleton';
import { TradesTable } from '@/components/trades/trades-table';
import { AccountSwitcher } from '@/components/shell/account-switcher';
import { useTrades } from '@/lib/hooks';
import { useUiStore } from '@/lib/store';

export default function TradesPage() {
  const accountId = useUiStore((s) => s.accountId) ?? undefined;
  const { data, isLoading } = useTrades({ accountId, limit: 500 });

  const trades = data?.items ?? [];
  const net = sum(trades.map((t) => t.netPnl ?? 0));

  return (
    <>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-ink">
            Trade log
          </h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            Every execution, grouped into trades.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[13px] text-ink-secondary">
            Total net <PnlValue value={net} className="font-semibold" />
          </p>
          <AccountSwitcher />
        </div>
      </header>

      {isLoading ? (
        <Skeleton className="h-[480px]" />
      ) : (
        <Card>
          <TradesTable trades={trades} />
        </Card>
      )}
    </>
  );
}
