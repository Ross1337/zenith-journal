'use client';
import { useEffect, useRef } from 'react';

export function CursorReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let targetX = -999, targetY = -999;
    let currentX = -999, currentY = -999;
    let raf = 0;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      currentX = lerp(currentX, targetX, 0.1);
      currentY = lerp(currentY, targetY, 0.1);
      el.style.setProperty('--mx', currentX + 'px');
      el.style.setProperty('--my', currentY + 'px');
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
    };

    el.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      el.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="cursor-reveal-root">
      <style>{`
        .cursor-reveal-root { position: relative; overflow: visible; }
        .cursor-reveal-vivid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          -webkit-mask-image: radial-gradient(circle 280px at var(--mx, -999px) var(--my, -999px), black 0%, transparent 70%);
          mask-image: radial-gradient(circle 280px at var(--mx, -999px) var(--my, -999px), black 0%, transparent 70%);
        }
      `}</style>
      {children}
    </div>
  );
}

export function CursorRevealVivid({ children }: { children: React.ReactNode }) {
  return <div className="cursor-reveal-vivid">{children}</div>;
}
