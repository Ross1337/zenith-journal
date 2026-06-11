'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const TABS = [
  { href: '/settings', label: 'Profile' },
  { href: '/settings/integrations', label: 'Integrations' },
] as const;

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <nav className=mb-6 flex gap-1 border-b border-edge pb-0>
        {TABS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'relative px-4 pb-3 pt-1 text-[13px] font-medium transition-colors duration-fast',
                active ? 'text-ink' : 'text-ink-muted hover:text-ink-secondary',
              )}
            >
              {label}
              {active && (
                <span className=absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gold />
              )}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
