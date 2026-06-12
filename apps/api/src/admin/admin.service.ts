import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, subscriptions, totalTrades, totalAccounts] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.subscription.groupBy({
        by: ['plan'],
        _count: { plan: true },
        where: { status: 'active' },
      }),
      this.prisma.trade.count(),
      this.prisma.account.count(),
    ]);

    const planCounts: Record<string, number> = { free: 0, pro: 0, lifetime: 0 };
    for (const s of subscriptions) {
      planCounts[s.plan] = s._count.plan;
    }

    const affiliatesActive = await this.prisma.user.count({
      where: { affiliateStatus: 'VALIDATED' },
    });

    return {
      totalUsers,
      totalTrades,
      totalAccounts,
      subscriptions: planCounts,
      affiliatesActive,
    };
  }

  async getUsers(page = 1, limit = 50, plan?: string, search?: string) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (search) {
      where['OR'] = [
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (plan) {
      where['subscription'] = { plan };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          affiliateStatus: true,
          affiliateBroker: true,
          stars: true,
          createdAt: true,
          updatedAt: true,
          timezone: true,
          theme: true,
          baseCurrency: true,
          subscription: true,
          _count: { select: { trades: true, accounts: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  async getUserById(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        affiliateStatus: true,
        affiliateBroker: true,
        stars: true,
        createdAt: true,
        updatedAt: true,
        timezone: true,
        theme: true,
        baseCurrency: true,
        subscription: true,
        accounts: true,
        _count: { select: { trades: true, journalEntries: true } },
      },
    });
  }

  async updateUser(
    id: string,
    data: {
      role?: string;
      plan?: string;
      affiliateStatus?: string;
      affiliateBroker?: string;
      stars?: number;
      displayName?: string;
    },
  ) {
    const userUpdate: Record<string, unknown> = {};
    if (data.role !== undefined) userUpdate['role'] = data.role;
    if (data.affiliateStatus !== undefined) userUpdate['affiliateStatus'] = data.affiliateStatus;
    if (data.affiliateBroker !== undefined) userUpdate['affiliateBroker'] = data.affiliateBroker;
    if (data.stars !== undefined) userUpdate['stars'] = data.stars;
    if (data.displayName !== undefined) userUpdate['displayName'] = data.displayName;

    const user = await this.prisma.user.update({
      where: { id },
      data: userUpdate,
      include: { subscription: true },
    });

    if (data.plan) {
      await this.prisma.subscription.upsert({
        where: { userId: id },
        update: { plan: data.plan as 'free' | 'pro' | 'lifetime', status: 'active' },
        create: {
          userId: id,
          plan: data.plan as 'free' | 'pro' | 'lifetime',
          status: 'active',
        },
      });
    }

    return user;
  }

  async deleteUser(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }

  async getAffiliates() {
    return this.prisma.user.findMany({
      where: { affiliateStatus: { in: ['PENDING', 'VALIDATED'] } },
      select: {
        id: true,
        email: true,
        displayName: true,
        affiliateStatus: true,
        affiliateBroker: true,
        createdAt: true,
        subscription: { select: { plan: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async validateAffiliate(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { affiliateStatus: 'VALIDATED' },
    });
    await this.prisma.subscription.upsert({
      where: { userId: id },
      update: { plan: 'lifetime', status: 'active' },
      create: { userId: id, plan: 'lifetime', status: 'active' },
    });
    return user;
  }

  async getEas() {
    const accounts = await this.prisma.account.findMany({
      where: { broker: { not: null } },
      include: {
        user: { select: { id: true, email: true, displayName: true } },
        _count: { select: { trades: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return accounts;
  }

  async getSubscriptions(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, displayName: true } },
        },
      }),
      this.prisma.subscription.count(),
    ]);
    return { subscriptions, total, page, limit };
  }
}