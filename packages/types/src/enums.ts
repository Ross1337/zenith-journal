import { z } from 'zod';

export const Direction = z.enum(['long', 'short']);
export type Direction = z.infer<typeof Direction>;

export const TradeStatus = z.enum(['open', 'closed']);
export type TradeStatus = z.infer<typeof TradeStatus>;

export const InstrumentType = z.enum(['stock', 'option', 'future', 'forex', 'crypto', 'cfd']);
export type InstrumentType = z.infer<typeof InstrumentType>;

export const ExecutionSide = z.enum(['buy', 'sell']);
export type ExecutionSide = z.infer<typeof ExecutionSide>;

export const TradingSession = z.enum(['asia', 'london', 'newyork', 'overlap', 'other']);
export type TradingSession = z.infer<typeof TradingSession>;

export const AccountType = z.enum(['live', 'demo', 'prop', 'eval']);
export type AccountType = z.infer<typeof AccountType>;

export const TradeGrade = z.enum(['A+', 'A', 'B', 'C']);
export type TradeGrade = z.infer<typeof TradeGrade>;

export const MarketCondition = z.enum(['trend', 'range', 'news', 'volatile', 'quiet']);
export type MarketCondition = z.infer<typeof MarketCondition>;

export const TradeMistake = z.enum([
  'late_entry',
  'no_stop',
  'early_exit',
  'oversized',
  'revenge',
  'fomo',
  'moved_stop',
  'overtrading',
  'against_plan',
]);
export type TradeMistake = z.infer<typeof TradeMistake>;

/** 1 (tilt) → 5 (flow). Stored pre / during / post trade. */
export const EmotionScore = z.number().int().min(1).max(5);
export type EmotionScore = z.infer<typeof EmotionScore>;

export const JournalEntryType = z.enum([
  'daily_plan',
  'daily_recap',
  'trade_note',
  'idea',
  'lesson',
  'weekly_review',
]);
export type JournalEntryType = z.infer<typeof JournalEntryType>;

export const TradeOutcome = z.enum(['win', 'loss', 'breakeven']);
export type TradeOutcome = z.infer<typeof TradeOutcome>;
