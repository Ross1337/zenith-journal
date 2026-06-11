'use client';

import dynamic from 'next/dynamic';
import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BreakdownBars } from '@/components/analytics/breakdown-bars';
import { PnlHeatmap } from '@/components/analytics/pnl-heatmap';

// Defer the Recharts-backed charts so the analytics shell paints immediately.
const chartFallback = <Skeleton className="m-4 h-[280px]" />;
const EquityChart = dynamic(
  () => import('@/components/dashboard/equity-chart').then((m) => m.EquityChart),
  { ssr: false, loading: () => chartFallback },
);
const RDistribution = dynamic(
  () => import('@/components/analytics/r-distribution').then((m) => m.RDistribution),
  { ssr: false, loading: () => chartFallback },
);
import { AccountSwitcher } from '@/components/shell/account-switcher';
import { useAccounts, useDashboardMetrics, useTrades } from '@/lib/hooks';
import { useUiStore } from '@/lib/store';
import { byHour, bySetup, bySymbol, byWeekday, heatmapWeeks, rDistribution } from '@/lib/analytics';
import { fmtHold, fmtPct, fmtPnl, fmtRatio } from '@/lib/format';
import { useT } from '@/lib/i18n-context';
import type { TKey } from '@/lib/i18n';
import type { Trade, MetricsSummary } from '@zenith/types';

/** Edge Score composite: 0–100 */
function computeEdgeScore(s: MetricsSummary | null): number | null {
  if (!s) return null;
  const { winRate: wr, profitFactor: pf, expectancyR: er, maxDrawdown: dd, netPnl } = s;
  if (wr == null || pf == null || er == null) return null;

  const wrScore = Math.min(1, wr) * 30;
  const pfScore = Math.min(1, (pf - 1) / 2) * 20;
  const erScore = Math.min(1, Math.max(0, er / 2)) * 30;
  const ddScore = dd != null && netPnl > 0
    ? Math.max(0, 1 - dd / Math.max(1, netPnl)) * 20
    : 10;

  return Math.min(100, Math.round(wrScore + pfScore + erScore + ddScore));
}

function EdgeScoreRing({ score, t }: { score: number | null; t: (k: TKey) => string }) {
  if (score === null) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <p className="text-[12px] text-ink-muted">{t('an_not_enough')}</p>
      </div>
    );
  }

  const size = 120;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - score / 100);
  const color = score >= 70 ? '#4ADE80' : score >= 40 ? '#F2B544' : '#F87171';
  const label = score >= 70 ? t('an_edge_strong') : score >= 40 ? t('an_edge_building') : t('an_edge_developing');

  return (
    <div className="flex flex-col items-center gap-1 p-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1E2330" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="z-numeric text-[28px] font-semibold leading-none" style={{ color }}>{score}</span>
          <span className="text-[10px] uppercase tracking-wider text-ink-muted">/100</span>
        </div>
      </div>
      <p className="text-[11.5px] font-semibold uppercase tracking-wider" style={{ color }}>{label}</p>
      <p className="text-center text-[10.5px] leading-tight text-ink-muted" style={{ maxWidth: 110 }}>{t('an_edge_score')}</p>
    </div>
  );
}

function computeInsights(trades: Trade[], summary: MetricsSummary | null) {
  const insights: Array<{ icon: string; title: string; body: string }> = [];
  if (!trades.length) return insights;

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayMap = new Map<number, number[]>();
  for (const t of trades) {
    const day = (t.closedAt ?? t.openedAt).getDay();
    const arr = dayMap.get(day) ?? [];
    arr.push(t.rRealized ?? (t.netPnl ?? 0) / 100);
    dayMap.set(day, arr);
  }
  let bestDay = -1, bestAvg = -Infinity;
  for (const [day, rs] of dayMap) {
    const avg = rs.reduce((a, b) => a + b, 0) / rs.length;
    if (avg > bestAvg) { bestAvg = avg; bestDay = day; }
  }
  if (bestDay >= 0) {
    insights.push({
      icon: '📅',
      title: `${WEEKDAYS[bestDay]} is your best day`,
      body: `Average ${bestAvg >= 0 ? '+' : ''}${bestAvg.toFixed(2)}R on ${WEEKDAYS[bestDay]}. Consider concentrating your best setups here.`,
    });
  }

  const symMap = new Map<string, number[]>();
  for (const t of trades) {
    const arr = symMap.get(t.symbol) ?? [];
    arr.push(t.netPnl ?? 0);
    symMap.set(t.symbol, arr);
  }
  let bestSym = '', bestSymPnl = -Infinity;
  let totalPnl = 0;
  for (const [, pnls] of symMap) totalPnl += pnls.reduce((a, b) => a + b, 0);
  for (const [sym, pnls] of symMap) {
    const net = pnls.reduce((a, b) => a + b, 0);
    if (net > bestSymPnl) { bestSymPnl = net; bestSym = sym; }
  }
  if (bestSym && totalPnl > 0) {
    const pct = Math.round((bestSymPnl / totalPnl) * 100);
    insights.push({
      icon: '💰',
      title: `${bestSym} drives ${pct}% of P&L`,
      body: `Your most profitable instrument. Make sure your edge here is systematic, not luck.`,
    });
  }

  if (summary?.avgHoldSecondsWin != null && summary?.avgHoldSecondsLoss != null) {
    const winH = Math.round(summary.avgHoldSecondsWin / 60);
    const lossH = Math.round(summary.avgHoldSecondsLoss / 60);
    if (winH < lossH) {
      insights.push({
        icon: '⏱️',
        title: 'Winners close faster than losers',
        body: `Winners avg ${winH}m, losers avg ${lossH}m. You may be cutting winners short and letting losers run.`,
      });
    } else {
      insights.push({
        icon: '⏱️',
        title: `Avg winning hold: ${winH}m`,
        body: `Your winners stay open longer (${winH}m vs ${lossH}m for losers). Good discipline on letting winners run.`,
      });
    }
  }

  return insights.slice(0, 3);
}

export default function AnalyticsPage() {
  const t = useT();
  const accountId = useUiStore((s) => s.accountId) ?? undefined;
  const filters = accountId ? { accountId } : {};

  const { data: accounts } = useAccounts();
  const { summary, equity, isLoading: metricsLoading } = useDashboardMetrics(filters);
  const { data: tradeList, isLoading: tradesLoading } = useTrades({
    ...filters, status: 'closed', limit: 500,
  });

  const isLoading = metricsLoading || tradesLoading;
  const trades = tradeList?.items ?? [];
  const scoped = accountId ? (accounts ?? []).filter((a) => a.id === accountId) : (accounts ?? []);
  const initial = scoped.reduce((acc, a) => acc + a.initialBalance, 0);

  const edgeScore = computeEdgeScore(summary ?? null);
  const insights = computeInsights(trades, summary ?? null);

  if (isLoading) return <AnalyticsSkeleton />;

  const erTone: 'neutral' | 'profit' | 'loss' =
    summary?.expectancyR == null ? 'neutral' : summary.expectancyR >= 0 ? 'profit' : 'loss';
  const pfTone: 'profit' | 'loss' =
    summary?.profitFactor != null && summary.profitFactor >= 1 ? 'profit' : 'loss';

  return (
    <>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1
            className="font-display text-[28px] font-semibold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #F2F4FA 30%, #F2B544)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('an_title')}
          </h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            {t('an_lead')} {trades.length} {t('an_closed_trades')}.
          </p>
        </div>
        <AccountSwitcher />
      </header>

      {/* KPI strip + Edge Score */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <KpiCard
          label={t('an_expectancy_r')}
          value={summary?.expectancyR == null ? '—' : `${summary.expectancyR.toFixed(2)}R`}
          tone={erTone}
        />
        <KpiCard
          label={t('an_win_rate')}
          value={fmtPct(summary?.winRate ?? null)}
          tone="neutral"
          progress={summary?.winRate ?? null}
          progressColor="#4ADE80"
        />
        <KpiCard
          label={t('an_profit_factor')}
          value={fmtRatio(summary?.profitFactor ?? null)}
          tone={pfTone}
        />
        <KpiCard
          label={t('an_avg_win')}
          value={summary?.avgWin == null ? '—' : fmtPnl(summary.avgWin)}
          tone="profit"
        />
        <KpiCard
          label={t('an_avg_loss')}
          value={summary?.avgLoss == null ? '—' : fmtPnl(summary.avgLoss)}
          tone="loss"
        />
        <div className="col-span-2 flex items-center justify-center rounded-xl border border-edge-subtle bg-raised shadow-inner-light lg:col-span-1">
          <EdgeScoreRing score={edgeScore} t={t} />
        </div>
      </div>

      {/* Equity + heatmap */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title={t('an_equity_curve')} hint={t('an_net')} />
          {equity && equity.length > 0 ? (
            <EquityChart
              data={equity.map((p) => ({ t: p.date.getTime(), equity: p.equity }))}
              baseline={initial}
            />
          ) : (
            <Empty t={t} />
          )}
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title={t('an_heatmap_title')} hint={t('an_heatmap_hint')} />
          <PnlHeatmap weeks={heatmapWeeks(trades, 16)} />
        </Card>
      </div>

      {/* R distribution + snapshot */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title={t('an_r_dist_title')} hint={t('an_r_dist_hint')} />
          <RDistribution data={rDistribution(trades)} />
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title={t('an_snapshot')} />
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-5 pb-5 pt-2">
            <Snap
              label={t('an_hold_win')}
              value={fmtHold(summary?.avgHoldSecondsWin == null ? null : Math.round(summary.avgHoldSecondsWin))}
              sub={t('an_winners_held')}
            />
            <Snap
              label={t('an_hold_loss')}
              value={fmtHold(summary?.avgHoldSecondsLoss == null ? null : Math.round(summary.avgHoldSecondsLoss))}
              sub={t('an_losers_held')}
            />
            <Snap label={t('an_best_day')} value={summary?.bestDay == null ? '—' : fmtPnl(summary.bestDay)} tone="profit" />
            <Snap label={t('an_worst_day')} value={summary?.worstDay == null ? '—' : fmtPnl(summary.worstDay)} tone="loss" />
            <Snap label={t('an_breakevens')} value={String(summary?.breakevens ?? 0)} />
            <Snap
              label={t('an_max_dd')}
              value={summary?.maxDrawdown == null ? '—' : `−${fmtPnl(summary.maxDrawdown).replace('+', '')}`}
              tone="loss"
            />
          </dl>
        </Card>
      </div>

      {/* Breakdowns */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={t('an_by_setup')} hint={t('an_breakdown_hint')} />
          <BreakdownBars rows={bySetup(trades)} />
        </Card>
        <Card>
          <CardHeader title={t('an_by_symbol')} hint={t('an_breakdown_hint')} />
          <BreakdownBars rows={bySymbol(trades)} />
        </Card>
        <Card>
          <CardHeader title={t('an_by_hour')} hint={t('an_local_time')} />
          <BreakdownBars rows={byHour(trades)} maxRows={12} />
        </Card>
        <Card>
          <CardHeader title={t('an_by_weekday')} />
          <BreakdownBars rows={byWeekday(trades)} maxRows={7} />
        </Card>
      </div>

      {insights.length > 0 && (
        <div className="mt-4">
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            {t('an_insights')}
          </h2>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {insights.map((ins, i) => (
              <div
                key={i}
                className="rounded-xl border border-edge-subtle bg-raised p-4 transition-all hover:border-gold/25"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[18px]">{ins.icon}</span>
                  <h3 className="text-[13.5px] font-semibold text-ink">{ins.title}</h3>
                </div>
                <p className="text-[12.5px] leading-relaxed text-ink-muted">{ins.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function KpiCard({
  label,
  value,
  tone = 'neutral',
  progress,
  progressColor,
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'profit' | 'loss' | 'gold';
  progress?: number | null;
  progressColor?: string;
}) {
  const colorMap = { profit: 'text-profit', loss: 'text-loss', gold: 'text-gold', neutral: 'text-ink' };

  return (
    <div className="rounded-xl border border-edge-subtle bg-raised px-5 py-4 shadow-inner-light">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">{label}</p>
      <p className={`z-numeric mt-2 text-[24px] font-semibold leading-none ${colorMap[tone]}`}>{value}</p>
      {progress != null && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-high">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.round(progress * 100)}%`,
              background: progressColor ?? '#F2B544',
              boxShadow: `0 0 6px ${progressColor ?? '#F2B544'}80`,
            }}
          />
        </div>
      )}
    </div>
  );
}

function Snap({ label, value, tone, sub }: { label: string; value: string; tone?: 'profit' | 'loss'; sub?: string }) {
  return (
    <div>
      <dt className="text-[11.5px] uppercase tracking-[0.12em] text-ink-muted">{label}</dt>
      <dd className={`z-numeric mt-1 text-[16px] font-medium ${tone === 'profit' ? 'text-profit' : tone === 'loss' ? 'text-loss' : 'text-ink'}`}>
        {value}
      </dd>
      {sub && <p className="text-[11px] text-ink-faint">{sub}</p>}
    </div>
  );
}

function Empty({ t }: { t: (k: TKey) => string }) {
  return (
    <div className="flex h-[280px] items-center justify-center text-[13px] text-ink-muted">
      {t('dash_no_trades')}
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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-[100px]" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Skeleton className="h-[340px] xl:col-span-3" />
        <Skeleton className="h-[340px] xl:col-span-2" />
      </div>
    </>
  );
}
