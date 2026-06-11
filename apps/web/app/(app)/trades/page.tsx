'use client';

import { sum } from '@zenith/calc';
import { Card } from '@/components/ui/card';
import { PnlValue } from '@/components/ui/pnl-value';
import { Skeleton } from '@/components/ui/skeleton';
import { TradesTable } from '@/components/trades/trades-table';
import { AccountSwitcher } from '@/components/shell/account-switcher';
import { useTrades } from '@/lib/hooks';
import { useUiStore } from '@/lib/store';
import { useT } from '@/lib/i18n-context';

export default function TradesPage() {
  const t = useT();
  const accountId = useUiStore((s) => s.accountId) ?? undefined;
  const { data, isLoading } = useTrades({ accountId, limit: 500 });

  const trades = data?.items ?? [];
  const net = sum(trades.map((tr) => tr.netPnl ?? 0));

  return (
    <>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="z-gradient-text font-display text-[22px] font-semibold tracking-tight">
            {t('trades_title')}
          </h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            {t('trades_subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[13px] text-ink-secondary">
            {t('trades_total_net')} <PnlValue value={net} className="font-semibold" />
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
