import { z } from 'zod';
import { InstrumentType } from '@zenith/types';

export const FillInput = z.object({
  symbol: z.string().min(1).max(32),
  side: z.enum(['buy', 'sell']),
  quantity: z.number().positive(),
  price: z.number().positive(),
  commission: z.number().min(0).default(0),
  fees: z.number().min(0).default(0),
  executedAt: z.coerce.date(),
  externalId: z.string().min(1).max(120),
});
export type FillInput = z.infer<typeof FillInput>;

/** Commit a previewed batch — the server re-matches; clients never send trades. */
export const CommitImportInput = z.object({
  accountId: z.string().min(1),
  instrumentType: InstrumentType.default('future'),
  fills: z.array(FillInput).min(1).max(5000),
});
export type CommitImportInput = z.infer<typeof CommitImportInput>;
