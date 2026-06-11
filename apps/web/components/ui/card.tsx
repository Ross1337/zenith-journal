import clsx from 'clsx';

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={clsx(
        'relative overflow-hidden rounded-lg border border-edge-subtle bg-raised shadow-inner-light',
        className,
      )}
    >
      {/* Top accent hairline — transparent → primary → transparent. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--primary-glow), transparent)',
        }}
      />
      {/* Inner shine — a faint diagonal wash that catches the eye. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'var(--card-shine)' }}
      />
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex items-baseline justify-between px-5 pb-1 pt-4">
      <div className="flex items-baseline gap-2.5">
        <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-secondary">
          {title}
        </h2>
        {hint && <span className="text-[12px] text-ink-faint">{hint}</span>}
      </div>
      {children}
    </header>
  );
}
