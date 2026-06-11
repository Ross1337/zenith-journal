import { z } from 'zod';
import { JournalEntryType } from './enums';

export const JournalEntrySchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  type: JournalEntryType,
  title: z.string().max(160).nullable(),
  /** Markdown body. */
  content: z.string(),
  /** 1 (tilt) → 5 (flow). */
  mood: z.number().int().min(1).max(5).nullable(),
  /** YYYY-MM-DD trading day, user timezone. */
  tradingDay: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  tags: z.array(z.string()).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type JournalEntry = z.infer<typeof JournalEntrySchema>;

export const CreateJournalEntryInput = JournalEntrySchema.pick({
  type: true,
  title: true,
  content: true,
  mood: true,
  tradingDay: true,
  tags: true,
}).partial({ title: true, mood: true, tradingDay: true, tags: true });
export type CreateJournalEntryInput = z.infer<typeof CreateJournalEntryInput>;

/** User profile/preferences exposed at /v1/me. */
export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  displayName: z.string().nullable(),
  timezone: z.string(),
  theme: z.enum(['dark', 'light', 'auto']),
  baseCurrency: z.string(),
  apiKey: z.string().nullable(),
  createdAt: z.coerce.date(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UpdateProfileInput = z.object({
  displayName: z.string().max(80).nullable().optional(),
  timezone: z.string().max(64).optional(),
  theme: z.enum(['dark', 'light', 'auto']).optional(),
  baseCurrency: z.string().length(3).optional(),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileInput>;
