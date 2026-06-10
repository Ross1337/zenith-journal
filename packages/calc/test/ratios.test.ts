import { describe, expect, it } from 'vitest';
import { calmar, sharpe, sortino, streakZScore } from '../src/ratios';

describe('sharpe', () => {
  it('positive on consistently positive returns', () => {
    const s = sharpe([0.01, 0.02, 0.015, 0.005], 252);
    expect(s).not.toBeNull();
    expect(s!).toBeGreaterThan(0);
  });

  it('null on constant returns (zero std)', () => {
    expect(sharpe([0.01, 0.01, 0.01])).toBeNull();
  });

  it('null with < 2 points', () => {
    expect(sharpe([0.01])).toBeNull();
  });
});

describe('sortino', () => {
  it('exceeds sharpe when downside is small', () => {
    const returns = [0.02, 0.03, -0.005, 0.025, 0.01];
    expect(sortino(returns)!).toBeGreaterThan(sharpe(returns)!);
  });
});

describe('calmar', () => {
  it('CAGR / |maxDD|', () => {
    expect(calmar(0.3, 0.15)).toBeCloseTo(2);
  });

  it('null when no drawdown', () => {
    expect(calmar(0.3, 0)).toBeNull();
  });
});

describe('streakZScore', () => {
  it('strict alternation → strongly positive Z (more runs than random)', () => {
    const outcomes = Array.from({ length: 30 }, (_, i) => (i % 2 === 0 ? 'win' : 'loss') as const);
    expect(streakZScore(outcomes)!).toBeGreaterThan(1.96);
  });

  it('two big blocks → strongly negative Z (fewer runs than random)', () => {
    const outcomes = [
      ...Array.from({ length: 15 }, () => 'win' as const),
      ...Array.from({ length: 15 }, () => 'loss' as const),
    ];
    expect(streakZScore(outcomes)!).toBeLessThan(-1.96);
  });

  it('null on single-sided outcomes', () => {
    expect(streakZScore(['win', 'win'])).toBeNull();
  });
});
