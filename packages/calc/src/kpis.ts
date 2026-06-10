/**
 * Core KPIs over a list of closed-trade P&Ls.
 * Convention: a P&L of exactly 0 is breakeven — excluded from win rate by default.
 */

export interface PnlBuckets {
  wins: number[];
  losses: number[];
  breakevens: number[];
}

export function bucketize(pnls: number[]): PnlBuckets {
  const wins: number[] = [];
  const losses: number[] = [];
  const breakevens: number[] = [];
  for (const p of pnls) {
    if (p > 0) wins.push(p);
    else if (p < 0) losses.push(p);
    else breakevens.push(p);
  }
  return { wins, losses, breakevens };
}

/** wins / (wins + losses) — breakeven excluded. Null when no decided trades. */
export function winRate(pnls: number[]): number | null {
  const { wins, losses } = bucketize(pnls);
  const decided = wins.length + losses.length;
  return decided === 0 ? null : wins.length / decided;
}

/** Σ gross gains / |Σ gross losses|. Infinity when no losses (and some gains). */
export function profitFactor(pnls: number[]): number | null {
  const { wins, losses } = bucketize(pnls);
  const gain = sum(wins);
  const loss = Math.abs(sum(losses));
  if (gain === 0 && loss === 0) return null;
  if (loss === 0) return Infinity;
  return gain / loss;
}

export function avgWin(pnls: number[]): number | null {
  const { wins } = bucketize(pnls);
  return wins.length === 0 ? null : sum(wins) / wins.length;
}

export function avgLoss(pnls: number[]): number | null {
  const { losses } = bucketize(pnls);
  return losses.length === 0 ? null : sum(losses) / losses.length;
}

/** Expectancy in $ = WR × AvgWin − LR × |AvgLoss|. */
export function expectancy(pnls: number[]): number | null {
  const wr = winRate(pnls);
  if (wr === null) return null;
  const aw = avgWin(pnls) ?? 0;
  const al = avgLoss(pnls) ?? 0;
  return wr * aw - (1 - wr) * Math.abs(al);
}

/** Expectancy in R = mean of realized R-multiples (nulls skipped). */
export function expectancyR(rMultiples: Array<number | null>): number | null {
  const rs = rMultiples.filter((r): r is number => r !== null);
  return rs.length === 0 ? null : sum(rs) / rs.length;
}

/** Kelly % = WR − (1 − WR) / (AvgWin / |AvgLoss|). Null without both sides. */
export function kelly(pnls: number[]): number | null {
  const wr = winRate(pnls);
  const aw = avgWin(pnls);
  const al = avgLoss(pnls);
  if (wr === null || aw === null || al === null || al === 0) return null;
  return wr - (1 - wr) / (aw / Math.abs(al));
}

export function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}

export function mean(xs: number[]): number | null {
  return xs.length === 0 ? null : sum(xs) / xs.length;
}

export function stdDev(xs: number[]): number | null {
  if (xs.length < 2) return null;
  const m = sum(xs) / xs.length;
  const variance = sum(xs.map((x) => (x - m) ** 2)) / (xs.length - 1);
  return Math.sqrt(variance);
}
