import { z } from 'zod';

export const MtIngestInput = z.object({
  source: z.enum(['mt4', 'mt5']).default('mt5'),
  apiKey: z.string().min(1),
  accountId: z.string().min(1),
  ticket: z.number().int().positive(),
  symbol: z.string().min(1).max(32),
  /** 'buy' = long, 'sell' = short */
  type: z.enum(['buy', 'sell']),
  openTime: z.coerce.date(),
  closeTime: z.coerce.date().nullable().optional(),
  openPrice: z.number().positive(),
  closePrice: z.number().positive().nullable().optional(),
  lots: z.number().positive(),
  sl: z.number().nullable().optional(),
  tp: z.number().nullable().optional(),
  /** Total commission (negative = cost). */
  commission: z.number().default(0),
  /** Rollover/financing (negative = cost). */
  swap: z.number().default(0),
  /** Realised profit (includes commission/swap in MT). */
  profit: z.number().default(0),
});
export type MtIngestInput = z.infer<typeof MtIngestInput>;
