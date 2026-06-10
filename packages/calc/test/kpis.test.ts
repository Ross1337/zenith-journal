import { describe, expect, it } from 'vitest';
import {
  avgLoss,
  avgWin,
  expectancy,
  expectancyR,
  kelly,
  profitFactor,
  winRate,
} from '../src/kpis';

const sample = [100, -50, 200, -50, 0, 300]; // 3 wins, 2 losses, 1 BE

describe('winRate', () => {
  it('excludes breakeven', () => {
    expect(winRate(sample)).toBeCloseTo(3 / 5);
  });

  it('null on empty / all-breakeven', () => {
    expect(winRate([])).toBeNull();
    expect(winRate([0, 0])).toBeNull();
  });
});

describe('profitFactor', () => {
  it('gross gains / |gross losses|', () => {
    expect(profitFactor(sample)).toBeCloseTo(600 / 100);
  });

  it('Infinity with gains and no losses', () => {
    expect(profitFactor([10, 20])).toBe(Infinity);
  });

  it('null with no decided trades', () => {
    expect(profitFactor([0])).toBeNull();
  });
});

describe('avgWin / avgLoss', () => {
  it('averages each side', () => {
    expect(avgWin(sample)).toBeCloseTo(200);
    expect(avgLoss(sample)).toBeCloseTo(-50);
  });
});

describe('expectancy', () => {
  it('WR × AvgWin − LR × |AvgLoss|', () => {
    // 0.6 × 200 − 0.4 × 50 = 100
    expect(expectancy(sample)).toBeCloseTo(100);
  });
});

describe('expectancyR', () => {
  it('mean of R-multiples, skipping nulls', () => {
    expect(expectancyR([2, -1, null, 1])).toBeCloseTo(2 / 3);
  });

  it('null when nothing usable', () => {
    expect(expectancyR([null])).toBeNull();
  });
});

describe('kelly', () => {
  it('WR − (1 − WR) / payoff', () => {
    // WR 0.6, payoff 200/50 = 4 → 0.6 − 0.4/4 = 0.5
    expect(kelly(sample)).toBeCloseTo(0.5);
  });

  it('null with single-sided history', () => {
    expect(kelly([10, 20])).toBeNull();
  });
});
