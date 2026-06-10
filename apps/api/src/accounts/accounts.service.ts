import { Injectable, NotFoundException } from '@nestjs/common';
import type { Account } from '@zenith/types';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from '../billing/billing.service';
import { toAccount } from '../common/mappers';
import type { CreateAccountInput, UpdateAccountInput } from './accounts.dto';

/** Postgres-backed accounts, scoped by userId. */
@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly billing: BillingService,
  ) {}

  async list(userId: string): Promise<Account[]> {
    const rows = await this.prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(toAccount);
  }

  async get(userId: string, id: string): Promise<Account> {
    const row = await this.prisma.account.findUnique({ where: { id } });
    if (!row || row.userId !== userId) {
      throw new NotFoundException(`Account ${id} not found`);
    }
    return toAccount(row);
  }

  async create(userId: string, input: CreateAccountInput): Promise<Account> {
    await this.billing.assertCanAddAccount(userId);
    // First write for a new Clerk user — make sure the FK target exists.
    await this.prisma.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });

    const row = await this.prisma.account.create({
      data: {
        userId,
        name: input.name,
        broker: input.broker ?? null,
        accountType: input.accountType,
        currency: input.currency ?? 'USD',
        initialBalance: input.initialBalance,
        currentBalance: input.initialBalance,
        color: input.color ?? null,
        propConfig: input.propConfig ?? undefined,
      },
    });
    return toAccount(row);
  }

  async update(userId: string, id: string, input: UpdateAccountInput): Promise<Account> {
    await this.get(userId, id);
    const { propConfig, ...rest } = input;
    const row = await this.prisma.account.update({
      where: { id },
      data: { ...rest, ...(propConfig !== undefined && { propConfig: propConfig ?? undefined }) },
    });

    // A new starting balance shifts the running balance by the same delta.
    if (input.initialBalance !== undefined) {
      return this.syncBalance(id);
    }
    return toAccount(row);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.get(userId, id);
    await this.prisma.account.delete({ where: { id } });
  }

  /** currentBalance = initialBalance + Σ closed net P&L. Called after trade writes. */
  async syncBalance(accountId: string): Promise<Account> {
    const [account, agg] = await this.prisma.$transaction([
      this.prisma.account.findUniqueOrThrow({ where: { id: accountId } }),
      this.prisma.trade.aggregate({
        where: { accountId, status: 'closed' },
        _sum: { netPnl: true },
      }),
    ]);
    const balance = account.initialBalance + (agg._sum.netPnl ?? 0);
    const row = await this.prisma.account.update({
      where: { id: accountId },
      data: { currentBalance: Math.round(balance * 100) / 100 },
    });
    return toAccount(row);
  }
}
