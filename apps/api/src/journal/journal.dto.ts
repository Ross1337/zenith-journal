import { z } from 'zod';
import { CreateJournalEntryInput, JournalEntryType } from '@zenith/types';

export { CreateJournalEntryInput };

export const UpdateJournalEntryInput = CreateJournalEntryInput.partial();
export type UpdateJournalEntryInput = z.infer<typeof UpdateJournalEntryInput>;

export const ListJournalQuery = z.object({
  type: JournalEntryType.optional(),
  tradingDay: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
export type ListJournalQuery = z.infer<typeof ListJournalQuery>;
