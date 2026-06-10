import { Injectable, NotFoundException } from '@nestjs/common';
import type { JournalEntry } from '@zenith/types';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateJournalEntryInput,
  ListJournalQuery,
  UpdateJournalEntryInput,
} from './journal.dto';

@Injectable()
export class JournalService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    userId: string,
    q: ListJournalQuery,
  ): Promise<{ items: JournalEntry[]; total: number }> {
    const where = {
      userId,
      ...(q.type && { type: q.type }),
      ...(q.tradingDay && { tradingDay: q.tradingDay }),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.journalEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: q.offset,
        take: q.limit,
      }),
      this.prisma.journalEntry.count({ where }),
    ]);
    return { items, total };
  }

  async get(userId: string, id: string): Promise<JournalEntry> {
    const entry = await this.prisma.journalEntry.findUnique({ where: { id } });
    if (!entry || entry.userId !== userId) {
      throw new NotFoundException(`Journal entry ${id} not found`);
    }
    return entry;
  }

  async create(userId: string, input: CreateJournalEntryInput): Promise<JournalEntry> {
    await this.prisma.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} });
    return this.prisma.journalEntry.create({
      data: {
        userId,
        type: input.type,
        title: input.title ?? null,
        content: input.content,
        mood: input.mood ?? null,
        tradingDay: input.tradingDay ?? null,
        tags: input.tags ?? [],
      },
    });
  }

  async update(userId: string, id: string, input: UpdateJournalEntryInput): Promise<JournalEntry> {
    await this.get(userId, id);
    return this.prisma.journalEntry.update({ where: { id }, data: input });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.get(userId, id);
    await this.prisma.journalEntry.delete({ where: { id } });
  }
}
