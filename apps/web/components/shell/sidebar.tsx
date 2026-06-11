'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useUiStore } from '@/lib/store';
import { ZenithMark } from './zenith-mark';
import {
  AccountsIcon,
  AnalyticsIcon,
  CalendarIcon,
  DashboardIcon,
  JournalIcon,
  PlusIcon,
  SettingsIcon,
  TradesIcon,
} from './nav-icons';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { href: '/trades', label: 'Trades', icon: TradesIcon },
  { href: '/journal', label: 'Journal', icon: JournalIcon },
  { href: '/analytics', label: 'Analytics', icon: AnalyticsIcon },
  { href: '/calendar', label: 'Calendar', icon: CalendarIcon },
  { href: '/accounts', label: 'Accounts', icon: AccountsIcon },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const openTradeModal = useUiStore((s) => s.openTradeModal);

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[232px] flex-col border-r border-edge-subtle bg-raised">
      {/* Brand */}
      <Link href="/dashboard" className="flex items-center gap-2.5 px-5 pb-5 pt-6">
        <ZenithMark size={26} />
        <span className="font-display text-[15px] font-semibold tracking-[0.18em] text-ink">
          ZENITH
        </span>
      </Link>
      <div className="z-horizon mx-5" />

      {/* Quick add — the single most frequent action lives at the top. */}
      <div className="px-3 pt-5">
        <button
          type="button"
          onClick={openTradeModal}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-gold px-3 py-2 text-[13px] font-semibold text-ink-on-accent transition-colors duration-fast hover:bg-gold-hover active:bg-gold-active"
        >
          <PlusIcon />
          Log trade
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-5 flex flex-1 flex-col gap-0.5 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13.5px] transition-colors duration-fast',
                active
                  ? 'bg-gold-wash font-medium text-ink'
                  : 'text-ink-secondary hover:bg-hover hover:text-ink',
              )}
            >
              {/* Active marker — a luminous notch on the left edge. */}
              <span
                className={clsx(
                  'absolute -left-3 h-4 w-0.5 rounded-full bg-gold transition-opacity duration-base',
                  active ? 'opacity-100' : 'opacity-0',
                )}
              />
              <Icon className={clsx(active ? 'text-gold' : 'text-current')} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5">
        <div className="z-horizon mx-2 mb-4" />
        <Link
          href="/settings"
          className={clsx(
            'flex items-center gap-3 rounded-md px-3 py-2 text-[13.5px] transition-colors duration-fast',
            pathname.startsWith('/settings')
              ? 'bg-gold-wash font-medium text-ink'
              : 'text-ink-secondary hover:bg-hover hover:text-ink',
          )}
        >
          <SettingsIcon />
          Settings
        </Link>
        <p className="mt-2 px-3 text-[11px] leading-relaxed text-ink-faint">
          See your edge clearly.
        </p>
      </div>
    </aside>
  );
}
