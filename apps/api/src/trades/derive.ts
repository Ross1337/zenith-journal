import { grossPnl, netPnl, pnlPct, rPlanned, rRealized } from '@zenith/calc';
import type { Direction, TradeStatus } from '@zenith/types';

export interface DerivableTrade {
  direction: Direction;
  qty: number;
  avgEntry: number;
  avgExit: number | null;
  initialStop: number | null;
  target: number | null;
  openedAt: Date;
  closedAt: Date | null;
  commissionTotal: number;
  feesTotal: number;
  swapTotal: number;
}

export interface DerivedMetrics {
  status: TradeStatus;
  grossPnl: number | null;
  netPnl: number | null;
  pnlPct: number | null;
  rRealized: number | null;
  rPlanned: number | null;
  holdSeconds: number | null;
}

/**
 * Recompute everything derivable from entry/exit/stop — single source of
 * truth shared by manual entry, edits and CSV import. Clients never send
 * derived values.
 */
export function deriveTradeMetrics(trade: DerivableTrade): DerivedMetrics {
  const rPlannedValue =
    trade.initialStop !== null && trade.target !== null
      ? roundNullable(rPlanned(trade.avgEntry, trade.initialStop, trade.target))
      : null;

  const closed = trade.avgExit !== null && trade.closedAt !== null;
  if (!closed) {
    return {
      status: 'open',
      grossPnl: null,
      netPnl: null,
      pnlPct: null,
      rRealized: null,
      rPlanned: rPlannedValue,
      holdSeconds: null,
    };
  }

  const input = {
    direction: trade.direction,
    qty: trade.qty,
    avgEntry: trade.avgEntry,
    avgExit: trade.avgExit!,
    commission: trade.commissionTotal,
    fees: trade.feesTotal,
    swap: trade.swapTotal,
  };
  const net = netPnl(input);

  return {
    status: 'closed',
    grossPnl: round(grossPnl(input), 2),
    netPnl: round(net, 2),
    pnlPct: round(pnlPct(input), 4),
    rRealized: roundNullable(
      rRealized(net, { avgEntry: trade.avgEntry, initialStop: trade.initialStop, qty: trade.qty }),
    ),
    rPlanned: rPlannedValue,
    holdSeconds: Math.max(
      0,
      Math.round((trade.closedAt!.getTime() - trade.openedAt.getTime()) / 1000),
    ),
  };
}

export function round(v: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
}

export function roundNullable(v: number | null): number | null {
  return v === null ? null : round(v, 4);
}
