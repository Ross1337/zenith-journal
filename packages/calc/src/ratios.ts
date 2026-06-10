import { mean, stdDev, sum } from './kpis';

/**
 * Annualized Sharpe over periodic returns (e.g. daily P&L / equity).
 * sharpe = (mean − rf) / std × √periodsPerYear. Null with < 2 points or zero std.
 */
export function sharpe(returns: number[], periodsPerYear = 252, riskFree = 0): number | null {
  const m = mean(returns);
  const sd = stdDev(returns);
  if (m === null || sd === null || sd === 0) return null;
  return ((m - riskFree) / sd) * Math.sqrt(periodsPerYear);
}

/** Sortino — like Sharpe but only downside deviation in the denominator. */
export function sortino(returns: number[], periodsPerYear = 252, riskFree = 0): number | null {
  const m = mean(returns);
  if (m === null || returns.length < 2) return null;
  const downside = returns.map((r) => Math.min(0, r - riskFree));
  const dd = Math.sqrt(sum(downside.map((d) => d ** 2)) / (returns.length - 1));
  if (dd === 0) return null;
  return ((m - riskFree) / dd) * Math.sqrt(periodsPerYear);
}

/** Calmar = CAGR / |max drawdown %|. Inputs as fractions (0.2 = 20%). */
export function calmar(cagr: number, maxDrawdownPct: number): number | null {
  if (maxDrawdownPct === 0) return null;
  return cagr / Math.abs(maxDrawdownPct);
}

/**
 * Z-score of win/loss streak randomness.
 * Z = (N(R − 0.5) − X) / √(X(X − N) / (N − 1))
 * where N = trades, R = streak count, X = 2 × wins × losses.
 * |Z| > 1.96 → streaks are statistically non-random (95%).
 */
export function streakZScore(outcomes: Array<'win' | 'loss'>): number | null {
  const n = outcomes.length;
  if (n < 2) return null;
  const wins = outcomes.filter((o) => o === 'win').length;
  const losses = n - wins;
  if (wins === 0 || losses === 0) return null;

  let runs = 1;
  for (let i = 1; i < n; i++) if (outcomes[i] !== outcomes[i - 1]) runs++;

  const x = 2 * wins * losses;
  const denom = Math.sqrt((x * (x - n)) / (n - 1));
  if (denom === 0 || Number.isNaN(denom)) return null;
  return (n * (runs - 0.5) - x) / denom;
}
