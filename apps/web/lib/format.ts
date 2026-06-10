/** Display formatting — every number in ZENITH goes through here. */

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const usdCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/** Signed currency: +$1,240.50 / −$320.00 (true minus sign). */
export function fmtPnl(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return sign + usd.format(Math.abs(value));
}

export function fmtCurrency(value: number, compact = false): string {
  return compact ? usdCompact.format(value) : usd.format(value);
}

export function fmtPct(fraction: number | null, digits = 1): string {
  if (fraction === null || !Number.isFinite(fraction)) return '—';
  return `${(fraction * 100).toFixed(digits)}%`;
}

export function fmtR(r: number | null): string {
  if (r === null || !Number.isFinite(r)) return '—';
  const sign = r > 0 ? '+' : r < 0 ? '−' : '';
  return `${sign}${Math.abs(r).toFixed(2)}R`;
}

export function fmtRatio(v: number | null, digits = 2): string {
  if (v === null) return '—';
  if (!Number.isFinite(v)) return '∞';
  return v.toFixed(digits);
}

export function fmtHold(seconds: number | null): string {
  if (seconds === null) return '—';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`;
  return `${(seconds / 86400).toFixed(1)}d`;
}

export function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function fmtDateTime(d: Date): string {
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export type Tone = 'profit' | 'loss' | 'breakeven';

export function pnlTone(value: number): Tone {
  return value > 0 ? 'profit' : value < 0 ? 'loss' : 'breakeven';
}
