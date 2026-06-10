import type { Direction } from '@zenith/types';

/** Minimal fill shape needed for matching — a subset of @zenith/types Execution. */
export interface Fill {
  id: string;
  accountId: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  commission?: number;
  fees?: number;
  swap?: number;
  /** Epoch ms. */
  executedAt: number;
}

export interface MatchedTrade {
  accountId: string;
  symbol: string;
  direction: Direction;
  status: 'open' | 'closed';
  openedAt: number;
  closedAt: number | null;
  /** Total opened quantity (entries side). */
  qty: number;
  avgEntry: number;
  avgExit: number | null;
  grossPnl: number | null;
  netPnl: number | null;
  commissionTotal: number;
  feesTotal: number;
  swapTotal: number;
  holdSeconds: number | null;
  executionIds: string[];
}

/**
 * Match raw fills into position-based trades.
 *
 * Signed-position accumulation per (account, symbol):
 *  - a trade opens when position leaves 0, closes when it returns to 0;
 *  - same-direction fills extend the position (weighted average entry);
 *  - opposite fills reduce it (weighted average exit);
 *  - a fill crossing through 0 (long↔short flip) closes the current trade and
 *    opens a new one with the remainder — costs split pro-rata by quantity.
 */
export function matchExecutions(fills: Fill[]): MatchedTrade[] {
  const trades: MatchedTrade[] = [];
  const byKey = new Map<string, Fill[]>();
  for (const f of fills) {
    const key = `${f.accountId}::${f.symbol}`;
    const arr = byKey.get(key);
    if (arr) arr.push(f);
    else byKey.set(key, [f]);
  }

  for (const group of byKey.values()) {
    group.sort((a, b) => a.executedAt - b.executedAt);
    trades.push(...matchGroup(group));
  }

  return trades.sort((a, b) => a.openedAt - b.openedAt);
}

interface OpenState {
  direction: Direction;
  openedAt: number;
  position: number; // unsigned remaining position
  entryQty: number;
  entryNotional: number;
  exitQty: number;
  exitNotional: number;
  commission: number;
  fees: number;
  swap: number;
  executionIds: string[];
}

function matchGroup(fills: Fill[]): MatchedTrade[] {
  const out: MatchedTrade[] = [];
  let state: OpenState | null = null;
  const first = fills[0];
  if (!first) return out;
  const { accountId, symbol } = first;

  const close = (closedAt: number): void => {
    if (!state) return;
    out.push(finalize(accountId, symbol, state, closedAt));
    state = null;
  };

  for (const f of fills) {
    let qty = f.quantity;
    let commission = f.commission ?? 0;
    let fees = f.fees ?? 0;
    let swap = f.swap ?? 0;
    const fillDir: Direction = f.side === 'buy' ? 'long' : 'short';

    if (state !== null && fillDir !== state.direction && qty > state.position) {
      // Flip: split the fill — closing part on this trade, remainder opens a new one.
      const closingQty = state.position;
      const frac = closingQty / qty;
      applyFill(state, f, closingQty, commission * frac, fees * frac, swap * frac);
      close(f.executedAt);
      qty -= closingQty;
      commission *= 1 - frac;
      fees *= 1 - frac;
      swap *= 1 - frac;
    }

    if (state === null) {
      state = {
        direction: fillDir,
        openedAt: f.executedAt,
        position: 0,
        entryQty: 0,
        entryNotional: 0,
        exitQty: 0,
        exitNotional: 0,
        commission: 0,
        fees: 0,
        swap: 0,
        executionIds: [],
      };
    }

    applyFill(state, f, qty, commission, fees, swap);
    if (state.position === 0) close(f.executedAt);
  }

  if (state !== null) out.push(finalize(accountId, symbol, state, null));
  return out;
}

function applyFill(
  s: OpenState,
  f: Fill,
  qty: number,
  commission: number,
  fees: number,
  swap: number,
): void {
  const fillDir: Direction = f.side === 'buy' ? 'long' : 'short';
  if (fillDir === s.direction) {
    s.entryQty += qty;
    s.entryNotional += qty * f.price;
    s.position += qty;
  } else {
    s.exitQty += qty;
    s.exitNotional += qty * f.price;
    s.position -= qty;
  }
  s.commission += commission;
  s.fees += fees;
  s.swap += swap;
  if (!s.executionIds.includes(f.id)) s.executionIds.push(f.id);
}

function finalize(
  accountId: string,
  symbol: string,
  s: OpenState,
  closedAt: number | null,
): MatchedTrade {
  const avgEntry = s.entryNotional / s.entryQty;
  const avgExit = s.exitQty > 0 ? s.exitNotional / s.exitQty : null;
  const closed = closedAt !== null;

  let grossPnl: number | null = null;
  let netPnl: number | null = null;
  if (avgExit !== null) {
    // P&L on the closed quantity only (open remainder is unrealized).
    const move = s.direction === 'long' ? avgExit - avgEntry : avgEntry - avgExit;
    grossPnl = move * s.exitQty;
    netPnl = grossPnl - s.commission - s.fees + s.swap;
  }

  return {
    accountId,
    symbol,
    direction: s.direction,
    status: closed ? 'closed' : 'open',
    openedAt: s.openedAt,
    closedAt,
    qty: s.entryQty,
    avgEntry,
    avgExit,
    grossPnl,
    netPnl,
    commissionTotal: s.commission,
    feesTotal: s.fees,
    swapTotal: s.swap,
    holdSeconds: closed ? Math.round((closedAt - s.openedAt) / 1000) : null,
    executionIds: s.executionIds,
  };
}
