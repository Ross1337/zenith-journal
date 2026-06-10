import clsx from 'clsx';
import { fmtPnl, pnlTone } from '@/lib/format';

const toneClass = {
  profit: 'text-profit',
  loss: 'text-loss',
  breakeven: 'text-breakeven',
} as const;

export function PnlValue({ value, className }: { value: number; className?: string }) {
  return (
    <span className={clsx('z-numeric', toneClass[pnlTone(value)], className)}>{fmtPnl(value)}</span>
  );
}
