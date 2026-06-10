import { Injectable, NotFoundException } from '@nestjs/common';
import type { Trade } from '@zenith/types';
import { PrismaService } from '../prisma/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { BillingService } from '../billing/billing.service';
import { toTrade } from '../common/mappers';
import { deriveTradeMetrics } from './derive';
import type { Prisma } from '../generated/prisma/client';
import type { CreateTradeInput, ListTradesQuery, UpdateTradeInput } from './trades.dto';

/**
 * Postgres-backed trades, scoped by userId. Derived metrics (P&L, R, hold
 * time) are always recomputed server-side via @zenith/calc; clients never
 * send them. Account balances stay in sync with closed P&L.
 */
@Injectable()
export class TradesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accounts: AccountsService,
    private readonly billing: BillingService,
  ) {}

  async list(userId: string, q: ListTradesQuery): Promise<{ items: Trade[]; total: number }> {
    const where: Prisma.TradeWhereInput = {
      userId,
      ...(q.accountId && { accountId: q.accountId }),
      ...(q.symbol && { symbol: q.symbol.toUpperCase() }),
      ...(q.direction && { direction: q.direction }),
      ...(q.status && { status: q.status }),
      ...(q.outcome === 'win' && { netPnl: { gt: 0 } }),
      ...(q.outcome === 'loss' && { netPnl: { lt: 0 } }),
      ...(q.outcome === 'breakeven' && { netPnl: { equals: 0 } }),
      ...((q.from || q.to) && {
        openedAt: { ...(q.from && { gte: q.from }), ...(q.to && { lte: q.to }) },
      }),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.trade.findMany({
        where,
        orderBy: { openedAt: 'desc' },
        skip: q.offset,
        take: q.limit,
      }),
      this.prisma.trade.count({ where }),
    ]);
    return { items: rows.map(toTrade), total };
  }

  async get(userId: string, id: string): Promise<Trade> {
    const row = await this.prisma.trade.findUnique({ where: { id } });
    if (!row || row.userId !== userId) {
      throw new NotFoundException(`Trade ${id} not found`);
    }
    return toTrade(row);
  }

  async create(userId: string, input: CreateTradeInput): Promise<Trade> {
    // Ownership check — accountId comes from the client.
    await this.accounts.get(userId, input.accountId);
    await this.billing.assertCanAddTrades(userId, 1);

    const shape = {
      direction: input.direction,
      qty: input.qty,
      avgEntry: input.avgEntry,
      avgExit: input.avgExit ?? null,
      initialStop: input.initialStop ?? null,
      target: input.target ?? null,
      openedAt: input.openedAt,
      closedAt: input.closedAt ?? null,
      commissionTotal: input.commissionTotal ?? 0,
      feesTotal: input.feesTotal ?? 0,
      swapTotal: input.swapTotal ?? 0,
    };
    const derived = deriveTradeMetrics(shape);

    const row = await this.prisma.trade.create({
      data: {
        userId,
        accountId: input.accountId,
        symbol: input.symbol.toUpperCase(),
        instrumentType: input.instrumentType,
        ...shape,
        ...derived,
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
        tags: input.tags ?? [],
        notes: input.notes ?? null,
      },
    });

    if (derived.netPnl !== null) await this.accounts.syncBalance(input.accountId);
    return toTrade(row);
  }

  async update(userId: string, id: string, input: UpdateTradeInput): Promise<Trade> {
    const current = await this.get(userId, id);
    if (input.accountId && input.accountId !== current.accountId) {
      await this.accounts.get(userId, input.accountId);
    }

    const merged = { ...current, ...input };
    const derived = deriveTradeMetrics({
      direction: merged.direction,
      qty: merged.qty,
      avgEntry: merged.avgEntry,
      avgExit: merged.avgExit ?? null,
      initialStop: merged.initialStop ?? null,
      target: merged.target ?? null,
      openedAt: merged.openedAt,
      closedAt: merged.closedAt ?? null,
      commissionTotal: merged.commissionTotal ?? 0,
      feesTotal: merged.feesTotal ?? 0,
      swapTotal: merged.swapTotal ?? 0,
    });

    const row = await this.prisma.trade.update({
      where: { id },
      data: {
        ...input,
        ...(input.symbol && { symbol: input.symbol.toUpperCase() }),
        ...derived,
      },
    });

    // P&L may have moved on either account involved.
    await this.accounts.syncBalance(row.accountId);
    if (input.accountId && input.accountId !== current.accountId) {
      await this.accounts.syncBalance(current.accountId);
    }
    return toTrade(row);
  }

  async addMedia(
    userId: string,
    tradeId: string,
    input: { url: string; width?: number; height?: number },
  ) {
    await this.get(userId, tradeId); // ownership
    return this.prisma.journalMedia.create({
      data: { tradeId, url: input.url, width: input.width ?? null, height: input.height ?? null },
    });
  }

  async listMedia(userId: string, tradeId: string) {
    await this.get(userId, tradeId);
    return this.prisma.journalMedia.findMany({
      where: { tradeId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    const trade = await this.get(userId, id);
    await this.prisma.trade.delete({ where: { id } });
    if (trade.netPnl !== null) await this.accounts.syncBalance(trade.accountId);
  }
}
