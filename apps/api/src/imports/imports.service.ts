import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { matchExecutions, type MatchedTrade } from '@zenith/calc';
import { PrismaService } from '../prisma/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { deriveTradeMetrics } from '../trades/derive';
import { normalizeCsv, type NormalizedFill } from './csv';
import type { CommitImportInput, FillInput } from './imports.dto';

export interface ImportPreview {
  fills: NormalizedFill[];
  trades: Array<{
    symbol: string;
    direction: 'long' | 'short';
    status: 'open' | 'closed';
    openedAt: string;
    closedAt: string | null;
    qty: number;
    avgEntry: number;
    avgExit: number | null;
    netPnl: number | null;
    fillCount: number;
  }>;
  totalNetPnl: number;
  duplicates: number;
  errors: string[];
}

@Injectable()
export class ImportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accounts: AccountsService,
  ) {}

  /** Parse + match, flag rows already imported. Nothing is written. */
  async preview(userId: string, accountId: string, csvText: string): Promise<ImportPreview> {
    await this.accounts.get(userId, accountId); // ownership

    const { fills, errors } = normalizeCsv(csvText);
    if (fills.length === 0) {
      return { fills: [], trades: [], totalNetPnl: 0, duplicates: 0, errors };
    }

    const fresh = await this.withoutDuplicates(accountId, fills);
    const trades = this.match(accountId, fresh);

    return {
      fills: fresh,
      trades: trades.map(toPreviewTrade),
      totalNetPnl: round2(trades.reduce((acc, t) => acc + (t.netPnl ?? 0), 0)),
      duplicates: fills.length - fresh.length,
      errors,
    };
  }

  /** Insert executions + matched trades atomically, then sync the balance. */
  async commit(userId: string, input: CommitImportInput) {
    await this.accounts.get(userId, input.accountId);

    const fills: NormalizedFill[] = input.fills.map((f) => ({
      ...f,
      executedAt: f.executedAt.toISOString(),
    }));
    const fresh = await this.withoutDuplicates(input.accountId, fills);
    if (fresh.length === 0) {
      throw new BadRequestException('Every row in this file was already imported');
    }
    const matched = this.match(input.accountId, fresh);
    const batchId = randomUUID();

    await this.prisma.$transaction(async (tx) => {
      await tx.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });

      // Insert fills first, keyed by externalId so trades can link back.
      const idByExternal = new Map<string, string>();
      for (const f of fresh) {
        const row = await tx.execution.create({
          data: {
            accountId: input.accountId,
            symbol: f.symbol,
            instrumentType: input.instrumentType,
            side: f.side,
            quantity: f.quantity,
            price: f.price,
            commission: f.commission,
            fees: f.fees,
            executedAt: new Date(f.executedAt),
            externalId: f.externalId,
            importBatchId: batchId,
          },
        });
        idByExternal.set(f.externalId, row.id);
      }

      for (const t of matched) {
        const shape = {
          direction: t.direction,
          qty: round(t.qty, 4),
          avgEntry: round(t.avgEntry, 6),
          avgExit: t.avgExit !== null ? round(t.avgExit, 6) : null,
          initialStop: null,
          target: null,
          openedAt: new Date(t.openedAt),
          closedAt: t.closedAt !== null ? new Date(t.closedAt) : null,
          commissionTotal: round2(t.commissionTotal),
          feesTotal: round2(t.feesTotal),
          swapTotal: round2(t.swapTotal),
        };
        const derived = deriveTradeMetrics(shape);
        const trade = await tx.trade.create({
          data: {
            userId,
            accountId: input.accountId,
            symbol: t.symbol,
            instrumentType: input.instrumentType,
            ...shape,
            ...derived,
            tags: ['imported'],
          },
        });
        await tx.execution.updateMany({
          where: { id: { in: t.executionIds.map((e) => idByExternal.get(e)).filter((x): x is string => !!x) } },
          data: { tradeId: trade.id },
        });
      }
    });

    await this.accounts.syncBalance(input.accountId);

    return {
      batchId,
      importedExecutions: fresh.length,
      importedTrades: matched.length,
      skippedDuplicates: fills.length - fresh.length,
    };
  }

  private match(accountId: string, fills: NormalizedFill[]): MatchedTrade[] {
    // matchExecutions keys on externalId as the fill id — stable across preview/commit.
    return matchExecutions(
      fills.map((f) => ({
        id: f.externalId,
        accountId,
        symbol: f.symbol,
        side: f.side,
        quantity: f.quantity,
        price: f.price,
        commission: f.commission,
        fees: f.fees,
        executedAt: new Date(f.executedAt).getTime(),
      })),
    );
  }

  private async withoutDuplicates(
    accountId: string,
    fills: NormalizedFill[],
  ): Promise<NormalizedFill[]> {
    const existing = await this.prisma.execution.findMany({
      where: { accountId, externalId: { in: fills.map((f) => f.externalId) } },
      select: { externalId: true },
    });
    const seen = new Set(existing.map((e) => e.externalId));
    // Also dedup inside the file itself.
    return fills.filter((f) => {
      if (seen.has(f.externalId)) return false;
      seen.add(f.externalId);
      return true;
    });
  }
}

function toPreviewTrade(t: MatchedTrade) {
  return {
    symbol: t.symbol,
    direction: t.direction,
    status: t.status,
    openedAt: new Date(t.openedAt).toISOString(),
    closedAt: t.closedAt !== null ? new Date(t.closedAt).toISOString() : null,
    qty: round(t.qty, 4),
    avgEntry: round(t.avgEntry, 6),
    avgExit: t.avgExit !== null ? round(t.avgExit, 6) : null,
    netPnl: t.netPnl !== null ? round2(t.netPnl) : null,
    fillCount: t.executionIds.length,
  };
}

function round(v: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
}

function round2(v: number): number {
  return round(v, 2);
}
