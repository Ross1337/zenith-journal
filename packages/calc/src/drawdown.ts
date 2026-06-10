export interface EquityPoint {
  /** Epoch ms — keeps the function isomorphic & serialization-free. */
  t: number;
  equity: number;
}

export interface DrawdownResult {
  /** Max peak-to-trough drop, in equity units (≥ 0). */
  maxDrawdown: number;
  /** Same, as a fraction of the peak (0–1). Null when peak ≤ 0. */
  maxDrawdownPct: number | null;
  /** Drawdown measured at the last point (≥ 0). */
  currentDrawdown: number;
  /** Longest time spent below a prior peak, ms. */
  longestDrawdownMs: number;
}

/** Build a cumulative equity curve from per-trade (t, pnl) pairs, given a starting balance. */
export function equityCurve(
  trades: Array<{ t: number; pnl: number }>,
  startingBalance = 0,
): EquityPoint[] {
  const sorted = [...trades].sort((a, b) => a.t - b.t);
  let equity = startingBalance;
  return sorted.map(({ t, pnl }) => {
    equity += pnl;
    return { t, equity };
  });
}

/** Running-peak drawdown over an equity curve. */
export function drawdown(curve: EquityPoint[]): DrawdownResult {
  let peak = -Infinity;
  let peakT = 0;
  let maxDd = 0;
  let maxDdPct: number | null = null;
  let longestMs = 0;
  let currentDd = 0;

  for (const point of curve) {
    if (point.equity >= peak) {
      if (peak !== -Infinity) longestMs = Math.max(longestMs, point.t - peakT);
      peak = point.equity;
      peakT = point.t;
      currentDd = 0;
    } else {
      const dd = peak - point.equity;
      currentDd = dd;
      if (dd > maxDd) {
        maxDd = dd;
        maxDdPct = peak > 0 ? dd / peak : null;
      }
    }
  }
  // Still underwater at the end of the series.
  const last = curve[curve.length - 1];
  if (last && last.equity < peak) longestMs = Math.max(longestMs, last.t - peakT);

  return { maxDrawdown: maxDd, maxDrawdownPct: maxDdPct, currentDrawdown: currentDd, longestDrawdownMs: longestMs };
}
