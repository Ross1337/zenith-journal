'use client';

import { streaks } from '@zenith/calc';
import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/dashboard/stat-card';
import { EquityChart } from '@/components/dashboard/equity-chart';
import { DailyPnlChart } from '@/components/dashboard/daily-pnl-chart';
import { RecentTrades } from '@/components/dashboard/recent-trades';
import { AccountSwitcher } from '@/components/shell/account-switcher';
import { useAccounts, useDashboardMetrics, useTrades } from '@/lib/hooks';
import { useUiStore } from '@/lib/store';
import { fmtCurrency, fmtPct, fmtPnl, fmtRatio, pnlTone } from '@/lib/format';

export default function DashboardPage() {
  const accountId = useUiStore((s) => s.accountId) ?? undefined;
  const filters = accountId ? { accountId } : {};

  const { data: accounts } = useAccounts();
  const { summary, equity, daily, isLoading } = useDashboardMetrics(filters);
  const { data: tradeList } = useTrades({ ...filters, status: 'closed', limit: 500 });

  const scoped = accountId
    ? (accounts ?? []).filter((a) => a.id === accountId)
    : (accounts ?? []);
  const balance = scoped.reduce((acc, a) => acc + a.currentBalance, 0);
  const initial = scoped.reduce((acc, a) => acc + a.initialBalance, 0);

  // Discipline panel — derived client-side from the closed-trade list.
  const closed = [...(tradeList?.items ?? [])].sort(
    (a, b) => a.openedAt.getTime() - b.openedAt.getTime(),
  );
  const streak = streaks(closed.map((t) => t.netPnl ?? 0));
  const lastEquity = equity?.[equity.length - 1];

  if (isLoading) return <DashboardSkeleton />;

  return (
    <>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-ink">
            Dashboard
          </h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            {accountId ? scoped[0]?.name : 'All accounts'} · {summary?.tradeCount ?? 0} closed
            trades
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="z-numeric text-[13px] text-ink-secondary">
            Equity <span className="font-semibold text-ink">{fmtCurrency(balance)}</span>
          </p>
          <AccountSwitcher />
        </div>
      </header>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label="Net P&L"
          value={fmtPnl(summary?.netPnl ?? 0)}
          tone={pnlTone(summary?.netPnl ?? 0)}
          sub={`${summary?.wins ?? 0} wins · ${summary?.losses ?? 0} losses`}
        />
        <StatCard label="Win rate" value={fmtPct(summary?.winRate ?? null)} sub="breakeven excluded" />
        <StatCard
          label="Profit factor"
          value={fmtRatio(summary?.profitFactor ?? null)}
          sub="gross gain / gross loss"
        />
        <StatCard
          label="Expectancy"
          value={summary?.expectancy == null ? '—' : fmtPnl(summary.expectancy)}
          tone={summary?.expectancy == null ? 'neutral' : pnlTone(summary.expectancy)}
          sub="per trade"
        />
        <StatCard
          label="Max drawdown"
          value={
            summary?.maxDrawdown == null ? '—' : `−${fmtCurrency(summary.maxDrawdown, true)}`
          }
          tone="loss"
          sub={
            summary?.maxDrawdownPct != null
              ? `${fmtPct(summary.maxDrawdownPct)} from peak`
              : undefined
          }
        />
      </div>

      {/* Charts */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Equity curve" hint="net, all instruments" />
          {equity && equity.length > 0 ? (
            <EquityChart
              data={equity.map((p) => ({ t: p.date.getTime(), equity: p.equity }))}
              baseline={initial}
            />
          ) : (
            <EmptyChart label="No closed trades yet" />
          )}
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title="Daily P&L" hint="net per session day" />
          {daily && daily.length > 0 ? (
            <DailyPnlChart
              data={daily.map((d) => ({
                t: new Date(`${d.date}T00:00:00Z`).getTime(),
                pnl: d.netPnl,
              }))}
            />
          ) : (
            <EmptyChart label="No closed trades yet" />
          )}
        </Card>
      </div>

      {/* Bottom row */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Recent trades" />
          <RecentTrades trades={(tradeList?.items ?? []).slice(0, 6)} />
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title="Discipline" hint="current run" />
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-5 pb-5 pt-2">
            <Metric
              label="Streak"
              value={
                streak.current === 0
                  ? 'flat'
                  : `${Math.abs(streak.current)} ${streak.current > 0 ? 'wins' : 'losses'}`
              }
              tone={streak.current > 0 ? 'profit' : streak.current < 0 ? 'loss' : undefined}
            />
            <Metric label="Best win streak" value={String(streak.bestWinStreak)} />
            <Metric label="Worst loss streak" value={String(streak.worstLossStreak)} />
            <Metric
              label="Plan followed"
              value={fmtPct(
                closed.length === 0
                  ? null
                  : closed.filter((t) => t.followedPlan).length / closed.length,
                0,
              )}
            />
            <Metric
              label="Reviewed"
              value={fmtPct(
                closed.length === 0
                  ? null
                  : closed.filter((t) => t.reviewed).length / closed.length,
                0,
              )}
            />
            <Metric
              label="Current drawdown"
              value={
                !lastEquity || lastEquity.drawdown === 0
                  ? 'at peak'
                  : `−${fmtCurrency(lastEquity.drawdown, true)}`
              }
              tone={!lastEquity || lastEquity.drawdown === 0 ? 'profit' : 'loss'}
            />
          </dl>
        </Card>
      </div>
    </>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'profit' | 'loss';
}) {
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

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[280px] items-center justify-center text-[13px] text-ink-muted">
      {label}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <header className="mb-6">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="mt-2 h-4 w-64" />
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
