import clsx from 'clsx';

/**
 * Dashboard KPI tile. The value is always mono/tabular; an optional spark
 * line of context sits under it (e.g. "52 wins · 41 losses").
 */
export function StatCard({
  label,
  value,
  sub,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: 'neutral' | 'profit' | 'loss' | 'breakeven' | 'gold';
}) {
  return (
    <div className="rounded-lg border border-edge-subtle bg-raised px-5 py-4 shadow-inner-light">
      <p className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
        {label}
      </p>
      <p
        className={clsx(
          'z-numeric mt-2 text-[26px] font-semibold leading-none',
          tone === 'profit' && 'text-profit',
          tone === 'loss' && 'text-loss',
          tone === 'breakeven' && 'text-breakeven',
          tone === 'gold' && 'text-gold',
          tone === 'neutral' && 'text-ink',
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-2 text-[12px] text-ink-muted">{sub}</p>}
    </div>
  );
}
