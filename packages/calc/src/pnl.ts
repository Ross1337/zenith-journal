import type { Direction } from '@zenith/types';

export interface PnlInput {
  direction: Direction;
  qty: number;
  avgEntry: number;
  avgExit: number;
  commission?: number;
  fees?: number;
  swap?: number;
}

/** Gross P&L: signed price move × qty. Short = (entry − exit) × qty. */
export function grossPnl(i: PnlInput): number {
  const move = i.direction === 'long' ? i.avgExit - i.avgEntry : i.avgEntry - i.avgExit;
  return move * i.qty;
}

/** Net P&L = gross − commissions − fees + swap (swap may be ±). */
export function netPnl(i: PnlInput): number {
  return grossPnl(i) - (i.commission ?? 0) - (i.fees ?? 0) + (i.swap ?? 0);
}

/**
 * Realized R-multiple = net P&L / initial risk.
 * Initial risk = |entry − stop| × qty. Returns null without a stop or risk amount.
 */
export function rRealized(
  pnl: number,
  opts: { avgEntry: number; initialStop: number | null; qty: number } | { riskAmount: number },
): number | null {
  const risk =
    'riskAmount' in opts
      ? opts.riskAmount
      : opts.initialStop === null
        ? null
        : Math.abs(opts.avgEntry - opts.initialStop) * opts.qty;
  if (risk === null || risk <= 0) return null;
  return pnl / risk;
}

/** Planned R:R = |target − entry| / |entry − stop|. */
export function rPlanned(entry: number, stop: number, target: number): number | null {
  const risk = Math.abs(entry - stop);
  if (risk === 0) return null;
  return Math.abs(target - entry) / risk;
}

/** Percent gain on the position notional, signed. */
export function pnlPct(i: PnlInput): number {
  const notional = i.avgEntry * i.qty;
  if (notional === 0) return 0;
  return (grossPnl(i) / notional) * 100;
}
