'use client';

import Link from 'next/link';
import { useUiStore } from '@/lib/store';
import { ZenithMark } from './zenith-mark';

/**
 * Mobile-only top bar (< lg). Hosts the hamburger that drives the sidebar
 * drawer — on desktop the sidebar is permanently visible and this bar hides.
 */
export function MobileTopbar() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-edge-subtle bg-raised/70 px-4 py-3 backdrop-blur-xl lg:hidden">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Open navigation"
        className="-ml-1 flex h-9 w-9 items-center justify-center rounded-md text-ink-secondary transition-colors duration-fast hover:bg-hover hover:text-ink"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M2.5 4.5h13M2.5 9h13M2.5 13.5h13" />
        </svg>
      </button>

      <Link
        href="/dashboard"
        className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2"
      >
        <ZenithMark size={20} />
        <span className="font-display text-[13px] font-semibold tracking-[0.18em] text-ink">
          ZENITH
        </span>
      </Link>

      {/* Account avatar placeholder — keeps the logo optically centered. */}
      <span
        aria-hidden
        className="flex h-8 w-8 items-center justify-center rounded-full border border-edge bg-high text-[11px] font-semibold text-ink-muted"
      >
        Z
      </span>
    </header>
  );
}
