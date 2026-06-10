'use client';

import { forwardRef } from 'react';
import clsx from 'clsx';

/** Form primitives — one visual language for every input in ZENITH. */

export function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={clsx('block', className)}>
      <span className="mb-1.5 flex items-baseline justify-between text-[11.5px] font-medium uppercase tracking-[0.1em] text-ink-muted">
        {label}
        {hint && <span className="normal-case tracking-normal text-ink-faint">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-[12px] text-loss">{error}</span>}
    </label>
  );
}

const inputClass =
  'h-9 w-full rounded-md border border-edge bg-high px-3 text-[13.5px] text-ink placeholder:text-ink-faint transition-colors duration-fast focus:border-edge-strong focus:outline-none focus:ring-1 focus:ring-gold/40';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={clsx(inputClass, className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={clsx(inputClass, 'pr-8', className)} {...props}>
        {children}
      </select>
    );
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={clsx(inputClass, 'h-auto min-h-[96px] py-2 leading-relaxed', className)}
      {...props}
    />
  );
});

/** Pill-style multi/single select used for mistakes, sessions, grades. */
export function Chip({
  active,
  onClick,
  tone = 'gold',
  children,
}: {
  active: boolean;
  onClick: () => void;
  tone?: 'gold' | 'loss';
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'rounded-md border px-2.5 py-1 text-[12px] font-medium transition-colors duration-fast',
        active
          ? tone === 'gold'
            ? 'border-gold/50 bg-gold-wash text-gold'
            : 'border-loss/50 bg-loss-wash text-loss'
          : 'border-edge bg-high text-ink-muted hover:border-edge-strong hover:text-ink-secondary',
      )}
    >
      {children}
    </button>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string; tone?: 'profit' | 'loss' }>;
}) {
  return (
    <div className="flex h-9 items-center gap-0.5 rounded-md border border-edge bg-high p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={clsx(
            'flex-1 rounded-[5px] px-2.5 py-1.5 text-[12.5px] font-medium transition-colors duration-fast',
            value === o.value
              ? o.tone === 'profit'
                ? 'bg-profit-wash text-profit shadow-inner-light'
                : o.tone === 'loss'
                  ? 'bg-loss-wash text-loss shadow-inner-light'
                  : 'bg-overlay text-ink shadow-inner-light'
              : 'text-ink-muted hover:text-ink-secondary',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
