import { describe, expect, it } from 'vitest';
import { drawdown, equityCurve } from '../src/drawdown';

const DAY = 86_400_000;

describe('equityCurve', () => {
  it('accumulates from starting balance, sorted by time', () => {
    const curve = equityCurve(
      [
        { t: 2 * DAY, pnl: -50 },
        { t: 1 * DAY, pnl: 100 },
      ],
      1000,
    );
    expect(curve).toEqual([
      { t: 1 * DAY, equity: 1100 },
      { t: 2 * DAY, equity: 1050 },
    ]);
  });
});

describe('drawdown', () => {
  it('max peak-to-trough in $ and %', () => {
    const curve = [
      { t: 0, equity: 1000 },
      { t: 1 * DAY, equity: 1200 }, // peak
      { t: 2 * DAY, equity: 900 }, // trough: dd = 300 (25%)
      { t: 3 * DAY, equity: 1300 }, // recovery
    ];
    const dd = drawdown(curve);
    expect(dd.maxDrawdown).toBe(300);
    expect(dd.maxDrawdownPct).toBeCloseTo(0.25);
    expect(dd.currentDrawdown).toBe(0);
    expect(dd.longestDrawdownMs).toBe(2 * DAY);
  });

  it('reports current drawdown when still underwater', () => {
    const dd = drawdown([
      { t: 0, equity: 1000 },
      { t: DAY, equity: 800 },
    ]);
    expect(dd.currentDrawdown).toBe(200);
    expect(dd.longestDrawdownMs).toBe(DAY);
  });

  it('monotonic curve has zero drawdown', () => {
    const dd = drawdown([
      { t: 0, equity: 100 },
      { t: DAY, equity: 200 },
    ]);
    expect(dd.maxDrawdown).toBe(0);
    expect(dd.maxDrawdownPct).toBeNull();
  });
});
