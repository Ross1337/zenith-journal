import { describe, expect, it } from 'vitest';
import { grossPnl, netPnl, pnlPct, rPlanned, rRealized } from '../src/pnl';

describe('grossPnl', () => {
  it('long: (exit − entry) × qty', () => {
    expect(grossPnl({ direction: 'long', qty: 100, avgEntry: 10, avgExit: 12 })).toBe(200);
  });

  it('short: (entry − exit) × qty', () => {
    expect(grossPnl({ direction: 'short', qty: 100, avgEntry: 12, avgExit: 10 })).toBe(200);
  });

  it('losing short', () => {
    expect(grossPnl({ direction: 'short', qty: 50, avgEntry: 10, avgExit: 11 })).toBe(-50);
  });
});

describe('netPnl', () => {
  it('subtracts commissions & fees, adds swap', () => {
    expect(
      netPnl({
        direction: 'long',
        qty: 100,
        avgEntry: 10,
        avgExit: 12,
        commission: 5,
        fees: 2,
        swap: -3,
      }),
    ).toBe(190);
  });
});

describe('rRealized', () => {
  it('computes R from entry/stop distance', () => {
    // risk = |100 − 95| × 10 = 50 ; pnl 100 → 2R
    expect(rRealized(100, { avgEntry: 100, initialStop: 95, qty: 10 })).toBe(2);
  });

  it('negative R on a loss', () => {
    expect(rRealized(-25, { avgEntry: 100, initialStop: 95, qty: 10 })).toBe(-0.5);
  });

  it('falls back to explicit risk amount', () => {
    expect(rRealized(150, { riskAmount: 100 })).toBe(1.5);
  });

  it('null without stop', () => {
    expect(rRealized(100, { avgEntry: 100, initialStop: null, qty: 10 })).toBeNull();
  });
});

describe('rPlanned', () => {
  it('|target − entry| / |entry − stop|', () => {
    expect(rPlanned(100, 95, 110)).toBe(2);
  });

  it('works for shorts (stop above entry)', () => {
    expect(rPlanned(100, 105, 90)).toBe(2);
  });

  it('null when stop equals entry', () => {
    expect(rPlanned(100, 100, 110)).toBeNull();
  });
});

describe('pnlPct', () => {
  it('percent of entry notional', () => {
    expect(pnlPct({ direction: 'long', qty: 100, avgEntry: 10, avgExit: 11 })).toBe(10);
  });
});
