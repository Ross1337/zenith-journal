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
        'rounded-lg border border-edge-subtle bg-raised shadow-inner-light',
        className,
      )}
    >
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
