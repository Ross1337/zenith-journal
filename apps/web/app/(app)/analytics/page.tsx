'use client';

import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EquityChart } from '@/components/dashboard/equity-chart';
import { BreakdownBars } from '@/components/analytics/breakdown-bars';
import { RDistribution } from '@/components/analytics/r-distribution';
import { PnlHeatmap } from '@/components/analytics/pnl-heatmap';
import { AccountSwitcher } from '@/components/shell/account-switcher';
import { StatCard } from '@/components/dashboard/stat-card';
import { useAccounts, useDashboardMetrics, useTrades } from '@/lib/hooks';
import { useUiStore } from '@/lib/store';
import { byHour, bySetup, bySymbol, byWeekday, heatmapWeeks, rDistribution } from '@/lib/analytics';
import { fmtHold, fmtPct, fmtPnl, fmtRatio, pnlTone } from '@/lib/format';

export default function AnalyticsPage() {
  const accountId = useUiStore((s) => s.accountId) ?? undefined;
  const filters = accountId ? { accountId } : {};

  const { data: accounts } = useAccounts();
  const { summary, equity, isLoading: metricsLoading } = useDashboardMetrics(filters);
  const { data: tradeList, isLoading: tradesLoading } = useTrades({
    ...filters,
    status: 'closed',
    limit: 500,
  });

  const isLoading = metricsLoading || tradesLoading;
  const trades = tradeList?.items ?? [];

  const scoped = accountId ? (accounts ?? []).filter((a) => a.id === accountId) : (accounts ?? []);
  const initial = scoped.reduce((acc, a) => acc + a.initialBalance, 0);

  if (isLoading) return <AnalyticsSkeleton />;

  return (
    <>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-ink">
            Analytics
          </h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            Where the edge lives — and where it leaks. {trades.length} closed trades.
          </p>
        </div>
        <AccountSwitcher />
      </header>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label="Expectancy / R"
          value={summary?.expectancyR == null ? '—' : `${summary.expectancyR.toFixed(2)}R`}
          tone={summary?.expectancyR == null ? 'neutral' : pnlTone(summary.expectancyR)}
          sub="mean realized R"
        />
        <StatCard
          label="Avg win"
          value={summary?.avgWin == null ? '—' : fmtPnl(summary.avgWin)}
          tone="profit"
        />
        <StatCard
          label="Avg loss"
          value={summary?.avgLoss == null ? '—' : fmtPnl(summary.avgLoss)}
          tone="loss"
        />
        <StatCard
          label="Hold (win)"
          value={fmtHold(summary?.avgHoldSecondsWin == null ? null : Math.round(summary.avgHoldSecondsWin))}
          sub="winners held"
        />
        <StatCard
          label="Hold (loss)"
          value={fmtHold(summary?.avgHoldSecondsLoss == null ? null : Math.round(summary.avgHoldSecondsLoss))}
          sub="losers held"
        />
      </div>

      {/* Equity + heatmap */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Equity curve" hint="net" />
          {equity && equity.length > 0 ? (
            <EquityChart
              data={equity.map((p) => ({ t: p.date.getTime(), equity: p.equity }))}
              baseline={initial}
            />
          ) : (
            <Empty />
          )}
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title="Daily P&L heatmap" hint="last 16 weeks" />
          <PnlHeatmap weeks={heatmapWeeks(trades, 16)} />
        </Card>
      </div>

      {/* R distribution + win rate snapshot */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="R distribution" hint="realized R multiples, 0.5R buckets" />
          <RDistribution data={rDistribution(trades)} />
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title="Snapshot" />
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-5 pb-5 pt-2">
            <Snap label="Win rate" value={fmtPct(summary?.winRate ?? null)} />
            <Snap label="Profit factor" value={fmtRatio(summary?.profitFactor ?? null)} />
            <Snap
              label="Best day"
              value={summary?.bestDay == null ? '—' : fmtPnl(summary.bestDay)}
              tone="profit"
            />
            <Snap
              label="Worst day"
              value={summary?.worstDay == null ? '—' : fmtPnl(summary.worstDay)}
              tone="loss"
            />
            <Snap
              label="Breakevens"
              value={String(summary?.breakevens ?? 0)}
            />
            <Snap
              label="Max drawdown"
              value={summary?.maxDrawdown == null ? '—' : `−${fmtPnl(summary.maxDrawdown).replace('+', '')}`}
              tone="loss"
            />
          </dl>
        </Card>
      </div>

      {/* Breakdowns */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="By setup" hint="net · trades · win rate" />
          <BreakdownBars rows={bySetup(trades)} />
        </Card>
        <Card>
          <CardHeader title="By symbol" hint="net · trades · win rate" />
          <BreakdownBars rows={bySymbol(trades)} />
        </Card>
        <Card>
          <CardHeader title="By hour of open" hint="local time" />
          <BreakdownBars rows={byHour(trades)} maxRows={12} />
        </Card>
        <Card>
          <CardHeader title="By weekday" />
          <BreakdownBars rows={byWeekday(trades)} maxRows={7} />
        </Card>
      </div>
    </>
  );
}

function Snap({ label, value, tone }: { label: string; value: string; tone?: 'profit' | 'loss' }) {
  return (
    <div>
      <dt className="text-[11.5px] uppercase tracking-[0.12em] text-ink-muted">{label}</dt>
      <dd
        className={`z-numeric mt-1 text-[16px] font-medium ${
          tone === 'profit' ? 'text-profit' : tone === 'loss' ? 'text-loss' : 'text-ink'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function Empty() {
  return (
    <div className="flex h-[280px] items-center justify-center text-[13px] text-ink-muted">
      No closed trades yet
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <>
      <header className="mb-6">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="mt-2 h-4 w-72" />
      </header>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-[104px]" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Skeleton className="h-[340px] xl:col-span-3" />
        <Skeleton className="h-[340px] xl:col-span-2" />
      </div>
    </>
  );
}
