import type { Trade } from '@zenith/types';
import { sum, winRate } from '@zenith/calc';

/** Client-side breakdowns over closed trades — the /analytics page's math. */

export interface BreakdownRow {
  key: string;
  label: string;
  netPnl: number;
  count: number;
  winRate: number | null;
}

function breakdown(trades: Trade[], keyOf: (t: Trade) => string | null): BreakdownRow[] {
  const groups = new Map<string, number[]>();
  for (const t of trades) {
    const key = keyOf(t);
    if (key === null) continue;
    const arr = groups.get(key);
    const pnl = t.netPnl ?? 0;
    if (arr) arr.push(pnl);
    else groups.set(key, [pnl]);
  }
  return [...groups.entries()].map(([key, pnls]) => ({
    key,
    label: key,
    netPnl: sum(pnls),
    count: pnls.length,
    winRate: winRate(pnls),
  }));
}

export function bySetup(trades: Trade[]): BreakdownRow[] {
  return breakdown(trades, (t) => t.setup ?? 'No setup').sort((a, b) => b.netPnl - a.netPnl);
}

export function bySymbol(trades: Trade[]): BreakdownRow[] {
  return breakdown(trades, (t) => t.symbol).sort((a, b) => b.netPnl - a.netPnl);
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function byWeekday(trades: Trade[]): BreakdownRow[] {
  const rows = breakdown(trades, (t) => String((t.closedAt ?? t.openedAt).getDay()));
  return rows
    .map((r) => ({ ...r, label: WEEKDAYS[Number(r.key)] ?? r.key }))
    .sort((a, b) => Number(a.key) - Number(b.key));
}

/** Local hour of the open — when does this trader actually make money? */
export function byHour(trades: Trade[]): BreakdownRow[] {
  const rows = breakdown(trades, (t) => String(t.openedAt.getHours()).padStart(2, '0'));
  return rows.map((r) => ({ ...r, label: `${r.key}h` })).sort((a, b) => a.key.localeCompare(b.key));
}

export interface RBucket {
  label: string;
  from: number;
  count: number;
}

/** Histogram of realized R multiples in 0.5R buckets, clamped to ±4R. */
export function rDistribution(trades: Trade[]): RBucket[] {
  const buckets = new Map<number, number>();
  for (const t of trades) {
    if (t.rRealized === null) continue;
    const clamped = Math.max(-4, Math.min(4, t.rRealized));
    const b = Math.floor(clamped / 0.5) * 0.5;
    buckets.set(b, (buckets.get(b) ?? 0) + 1);
  }
  const out: RBucket[] = [];
  for (let from = -4; from < 4; from += 0.5) {
    const key = Math.round(from * 2) / 2;
    out.push({ label: `${key >= 0 ? '+' : ''}${key.toFixed(1)}`, from: key, count: buckets.get(key) ?? 0 });
  }
  return out;
}

export interface HeatDay {
  /** YYYY-MM-DD */
  date: string;
  netPnl: number;
  count: number;
}

export interface HeatWeek {
  days: Array<HeatDay | null>;
}

/** Last `weeks` calendar weeks (Mon–Fri), newest last — data for the P&L heatmap. */
export function heatmapWeeks(trades: Trade[], weeks = 16): HeatWeek[] {
  const byDay = new Map<string, HeatDay>();
  for (const t of trades) {
    const d = t.closedAt ?? t.openedAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const cur = byDay.get(key) ?? { date: key, netPnl: 0, count: 0 };
    cur.netPnl += t.netPnl ?? 0;
    cur.count += 1;
    byDay.set(key, cur);
  }

  const today = new Date();
  // Walk back to the most recent Monday.
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const out: HeatWeek[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const days: Array<HeatDay | null> = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() - w * 7 + i);
      if (d > today) {
        days.push(null);
        continue;
      }
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push(byDay.get(key) ?? { date: key, netPnl: 0, count: 0 });
    }
    out.push({ days });
  }
  return out;
}
