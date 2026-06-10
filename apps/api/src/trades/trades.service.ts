import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Trade } from '@zenith/types';
import { grossPnl, netPnl, pnlPct, rPlanned, rRealized } from '@zenith/calc';
import type { CreateTradeInput, ListTradesQuery, UpdateTradeInput } from './trades.dto';

/**
 * In-memory store, scoped by userId — the Postgres repository will take
 * over this contract. Derived metrics (P&L, R, hold time) are always
 * recomputed server-side via @zenith/calc; clients never send them.
 */
@Injectable()
export class TradesService {
  private readonly trades = new Map<string, Trade>();

  list(userId: string, q: ListTradesQuery): { items: Trade[]; total: number } {
    const all = [...this.trades.values()]
      .filter((t) => t.userId === userId)
      .filter((t) => (q.accountId ? t.accountId === q.accountId : true))
      .filter((t) => (q.symbol ? t.symbol.toUpperCase() === q.symbol.toUpperCase() : true))
      .filter((t) => (q.direction ? t.direction === q.direction : true))
      .filter((t) => (q.status ? t.status === q.status : true))
      .filter((t) => (q.outcome ? outcomeOf(t) === q.outcome : true))
      .filter((t) => (q.from ? t.openedAt >= q.from : true))
      .filter((t) => (q.to ? t.openedAt <= q.to : true))
      .sort((a, b) => b.openedAt.getTime() - a.openedAt.getTime());

    return { items: all.slice(q.offset, q.offset + q.limit), total: all.length };
  }

  get(userId: string, id: string): Trade {
    const trade = this.trades.get(id);
    if (!trade || trade.userId !== userId) {
      throw new NotFoundException(`Trade ${id} not found`);
    }
    return trade;
  }

  create(userId: string, input: CreateTradeInput): Trade {
    const now = new Date();
    const trade: Trade = {
      id: randomUUID(),
      userId,
      accountId: input.accountId,
      symbol: input.symbol.toUpperCase(),
      instrumentType: input.instrumentType,
      direction: input.direction,
      status: 'open',
      openedAt: input.openedAt,
      closedAt: input.closedAt ?? null,
      qty: input.qty,
      avgEntry: input.avgEntry,
      avgExit: input.avgExit ?? null,
      initialStop: input.initialStop ?? null,
      target: input.target ?? null,
      grossPnl: null,
      netPnl: null,
      commissionTotal: input.commissionTotal ?? 0,
      feesTotal: input.feesTotal ?? 0,
      swapTotal: input.swapTotal ?? 0,
      pnlPct: null,
      rRealized: null,
      rPlanned: null,
      mae: null,
      mfe: null,
      holdSeconds: null,
      strategyId: input.strategyId ?? null,
      setup: input.setup ?? null,
      marketCondition: input.marketCondition ?? null,
      session: input.session ?? null,
      timeframe: input.timeframe ?? null,
      followedPlan: input.followedPlan ?? null,
      mistakes: input.mistakes ?? [],
      emotionPre: input.emotionPre ?? null,
      emotionDuring: input.emotionDuring ?? null,
      emotionPost: input.emotionPost ?? null,
      grade: input.grade ?? null,
      reviewed: false,
      tags: input.tags ?? [],
      notes: input.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const computed = this.withDerivedMetrics(trade);
    this.trades.set(computed.id, computed);
    return computed;
  }

  update(userId: string, id: string, input: UpdateTradeInput): Trade {
    const trade = this.get(userId, id);
    const merged: Trade = {
      ...trade,
      ...input,
      symbol: input.symbol ? input.symbol.toUpperCase() : trade.symbol,
      updatedAt: new Date(),
    };
    const computed = this.withDerivedMetrics(merged);
    this.trades.set(id, computed);
    return computed;
  }

  remove(userId: string, id: string): void {
    this.get(userId, id);
    this.trades.delete(id);
  }

  /** Recompute everything derivable from entry/exit/stop — single source of truth. */
  private withDerivedMetrics(trade: Trade): Trade {
    const closed = trade.avgExit !== null && trade.closedAt !== null;
    if (!closed) {
      return { ...trade, status: 'open', grossPnl: null, netPnl: null, pnlPct: null, rRealized: null, holdSeconds: null };
    }

    const input = {
      direction: trade.direction,
      qty: trade.qty,
      avgEntry: trade.avgEntry,
      avgExit: trade.avgExit!,
      commission: trade.commissionTotal,
      fees: trade.feesTotal,
      swap: trade.swapTotal,
    };
    const gross = grossPnl(input);
    const net = netPnl(input);

    return {
      ...trade,
      status: 'closed',
      grossPnl: round2(gross),
      netPnl: round2(net),
      pnlPct: round(pnlPct(input), 4),
      rRealized: roundNullable(
        rRealized(net, { avgEntry: trade.avgEntry, initialStop: trade.initialStop, qty: trade.qty }),
      ),
      rPlanned:
        trade.initialStop !== null && trade.target !== null
          ? roundNullable(rPlanned(trade.avgEntry, trade.initialStop, trade.target))
          : null,
      holdSeconds: Math.max(
        0,
        Math.round((trade.closedAt!.getTime() - trade.openedAt.getTime()) / 1000),
      ),
    };
  }
}

function outcomeOf(t: Trade): 'win' | 'loss' | 'breakeven' {
  const pnl = t.netPnl ?? 0;
  return pnl > 0 ? 'win' : pnl < 0 ? 'loss' : 'breakeven';
}

function round(v: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
}

function round2(v: number): number {
  return round(v, 2);
}

function roundNullable(v: number | null): number | null {
  return v === null ? null : round(v, 4);
}
