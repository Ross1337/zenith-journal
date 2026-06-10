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
      create: { id: userId },
      update: {},
    });
    return toProfile(user);
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile> {
    await this.getProfile(userId); // ensure row exists
    const user = await this.prisma.user.update({ where: { id: userId }, data: input });
    return toProfile(user);
  }
}

function toProfile(user: {
  id: string;
  email: string | null;
  displayName: string | null;
  timezone: string;
  theme: string;
  baseCurrency: string;
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
    createdAt: user.createdAt,
  };
}
