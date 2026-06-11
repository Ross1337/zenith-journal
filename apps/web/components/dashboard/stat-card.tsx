import clsx from 'clsx';

/** Per-tone accent color used for the top bar and the hover glow.
    Brand tones (gold/ion/violet/teal) follow the active theme. */
const TONE_COLOR = {
  neutral: 'rgba(120, 140, 170, 0.55)',
  profit: 'var(--z-profit)',
  loss: 'var(--z-loss)',
  breakeven: 'var(--z-breakeven)',
  gold: 'var(--primary)',
  ion: 'var(--accent)',
  violet: 'var(--z-violet)',
  teal: 'var(--z-teal)',
} as const;

const TONE_GLOW = {
  neutral: 'hover:shadow-[0_0_24px_rgba(120,140,170,0.10)]',
  profit: 'hover:shadow-[0_0_24px_var(--z-profit-wash)]',
  loss: 'hover:shadow-[0_0_24px_var(--z-loss-wash)]',
  breakeven: 'hover:shadow-[0_0_24px_rgba(148,163,184,0.12)]',
  gold: 'hover:shadow-[0_0_24px_var(--z-gold-glow)]',
  ion: 'hover:shadow-[0_0_24px_var(--z-ion-wash)]',
  violet: 'hover:shadow-[0_0_24px_var(--z-violet-wash)]',
  teal: 'hover:shadow-[0_0_24px_var(--z-teal-wash)]',
} as const;

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
  tone?: 'neutral' | 'profit' | 'loss' | 'breakeven' | 'gold' | 'ion' | 'violet' | 'teal';
}) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-lg border border-edge-subtle bg-raised px-5 py-4 shadow-inner-light transition-shadow duration-base',
        TONE_GLOW[tone],
      )}
    >
      {/* Tone-colored top bar — a 2px gradient signal strip. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${TONE_COLOR[tone]}, transparent)`,
        }}
      />
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
          tone === 'ion' && 'text-ion',
          tone === 'violet' && 'text-violet',
          tone === 'teal' && 'text-teal',
          tone === 'neutral' && 'text-ink',
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-2 text-[12px] text-ink-muted">{sub}</p>}
    </div>
  );
}
