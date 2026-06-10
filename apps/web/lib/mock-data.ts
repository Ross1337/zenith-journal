import type { Trade } from '@zenith/types';
import { grossPnl, netPnl, pnlPct, rRealized } from '@zenith/calc';

/**
 * Deterministic mock dataset (seeded PRNG) — stands in for the API while
 * apps/api grows persistence. Same trades on every render: stable for
 * SSR/hydration and for eyeballing design changes.
 */

// Mulberry32 — tiny seeded PRNG, deterministic across platforms.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SYMBOLS = [
  { symbol: 'NQ', type: 'future', price: 18500, tick: 5 },
  { symbol: 'ES', type: 'future', price: 5300, tick: 1 },
  { symbol: 'EURUSD', type: 'forex', price: 1.085, tick: 0.0005 },
  { symbol: 'AAPL', type: 'stock', price: 212, tick: 0.3 },
  { symbol: 'TSLA', type: 'stock', price: 184, tick: 0.8 },
  { symbol: 'BTCUSD', type: 'crypto', price: 67000, tick: 120 },
] as const;

const SETUPS = ['ORB breakout', 'VWAP reversion', 'Trend pullback', 'Range fade', 'News momentum'];
const SESSIONS = ['london', 'newyork', 'newyork', 'newyork', 'asia', 'overlap'] as const;
const MISTAKES = ['late_entry', 'early_exit', 'oversized', 'moved_stop', 'fomo'] as const;

export const MOCK_ACCOUNT = {
  id: 'acc_demo',
  name: 'Apex Eval 150K',
  currency: 'USD',
  initialBalance: 150_000,
};

function buildTrades(): Trade[] {
  const rand = mulberry32(20260610);
  const trades: Trade[] = [];
  // ~90 trades over the last 60 trading days, anchored to a fixed date.
  const end = new Date('2026-06-09T20:00:00Z').getTime();
  const dayMs = 86_400_000;

  let id = 0;
  for (let day = 60; day >= 0; day--) {
    const date = end - day * dayMs;
    const weekday = new Date(date).getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    const count = rand() < 0.25 ? 0 : 1 + Math.floor(rand() * 3);

    for (let i = 0; i < count; i++) {
      const inst = SYMBOLS[Math.floor(rand() * SYMBOLS.length)]!;
      const direction = rand() < 0.56 ? 'long' : 'short';
      // Slight positive edge: 52% winners, winners run a bit further.
      const isWin = rand() < 0.52;
      const rMult = isWin ? 0.6 + rand() * 2.6 : -(0.4 + rand() * 1.1);

      const qty =
        inst.type === 'forex' ? 50_000 : inst.type === 'crypto' ? +(0.2 + rand()).toFixed(2) : 1 + Math.floor(rand() * 4);
      const entry = +(inst.price * (0.97 + rand() * 0.06)).toFixed(inst.type === 'forex' ? 5 : 2);
      const riskTicks = inst.tick * (4 + rand() * 10);
      const stop = +(direction === 'long' ? entry - riskTicks : entry + riskTicks).toFixed(
        inst.type === 'forex' ? 5 : 2,
      );
      const move = riskTicks * rMult * (direction === 'long' ? 1 : -1);
      const exit = +(entry + move).toFixed(inst.type === 'forex' ? 5 : 2);

      const openedAt = new Date(date + Math.floor(rand() * 6) * 3_600_000);
      const holdSeconds = Math.floor(120 + rand() * 9000);
      const closedAt = new Date(openedAt.getTime() + holdSeconds * 1000);

      const commission = inst.type === 'future' ? 4.4 * qty : inst.type === 'stock' ? 1 : 2.5;
      const base = { direction, qty, avgEntry: entry, avgExit: exit, commission } as const;
      const gross = grossPnl(base);
      const net = netPnl(base);

      trades.push({
        id: `trade_${String(++id).padStart(4, '0')}`,
        accountId: MOCK_ACCOUNT.id,
        userId: 'user_demo',
        symbol: inst.symbol,
        instrumentType: inst.type,
        direction,
        status: 'closed',
        openedAt,
        closedAt,
        qty,
        avgEntry: entry,
        avgExit: exit,
        initialStop: stop,
        target: null,
        grossPnl: +gross.toFixed(2),
        netPnl: +net.toFixed(2),
        commissionTotal: commission,
        feesTotal: 0,
        swapTotal: 0,
        pnlPct: +pnlPct(base).toFixed(3),
        rRealized: rRealized(net, { avgEntry: entry, initialStop: stop, qty }),
        rPlanned: null,
        mae: null,
        mfe: null,
        holdSeconds,
        strategyId: null,
        setup: SETUPS[Math.floor(rand() * SETUPS.length)]!,
        marketCondition: null,
        session: SESSIONS[Math.floor(rand() * SESSIONS.length)]!,
        timeframe: ['1m', '5m', '15m', '1h'][Math.floor(rand() * 4)]!,
        followedPlan: rand() < 0.78,
        mistakes: !isWin && rand() < 0.4 ? [MISTAKES[Math.floor(rand() * MISTAKES.length)]!] : [],
        emotionPre: (1 + Math.floor(rand() * 5)) as Trade['emotionPre'],
        emotionDuring: null,
        emotionPost: null,
        grade: isWin && rand() < 0.5 ? (rand() < 0.4 ? 'A+' : 'A') : rand() < 0.5 ? 'B' : 'C',
        reviewed: rand() < 0.6,
        tags: [],
        notes: null,
        createdAt: closedAt,
        updatedAt: closedAt,
      });
    }
  }

  // Newest first — matches the trade log default sort.
  return trades.sort((a, b) => b.openedAt.getTime() - a.openedAt.getTime());
}

let cache: Trade[] | null = null;

export function getMockTrades(): Trade[] {
  cache ??= buildTrades();
  return cache;
}
