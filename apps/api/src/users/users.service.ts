import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { UpdateProfileInput, UserProfile } from '@zenith/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Auto-provisions on first call — Clerk is the identity source of truth. */
  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.upsert({
      where: { id: userId },
      create: { id: userId, apiKey: randomUUID() },
      update: {},
    });
    // Backfill apiKey for existing users who don't have one yet.
    if (!user.apiKey) {
      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: { apiKey: randomUUID() },
      });
      return toProfile(updated);
    }
    return toProfile(user);
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile> {
    await this.getProfile(userId); // ensure row + apiKey exists
    const user = await this.prisma.user.update({ where: { id: userId }, data: input });
    return toProfile(user);
  }

  async regenerateApiKey(userId: string): Promise<{ apiKey: string }> {
    await this.getProfile(userId);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { apiKey: randomUUID() },
    });
    return { apiKey: user.apiKey! };
  }

  /** Lookup userId from an API key — returns null if not found. */
  async getUserIdByApiKey(apiKey: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({ where: { apiKey }, select: { id: true } });
    return user?.id ?? null;
  }
}

function toProfile(user: {
  id: string;
  email: string | null;
  displayName: string | null;
  timezone: string;
  theme: string;
  baseCurrency: string;
  apiKey: string | null;
  createdAt: Date;
}): UserProfile {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    timezone: user.timezone,
    theme: (['dark', 'light', 'auto'] as const).includes(user.theme as 'dark')
      ? (user.theme as 'dark' | 'light' | 'auto')
      : 'dark',
    baseCurrency: user.baseCurrency,
    apiKey: user.apiKey,
    createdAt: user.createdAt,
  };
}
