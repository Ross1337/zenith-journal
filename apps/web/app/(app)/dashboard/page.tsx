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
import { useT } from '@/lib/i18n-context';
import { fmtCurrency, fmtPct, fmtPnl, fmtRatio, pnlTone } from '@/lib/format';

export function DashboardSkeleton() {
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

export default function DashboardPage() {
  const t = useT();
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
            {t('dash_title')}
          </h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            {accountId ? scoped[0]?.name : t('dash_all_accounts')} · {summary?.tradeCount ?? 0}{' '}
            {t('dash_closed_trades')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="z-numeric text-[13px] text-ink-secondary">
            {t('dash_equity')}{' '}
            <span className="font-semibold text-ink">{fmtCurrency(balance)}</span>
          </p>
          <AccountSwitcher />
        </div>
      </header>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label={t('dash_net_pnl')}
          value={fmtPnl(summary?.netPnl ?? 0)}
          tone={pnlTone(summary?.netPnl ?? 0)}
          sub={`${summary?.wins ?? 0} ${t('dash_wins_label')} · ${summary?.losses ?? 0} ${t('dash_losses_label')}`}
        />
        <StatCard
          label={t('dash_win_rate')}
          value={fmtPct(summary?.winRate ?? null)}
          sub={t('dash_breakeven')}
        />
        <StatCard
          label={t('dash_profit_factor')}
          value={fmtRatio(summary?.profitFactor ?? null)}
          sub={t('dash_gross')}
        />
        <StatCard
          label={t('dash_expectancy')}
          value={summary?.expectancy == null ? '—' : fmtPnl(summary.expectancy)}
          tone={summary?.expectancy == null ? 'neutral' : pnlTone(summary.expectancy)}
          sub={t('dash_per_trade')}
        />
        <StatCard
          label={t('dash_max_dd')}
          value={
            summary?.maxDrawdown == null ? '—' : `−${fmtCurrency(summary.maxDrawdown, true)}`
          }
          tone="loss"
          sub={
            summary?.maxDrawdownPct != null
              ? `${fmtPct(summary.maxDrawdownPct)} ${t('dash_from_peak')}`
              : undefined
          }
        />
      </div>

      {/* Charts */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title={t('dash_equity_curve')} hint={t('dash_equity_hint')} />
          {equity && equity.length > 0 ? (
            <EquityChart
              data={equity.map((p) => ({ t: p.date.getTime(), equity: p.equity }))}
              baseline={initial}
            />
          ) : (
            <EmptyChart label={t('dash_no_trades')} />
          )}
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title={t('dash_daily_pnl')} hint={t('dash_daily_hint')} />
          {daily && daily.length > 0 ? (
            <DailyPnlChart
              data={daily.map((d) => ({
                t: new Date(`${d.date}T00:00:00Z`).getTime(),
                pnl: d.netPnl,
              }))}
            />
          ) : (
            <EmptyChart label={t('dash_no_trades')} />
          )}
        </Card>
      </div>

      {/* Bottom row */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title={t('dash_recent_trades')} />
          <RecentTrades trades={(tradeList?.items ?? []).slice(0, 6)} />
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title={t('dash_discipline')} hint={t('dash_discipline_hint')} />
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-5 pb-5 pt-2">
            <Metric
              label={t('dash_streak')}
              value={
                streak.current === 0
                  ? t('dash_flat')
                  : `${Math.abs(streak.current)} ${streak.current > 0 ? t('dash_wins_label') : t('dash_losses_label')}`
              }
              tone={streak.current > 0 ? 'profit' : streak.current < 0 ? 'loss' : undefined}
            />
            <Metric label={t('dash_best_win')} value={String(streak.bestWinStreak)} />
            <Metric label={t('dash_worst_loss')} value={String(streak.worstLossStreak)} />
            <Metric
              label={t('dash_plan_followed')}
              value={fmtPct(
                closed.length === 0
                  ? null
                  : closed.filter((tr) => tr.followedPlan).length / closed.length,
                0,
              )}
            />
            <Metric
              label={t('dash_reviewed')}
              value={fmtPct(
                closed.length === 0
                  ? null
                  : closed.filter((tr) => tr.reviewed).length / closed.length,
                0,
              )}
            />
            <Metric
              label={t('dash_current_dd')}
              value={
                !lastEquity || lastEquity.drawdown === 0
                  ? t('dash_at_peak')
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
