import { Injectable } from '@nestjs/common';
import type { DailyPnl, EquityPoint, MetricsSummary } from '@zenith/types';
import {
  avgLoss,
  avgWin,
  bucketize,
  drawdown,
  equityCurve,
  expectancy,
  expectancyR,
  mean,
  profitFactor,
  streaks,
  sum,
  winRate,
} from '@zenith/calc';
import { PrismaService } from '../prisma/prisma.service';
import { round } from '../trades/derive';
import type { Prisma } from '../generated/prisma/client';
import type { MetricsQuery } from './metrics.dto';

interface ClosedTradeRow {
  netPnl: number | null;
  grossPnl: number | null;
  rRealized: number | null;
  holdSeconds: number | null;
  closedAt: Date | null;
  openedAt: Date;
}

/**
 * KPI aggregation over closed trades, computed on demand via @zenith/calc.
 * Trade volumes are journal-scale (thousands, not millions) — recomputing
 * beats cache invalidation complexity; metrics_cache is there when it stops being true.
 */
@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  private async closedTrades(userId: string, q: MetricsQuery): Promise<ClosedTradeRow[]> {
    const where: Prisma.TradeWhereInput = {
      userId,
      status: 'closed',
      ...(q.accountId && { accountId: q.accountId }),
      ...((q.from || q.to) && {
        closedAt: { ...(q.from && { gte: q.from }), ...(q.to && { lte: q.to }) },
      }),
    };
    return this.prisma.trade.findMany({
      where,
      orderBy: { closedAt: 'asc' },
      select: {
        netPnl: true,
        grossPnl: true,
        rRealized: true,
        holdSeconds: true,
        closedAt: true,
        openedAt: true,
      },
    });
  }

  async summary(userId: string, q: MetricsQuery): Promise<MetricsSummary> {
    const trades = await this.closedTrades(userId, q);
    const pnls = trades.map((t) => t.netPnl ?? 0);
    const { wins, losses, breakevens } = bucketize(pnls);

    const daily = this.bucketByDay(trades);
    const dailyPnls = daily.map((d) => d.netPnl);

    const initial = await this.initialBalance(userId, q.accountId);
    const curve = equityCurve(
      trades.map((t) => ({ t: (t.closedAt ?? t.openedAt).getTime(), pnl: t.netPnl ?? 0 })),
      initial,
    );
    const dd = drawdown(curve);

    const holdWins = trades.filter((t) => (t.netPnl ?? 0) > 0 && t.holdSeconds !== null);
    const holdLosses = trades.filter((t) => (t.netPnl ?? 0) < 0 && t.holdSeconds !== null);

    return {
      tradeCount: trades.length,
      wins: wins.length,
      losses: losses.length,
      breakevens: breakevens.length,
      netPnl: round(sum(pnls), 2),
      grossPnl: round(sum(trades.map((t) => t.grossPnl ?? 0)), 2),
      winRate: winRate(pnls),
      profitFactor: finiteOrNull(profitFactor(pnls)),
      expectancy: expectancy(pnls),
      expectancyR: expectancyR(trades.map((t) => t.rRealized)),
      avgWin: avgWin(pnls),
      avgLoss: avgLoss(pnls),
      avgR: expectancyR(trades.map((t) => t.rRealized)),
      maxDrawdown: trades.length ? round(dd.maxDrawdown, 2) : null,
      maxDrawdownPct: dd.maxDrawdownPct,
      currentStreak: streaks(pnls).current,
      bestDay: dailyPnls.length ? Math.max(...dailyPnls) : null,
      worstDay: dailyPnls.length ? Math.min(...dailyPnls) : null,
      avgHoldSecondsWin: mean(holdWins.map((t) => t.holdSeconds!)),
      avgHoldSecondsLoss: mean(holdLosses.map((t) => t.holdSeconds!)),
    };
  }

  async equity(userId: string, q: MetricsQuery): Promise<EquityPoint[]> {
    const trades = await this.closedTrades(userId, q);
    const initial = await this.initialBalance(userId, q.accountId);
    const curve = equityCurve(
      trades.map((t) => ({ t: (t.closedAt ?? t.openedAt).getTime(), pnl: t.netPnl ?? 0 })),
      initial,
    );

    let peak = -Infinity;
    return curve.map((p) => {
      peak = Math.max(peak, p.equity);
      return {
        date: new Date(p.t),
        equity: round(p.equity, 2),
        drawdown: round(peak - p.equity, 2),
      };
    });
  }

  async daily(userId: string, q: MetricsQuery): Promise<DailyPnl[]> {
    const trades = await this.closedTrades(userId, q);
    return this.bucketByDay(trades);
  }

  /** UTC day buckets — display timezone shifts client-side with settings. */
  private bucketByDay(trades: ClosedTradeRow[]): DailyPnl[] {
    const byDay = new Map<string, number[]>();
    for (const t of trades) {
      const day = (t.closedAt ?? t.openedAt).toISOString().slice(0, 10);
      const arr = byDay.get(day);
      if (arr) arr.push(t.netPnl ?? 0);
      else byDay.set(day, [t.netPnl ?? 0]);
    }
    return [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, pnls]) => ({
        date,
        netPnl: round(sum(pnls), 2),
        tradeCount: pnls.length,
        winRate: winRate(pnls),
      }));
  }

  private async initialBalance(userId: string, accountId?: string): Promise<number> {
    const agg = await this.prisma.account.aggregate({
      where: { userId, ...(accountId && { id: accountId }) },
      _sum: { initialBalance: true },
    });
    return agg._sum.initialBalance ?? 0;
  }
}

/** JSON has no Infinity — a loss-free profit factor serializes as null ("∞" client-side). */
function finiteOrNull(v: number | null): number | null {
  return v !== null && Number.isFinite(v) ? v : null;
}
