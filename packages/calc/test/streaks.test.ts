import { describe, expect, it } from 'vitest';
import { streaks } from '../src/streaks';

describe('streaks', () => {
  it('tracks current and best/worst streaks', () => {
    const s = streaks([10, 20, -5, -5, -5, 30, 30]);
    expect(s.current).toBe(2);
    expect(s.bestWinStreak).toBe(2);
    expect(s.worstLossStreak).toBe(3);
  });

  it('breakeven resets the streak', () => {
    const s = streaks([10, 10, 0, 10]);
    expect(s.current).toBe(1);
    expect(s.bestWinStreak).toBe(2);
  });

  it('empty input', () => {
    expect(streaks([])).toEqual({ current: 0, bestWinStreak: 0, worstLossStreak: 0 });
  });
});
