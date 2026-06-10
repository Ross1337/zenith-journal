import { z } from 'zod';

/** Aggregated KPI payload returned by /v1/metrics/summary. */
export const MetricsSummarySchema = z.object({
  tradeCount: z.number().int(),
  wins: z.number().int(),
  losses: z.number().int(),
  breakevens: z.number().int(),
  netPnl: z.number(),
  grossPnl: z.number(),
  winRate: z.number().nullable(),
  profitFactor: z.number().nullable(),
  expectancy: z.number().nullable(),
  expectancyR: z.number().nullable(),
  avgWin: z.number().nullable(),
  avgLoss: z.number().nullable(),
  avgR: z.number().nullable(),
  maxDrawdown: z.number().nullable(),
  maxDrawdownPct: z.number().nullable(),
  currentStreak: z.number().int(),
  bestDay: z.number().nullable(),
  worstDay: z.number().nullable(),
  avgHoldSecondsWin: z.number().nullable(),
  avgHoldSecondsLoss: z.number().nullable(),
});
export type MetricsSummary = z.infer<typeof MetricsSummarySchema>;

export const EquityPointSchema = z.object({
  date: z.coerce.date(),
  equity: z.number(),
  drawdown: z.number(),
});
export type EquityPoint = z.infer<typeof EquityPointSchema>;

export const DailyPnlSchema = z.object({
  /** ISO date (YYYY-MM-DD) in the user's display timezone. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  netPnl: z.number(),
  tradeCount: z.number().int(),
  winRate: z.number().nullable(),
});
export type DailyPnl = z.infer<typeof DailyPnlSchema>;
