export interface StreakSummary {
  /** Positive = current winning streak, negative = losing streak. */
  current: number;
  bestWinStreak: number;
  worstLossStreak: number;
}

/** Streaks over chronologically-ordered P&Ls. Breakeven (0) resets the streak. */
export function streaks(pnls: number[]): StreakSummary {
  let current = 0;
  let bestWin = 0;
  let worstLoss = 0;

  for (const p of pnls) {
    if (p > 0) current = current > 0 ? current + 1 : 1;
    else if (p < 0) current = current < 0 ? current - 1 : -1;
    else current = 0;

    bestWin = Math.max(bestWin, current);
    worstLoss = Math.min(worstLoss, current);
  }

  return { current, bestWinStreak: bestWin, worstLossStreak: Math.abs(worstLoss) };
}
