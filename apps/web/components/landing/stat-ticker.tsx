'use client';
import { useEffect, useRef, useState } from 'react';

const STATS = [
  { value: 30, suffix: 's', prefix: '< ', label: 'pour enregistrer un trade' },
  { value: 30, suffix: '+', prefix: '', label: 'métriques calculées en direct' },
  { value: 1, suffix: ' glisser', prefix: '', label: 'pour importer vos CSV broker' },
  { value: 0, suffix: '∞', prefix: '', label: 'comptes, un seul journal', isInfinity: true },
];

function AnimatedNumber({ target, suffix, prefix, isInfinity }: { target: number; suffix: string; prefix: string; isInfinity?: boolean }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || isInfinity) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1200;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, isInfinity]);

  if (isInfinity) {
    return <span ref={ref}>{suffix}</span>;
  }

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

export function StatTicker() {
  return (
    <section className="border-y border-edge-subtle bg-raised/50">
      <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-6 px-6 py-10 text-center sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label}>
            <p className="z-numeric font-display text-[32px] font-semibold text-gold">
              <AnimatedNumber target={s.value} suffix={s.suffix} prefix={s.prefix} isInfinity={s.isInfinity} />
            </p>
            <p className="mt-1 text-[12.5px] text-ink-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
