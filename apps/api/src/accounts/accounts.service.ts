import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Account } from '@zenith/types';
import type { CreateAccountInput, UpdateAccountInput } from './accounts.dto';

/**
 * In-memory store, scoped by userId. Same contract Postgres (Prisma)
 * will implement next iteration — controllers won't change.
 */
@Injectable()
export class AccountsService {
  private readonly accounts = new Map<string, Account>();

  list(userId: string): Account[] {
    return [...this.accounts.values()]
      .filter((a) => a.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  get(userId: string, id: string): Account {
    const account = this.accounts.get(id);
    if (!account || account.userId !== userId) {
      throw new NotFoundException(`Account ${id} not found`);
    }
    return account;
  }

  create(userId: string, input: CreateAccountInput): Account {
    const now = new Date();
    const account: Account = {
      id: randomUUID(),
      userId,
      name: input.name,
      broker: input.broker ?? null,
      accountType: input.accountType,
      currency: input.currency ?? 'USD',
      initialBalance: input.initialBalance,
      currentBalance: input.initialBalance,
      color: input.color ?? null,
      propConfig: input.propConfig ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    this.accounts.set(account.id, account);
    return account;
  }

  update(userId: string, id: string, input: UpdateAccountInput): Account {
    const account = this.get(userId, id);
    const updated: Account = { ...account, ...input, updatedAt: new Date() };
    this.accounts.set(id, updated);
    return updated;
  }

  remove(userId: string, id: string): void {
    this.get(userId, id);
    this.accounts.delete(id);
  }

  /** Called by TradesService when closed P&L changes. */
  applyPnlDelta(userId: string, id: string, delta: number): void {
    const account = this.get(userId, id);
    account.currentBalance += delta;
    account.updatedAt = new Date();
  }
}
