import { z } from 'zod';
import { Direction, TradeOutcome, TradingSession, InstrumentType } from './enums';

/**
 * FilterContext — the global, URL-serializable filter applied across
 * Dashboard / Trade Log / Analytics / Calendar / Reports.
 */
export const FilterContextSchema = z.object({
  accountIds: z.array(z.string()).default([]),
  from: z.coerce.date().nullable().default(null),
  to: z.coerce.date().nullable().default(null),
  symbols: z.array(z.string()).default([]),
  directions: z.array(Direction).default([]),
  outcomes: z.array(TradeOutcome).default([]),
  strategyIds: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  sessions: z.array(TradingSession).default([]),
  instrumentTypes: z.array(InstrumentType).default([]),
  followedPlan: z.boolean().nullable().default(null),
});
export type FilterContext = z.infer<typeof FilterContextSchema>;

export const PeriodPreset = z.enum(['today', '7d', '30d', 'mtd', 'ytd', 'all', 'custom']);
export type PeriodPreset = z.infer<typeof PeriodPreset>;

/** Display preferences threaded through every metric view. */
export const DisplayMode = z.object({
  unit: z.enum(['currency', 'r']).default('currency'),
  basis: z.enum(['net', 'gross']).default('net'),
});
export type DisplayMode = z.infer<typeof DisplayMode>;
