'use client';

import { useEffect } from 'react';

/**
 * Reveal-on-scroll for `.reveal` / `.why-line` elements. Runs in a real
 * client effect (the previous inline `dangerouslySetInnerHTML` script never
 * executed under the App Router, leaving every section stuck at opacity 0).
 * Falls back to revealing everything when IntersectionObserver is unavailable.
 */
export function ScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal, .why-line'));
    if (els.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return null;
}
