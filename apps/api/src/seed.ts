import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';
import { deriveTradeMetrics } from './trades/derive';

/**
 * Deterministic seed (mulberry32) — 2 accounts, 50 realistic trades over the
 * last 3 months for the dev user. Re-runnable: wipes & rebuilds that user.
 */

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL ?? ''),
});

const USER_ID = process.env.AUTH_DEV_USER ?? 'user_demo';

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
  { symbol: 'NQ', type: 'future', price: 18500, tick: 6, commission: 4.4 },
  { symbol: 'ES', type: 'future', price: 5300, tick: 1.5, commission: 4.2 },
  { symbol: 'EURUSD', type: 'forex', price: 1.085, tick: 0.0006, commission: 2.5 },
  { symbol: 'AAPL', type: 'stock', price: 212, tick: 0.35, commission: 1 },
  { symbol: 'TSLA', type: 'stock', price: 184, tick: 0.9, commission: 1 },
  { symbol: 'BTCUSD', type: 'crypto', price: 67000, tick: 140, commission: 6 },
] as const;

const SETUPS = ['ORB breakout', 'VWAP reversion', 'Trend pullback', 'Range fade', 'News momentum'];
const SESSIONS = ['london', 'newyork', 'newyork', 'newyork', 'asia', 'overlap'] as const;
const TIMEFRAMES = ['1m', '5m', '15m', '1h'] as const;
const MISTAKES = ['late_entry', 'early_exit', 'oversized', 'moved_stop', 'fomo'] as const;
const TAGS = ['A-setup', 'news-day', 'fomc', 'first-hour', 'reversal', 'continuation'];

async function main() {
  console.log(`Seeding for user ${USER_ID}…`);

  // Re-runnable: cascade wipes accounts → trades/executions.
  await prisma.user.deleteMany({ where: { id: USER_ID } });
  const user = await prisma.user.create({
    data: {
      id: USER_ID,
      email: 'demo@zenith.trade',
      displayName: 'Demo Trader',
      timezone: 'Europe/Paris',
    },
  });

  const apex = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Apex Eval 150K',
      broker: 'Apex Trader Funding',
      accountType: 'eval',
      currency: 'USD',
      initialBalance: 150_000,
      currentBalance: 150_000,
      color: '#E8B84B',
      propConfig: {
        profitTarget: 9_000,
        maxDailyLoss: 3_000,
        maxDrawdown: 5_000,
        drawdownType: 'trailing',
      },
    },
  });

  const ibkr = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'IBKR Live',
      broker: 'Interactive Brokers',
      accountType: 'live',
      currency: 'USD',
      initialBalance: 25_000,
      currentBalance: 25_000,
      color: '#5B8DEF',
    },
  });

  const strategies = await Promise.all(
    [
      {
        name: 'Opening Range Breakout',
        description: 'Break of the first 15-minute range with volume confirmation.',
        timeframe: '5m',
        rrTarget: 2,
        entryRules: ['Wait for OR to form (15m)', 'Enter on break + retest', 'Volume > 1.5× average'],
        exitRules: ['Stop below OR low', 'Target 2R or VWAP extension'],
      },
      {
        name: 'VWAP Mean Reversion',
        description: 'Fade extensions ≥ 2σ from VWAP in ranging conditions.',
        timeframe: '1m',
        rrTarget: 1.5,
        entryRules: ['Price ≥ 2σ band', 'No fresh news', 'Range day confirmed'],
        exitRules: ['Stop beyond 3σ', 'Target VWAP touch'],
      },
    ].map((s) => prisma.strategy.create({ data: { userId: user.id, ...s } })),
  );

  for (const name of TAGS) {
    await prisma.tag.create({ data: { userId: user.id, name } });
  }

  // ── 50 trades over the last ~3 months, weekdays only ──
  const rand = mulberry32(20260610);
  const end = new Date('2026-06-09T20:00:00Z').getTime();
  const dayMs = 86_400_000;
  const slots: number[] = [];
  for (let day = 92; day >= 0 && slots.length < 200; day--) {
    const date = end - day * dayMs;
    const weekday = new Date(date).getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    if (rand() < 0.35) continue; // no-trade days exist
    const count = 1 + Math.floor(rand() * 2);
    for (let i = 0; i < count; i++) slots.push(date);
  }
  const tradeDays = slots.slice(0, 50);

  let created = 0;
  for (const date of tradeDays) {
    const inst = SYMBOLS[Math.floor(rand() * SYMBOLS.length)]!;
    const account = rand() < 0.65 ? apex : ibkr;
    const direction = rand() < 0.56 ? 'long' : 'short';
    const isWin = rand() < 0.54; // slight positive edge
    const rMult = isWin ? 0.6 + rand() * 2.4 : -(0.4 + rand() * 1.1);

    const qty =
      inst.type === 'forex'
        ? 50_000
        : inst.type === 'crypto'
          ? +(0.2 + rand()).toFixed(2)
          : 1 + Math.floor(rand() * 4);
    const digits = inst.type === 'forex' ? 5 : 2;
    const entry = +(inst.price * (0.97 + rand() * 0.06)).toFixed(digits);
    const riskTicks = inst.tick * (4 + rand() * 10);
    const stop = +(direction === 'long' ? entry - riskTicks : entry + riskTicks).toFixed(digits);
    const target = +(direction === 'long'
      ? entry + riskTicks * (1.5 + rand() * 1.5)
      : entry - riskTicks * (1.5 + rand() * 1.5)
    ).toFixed(digits);
    const move = riskTicks * rMult * (direction === 'long' ? 1 : -1);
    const exit = +(entry + move).toFixed(digits);

    const openedAt = new Date(date + (7 + Math.floor(rand() * 6)) * 3_600_000);
    const holdSeconds = Math.floor(180 + rand() * 7200);
    const closedAt = new Date(openedAt.getTime() + holdSeconds * 1000);
    const commissionTotal = +(inst.commission * (inst.type === 'future' ? qty : 1)).toFixed(2);

    const shape = {
      direction: direction as 'long' | 'short',
      qty,
      avgEntry: entry,
      avgExit: exit,
      initialStop: stop,
      target,
      openedAt,
      closedAt,
      commissionTotal,
      feesTotal: 0,
      swapTotal: 0,
    };
    const derived = deriveTradeMetrics(shape);

    const mistakes =
      !isWin && rand() < 0.45 ? [MISTAKES[Math.floor(rand() * MISTAKES.length)]!] : [];
    const tags = rand() < 0.4 ? [TAGS[Math.floor(rand() * TAGS.length)]!] : [];

    await prisma.trade.create({
      data: {
        userId: user.id,
        accountId: account.id,
        symbol: inst.symbol,
        instrumentType: inst.type,
        ...shape,
        ...derived,
        strategyId: rand() < 0.7 ? strategies[Math.floor(rand() * strategies.length)]!.id : null,
        setup: SETUPS[Math.floor(rand() * SETUPS.length)]!,
        marketCondition: (['trend', 'range', 'volatile', 'quiet'] as const)[
          Math.floor(rand() * 4)
        ]!,
        session: SESSIONS[Math.floor(rand() * SESSIONS.length)]!,
        timeframe: TIMEFRAMES[Math.floor(rand() * TIMEFRAMES.length)]!,
        followedPlan: rand() < 0.78,
        mistakes,
        emotionPre: 1 + Math.floor(rand() * 5),
        emotionDuring: rand() < 0.5 ? 1 + Math.floor(rand() * 5) : null,
        emotionPost: 1 + Math.floor(rand() * 5),
        grade: isWin ? (rand() < 0.4 ? 'A+' : 'A') : rand() < 0.5 ? 'B' : 'C',
        reviewed: rand() < 0.6,
        tags,
        notes:
          rand() < 0.3
            ? 'Entry was clean off the level. Need to size up when all criteria align.'
            : null,
      },
    });
    created++;
  }

  // Sync balances with seeded P&L.
  for (const account of [apex, ibkr]) {
    const agg = await prisma.trade.aggregate({
      where: { accountId: account.id, status: 'closed' },
      _sum: { netPnl: true },
    });
    await prisma.account.update({
      where: { id: account.id },
      data: { currentBalance: account.initialBalance + (agg._sum.netPnl ?? 0) },
    });
  }

  // A few journal entries so /journal isn't empty.
  await prisma.journalEntry.createMany({
    data: [
      {
        userId: user.id,
        type: 'daily_plan',
        title: 'Plan — CPI day',
        content:
          '## Bias\nChoppy until 14:30 CPI. **No trades before the number.**\n\n## Levels\n- NQ: 18 540 resistance / 18 410 support\n- Watch VWAP reclaim after the spike\n\n## Risk\nMax 2 trades, half size.',
        mood: 4,
        tradingDay: '2026-06-08',
        tags: ['news-day'],
      },
      {
        userId: user.id,
        type: 'daily_recap',
        title: 'Recap — followed the plan',
        content:
          'Waited out the CPI spike, took the VWAP reclaim for **+2.1R**. One trade, done by 15:10.\n\nLesson: patience around news pays. The A+ setup came exactly where planned.',
        mood: 5,
        tradingDay: '2026-06-08',
        tags: ['A-setup'],
      },
      {
        userId: user.id,
        type: 'lesson',
        title: 'Stop moving stops',
        content:
          'Three of my last five losers were widened stops. The original stop is the trade thesis — if it hits, the thesis is wrong. Moving it only converts a 1R loss into a 2R loss.',
        mood: 3,
        tradingDay: '2026-05-28',
      },
    ],
  });

  console.log(`Seeded: 1 user, 2 accounts, 2 strategies, ${created} trades, 3 journal entries.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
