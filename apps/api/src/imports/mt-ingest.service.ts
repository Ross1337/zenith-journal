import { randomUUID } from 'node:crypto';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { matchExecutions } from '@zenith/calc';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { BillingService } from '../billing/billing.service';
import { AccountsService } from '../accounts/accounts.service';
import { deriveTradeMetrics } from '../trades/derive';
import type { MtIngestInput } from './mt-ingest.dto';

@Injectable()
export class MtIngestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly billing: BillingService,
    private readonly accounts: AccountsService,
  ) {}

  async ingest(input: MtIngestInput) {
    // 1. Resolve user from API key.
    const userId = await this.users.getUserIdByApiKey(input.apiKey);
    if (!userId) throw new UnauthorizedException('Invalid API key');

    // 2. Only accept closed trades (open position tracking is not supported yet).
    if (!input.closeTime || input.closePrice == null) {
      return { status: 'skipped', reason: 'open_position' };
    }

    // 3. Resolve or auto-create account.
    const accountId = await this.resolveAccount(userId, input.accountId, input.source);

    // 4. Dedup: if both execution externalIds exist, skip.
    const extOpen = `${input.source}-${input.ticket}-open`;
    const extClose = `${input.source}-${input.ticket}-close`;
    const existing = await this.prisma.execution.findFirst({
      where: { accountId, externalId: extOpen },
    });
    if (existing) return { status: 'duplicate', ticket: input.ticket };

    // 5. Build two fills: open leg + close leg.
    const commission = Math.abs(input.commission);
    const swap = input.swap; // can be positive (credit) or negative (debit)

    const closeSide = input.type === 'buy' ? 'sell' : 'buy';
    const fills = [
      {
        id: extOpen,
        accountId,
        symbol: input.symbol.toUpperCase(),
        side: input.type as 'buy' | 'sell',
        quantity: input.lots,
        price: input.openPrice,
        commission: 0,
        fees: 0,
        swap: 0,
        executedAt: input.openTime.getTime(),
      },
      {
        id: extClose,
        accountId,
        symbol: input.symbol.toUpperCase(),
        side: closeSide,
        quantity: input.lots,
        price: input.closePrice,
        commission,
        fees: 0,
        swap,
        executedAt: input.closeTime.getTime(),
      },
    ];

    const matched = matchExecutions(fills);
    if (matched.length === 0) throw new BadRequestException('Could not match fills into a trade');

    await this.billing.assertCanAddTrades(userId, matched.length);

    const batchId = randomUUID();
    const importedTrade = matched[0]!;

    await this.prisma.(async (tx) => {
      await tx.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });

      const idByExt = new Map<string, string>();
      for (const f of fills) {
        const row = await tx.execution.create({
          data: {
            accountId,
            symbol: f.symbol,
            instrumentType: 'forex',
            side: f.side,
            quantity: f.quantity,
            price: f.price,
            commission: f.commission,
            fees: f.fees,
            swap: f.swap,
            executedAt: new Date(f.executedAt),
            externalId: f.id,
            importBatchId: batchId,
          },
        });
        idByExt.set(f.id, row.id);
      }

      const t = importedTrade;
      const shape = {
        direction: t.direction,
        qty: round(t.qty, 4),
        avgEntry: round(t.avgEntry, 6),
        avgExit: t.avgExit !== null ? round(t.avgExit, 6) : null,
        initialStop: input.sl ?? null,
        target: input.tp ?? null,
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
          accountId,
          symbol: input.symbol.toUpperCase(),
          instrumentType: 'forex',
          ...shape,
          ...derived,
          tags: [input.source],
        },
      });

      await tx.execution.updateMany({
        where: {
          id: {
            in: t.executionIds
              .map((e) => idByExt.get(e))
              .filter((x): x is string => !!x),
          },
        },
        data: { tradeId: trade.id },
      });
    });

    await this.accounts.syncBalance(accountId);

    return { status: 'imported', ticket: input.ticket, batchId };
  }

  private async resolveAccount(
    userId: string,
    accountId: string,
    source: string,
  ): Promise<string> {
    // Try exact UUID match first.
    const existing = await this.prisma.account.findFirst({
      where: { id: accountId, userId },
    });
    if (existing) return existing.id;

    // Auto-create: treat accountId as a broker account number → find by name.
    const byName = await this.prisma.account.findFirst({
      where: { userId, name: accountId },
    });
    if (byName) return byName.id;

    // Create a new account for this MT account number.
    const created = await this.prisma.account.create({
      data: {
        userId,
        name: accountId,
        broker: source.toUpperCase(),
        accountType: 'live',
        currency: 'USD',
        initialBalance: 0,
        currentBalance: 0,
        color: '#FFB020',
      },
    });
    return created.id;
  }
}

function round(v: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
}

function round2(v: number): number {
  return round(v, 2);
}
