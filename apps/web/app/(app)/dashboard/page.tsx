import type { Metadata } from 'next';
import {
  drawdown,
  equityCurve,
  expectancy,
  profitFactor,
  streaks,
  sum,
  winRate,
} from '@zenith/calc';
import { Card, CardHeader } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card';
import { EquityChart } from '@/components/dashboard/equity-chart';
import { DailyPnlChart } from '@/components/dashboard/daily-pnl-chart';
import { RecentTrades } from '@/components/dashboard/recent-trades';
import { MOCK_ACCOUNT, getMockTrades } from '@/lib/mock-data';
import { fmtCurrency, fmtPct, fmtPnl, fmtRatio, pnlTone } from '@/lib/format';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  const trades = getMockTrades();
  const closed = trades.filter((t) => t.status === 'closed' && t.netPnl !== null);

  // Chronological P&Ls feed every calc function.
  const chrono = [...closed].sort((a, b) => a.openedAt.getTime() - b.openedAt.getTime());
  const pnls = chrono.map((t) => t.netPnl ?? 0);

  const net = sum(pnls);
  const wr = winRate(pnls);
  const pf = profitFactor(pnls);
  const exp = expectancy(pnls);
  const streak = streaks(pnls);

  const curve = equityCurve(
    chrono.map((t) => ({ t: (t.closedAt ?? t.openedAt).getTime(), pnl: t.netPnl ?? 0 })),
    MOCK_ACCOUNT.initialBalance,
  );
  const dd = drawdown(curve);

  // Daily aggregation for the bar chart (UTC buckets — display TZ comes with settings).
  const byDay = new Map<string, { t: number; pnl: number }>();
  for (const t of chrono) {
    const d = (t.closedAt ?? t.openedAt).toISOString().slice(0, 10);
    const bucket = byDay.get(d) ?? { t: new Date(`${d}T00:00:00Z`).getTime(), pnl: 0 };
    bucket.pnl += t.netPnl ?? 0;
    byDay.set(d, bucket);
  }
  const daily = [...byDay.values()].sort((a, b) => a.t - b.t);

  const wins = pnls.filter((p) => p > 0).length;
  const losses = pnls.filter((p) => p < 0).length;

  return (
    <>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-ink">
            Dashboard
          </h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            {MOCK_ACCOUNT.name} · {closed.length} closed trades · last 60 days
          </p>
        </div>
        <p className="z-numeric text-[13px] text-ink-secondary">
          Equity{' '}
          <span className="font-semibold text-ink">
            {fmtCurrency(MOCK_ACCOUNT.initialBalance + net)}
          </span>
        </p>
      </header>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label="Net P&L"
          value={fmtPnl(net)}
          tone={pnlTone(net)}
          sub={`${wins} wins · ${losses} losses`}
        />
        <StatCard label="Win rate" value={fmtPct(wr)} sub="breakeven excluded" />
        <StatCard label="Profit factor" value={fmtRatio(pf)} sub="gross gain / gross loss" />
        <StatCard
          label="Expectancy"
          value={exp === null ? '—' : fmtPnl(exp)}
          tone={exp === null ? 'neutral' : pnlTone(exp)}
          sub="per trade"
        />
        <StatCard
          label="Max drawdown"
          value={`−${fmtCurrency(dd.maxDrawdown, true)}`}
          tone="loss"
          sub={dd.maxDrawdownPct !== null ? `${fmtPct(dd.maxDrawdownPct)} from peak` : undefined}
        />
      </div>

      {/* Charts */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Equity curve" hint="net, all instruments" />
          <EquityChart
            data={curve.map((p) => ({ t: p.t, equity: +p.equity.toFixed(2) }))}
            baseline={MOCK_ACCOUNT.initialBalance}
          />
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title="Daily P&L" hint="net per session day" />
          <DailyPnlChart data={daily.map((d) => ({ t: d.t, pnl: +d.pnl.toFixed(2) }))} />
        </Card>
      </div>

      {/* Bottom row */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Recent trades" />
          <RecentTrades trades={trades.slice(0, 6)} />
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
              value={dd.currentDrawdown === 0 ? 'at peak' : `−${fmtCurrency(dd.currentDrawdown, true)}`}
              tone={dd.currentDrawdown === 0 ? 'profit' : 'loss'}
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
