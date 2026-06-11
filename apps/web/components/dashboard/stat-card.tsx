import clsx from 'clsx';

/** Per-tone accent color used for the top bar and the hover glow. */
const TONE_COLOR = {
  neutral: 'rgba(120, 140, 170, 0.55)',
  profit: 'rgba(74, 222, 128, 0.7)',
  loss: 'rgba(248, 113, 113, 0.7)',
  breakeven: 'rgba(148, 163, 184, 0.6)',
  gold: 'rgba(242, 181, 68, 0.7)',
  ion: 'rgba(56, 189, 248, 0.7)',
  violet: 'rgba(167, 139, 250, 0.7)',
  teal: 'rgba(45, 212, 191, 0.7)',
} as const;

const TONE_GLOW = {
  neutral: 'hover:shadow-[0_0_24px_rgba(120,140,170,0.10)]',
  profit: 'hover:shadow-[0_0_24px_rgba(74,222,128,0.16)]',
  loss: 'hover:shadow-[0_0_24px_rgba(248,113,113,0.16)]',
  breakeven: 'hover:shadow-[0_0_24px_rgba(148,163,184,0.12)]',
  gold: 'hover:shadow-[0_0_24px_rgba(242,181,68,0.18)]',
  ion: 'hover:shadow-[0_0_24px_rgba(56,189,248,0.18)]',
  violet: 'hover:shadow-[0_0_24px_rgba(167,139,250,0.18)]',
  teal: 'hover:shadow-[0_0_24px_rgba(45,212,191,0.18)]',
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
