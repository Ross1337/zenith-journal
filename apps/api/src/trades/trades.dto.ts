import { z } from 'zod';
import { CreateTradeInput, Direction, TradeOutcome, TradeStatus } from '@zenith/types';

export { CreateTradeInput };

export const UpdateTradeInput = CreateTradeInput.partial();
export type UpdateTradeInput = z.infer<typeof UpdateTradeInput>;

/** Query-string filters for GET /v1/trades. */
export const ListTradesQuery = z.object({
  accountId: z.string().optional(),
  symbol: z.string().optional(),
  direction: Direction.optional(),
  status: TradeStatus.optional(),
  outcome: TradeOutcome.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});
export type ListTradesQuery = z.infer<typeof ListTradesQuery>;
