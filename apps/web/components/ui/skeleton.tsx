import clsx from 'clsx';

/** Loading placeholder — matches card surfaces, breathes slowly. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded-md bg-high', className)} />;
}
