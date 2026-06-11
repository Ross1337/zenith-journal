'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ZenithMark } from '@/components/shell/zenith-mark';
import { useI18n } from '@/lib/i18n-context';

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
const CTA_HREF = clerkEnabled ? '/sign-up' : '/dashboard';

const LINKS = [
  { href: '/#features', key: 'features', hover: 'hover:text-ink' },
  { href: '/pricing', key: 'pricing', hover: 'hover:text-gold' },
  { href: '/mt5', key: 'ea', hover: 'hover:text-teal' },
] as const;

const LABELS = {
  fr: { features: 'Fonctionnalités', pricing: 'Tarifs', ea: 'EA', signin: 'Connexion', cta: 'Commencer' },
  en: { features: 'Features', pricing: 'Pricing', ea: 'EA', signin: 'Sign in', cta: 'Get started' },
} as const;

/** Shared glassmorphism nav for the marketing surface (pricing, EA). */
export function SiteNav() {
  const { lang, toggle } = useI18n();
  const pathname = usePathname();
  const l = LABELS[lang];

  return (
    <header className="sticky top-0 z-40 border-b border-edge-subtle bg-void/70 backdrop-blur-xl">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-aurora opacity-40" />
      <div className="mx-auto flex h-14 max-w-[1100px] items-center gap-8 px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <ZenithMark size={24} />
          <span className="font-display text-[14px] font-semibold tracking-[0.18em] text-ink">ZENITH</span>
        </Link>
        <nav className="hidden items-center gap-6 text-[13px] text-ink-secondary sm:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors duration-fast ${link.hover} ${active ? 'text-ink' : ''}`}
              >
                {l[link.key]}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={toggle}
            className="rounded-md border border-edge px-2.5 py-1 text-[11.5px] font-semibold uppercase tracking-wider text-ink-secondary transition-colors hover:border-gold/40 hover:text-gold"
            aria-label="Toggle language"
          >
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
          <Link
            href={clerkEnabled ? '/sign-in' : '/dashboard'}
            className="hidden rounded-md px-3 py-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink sm:block"
          >
            {l.signin}
          </Link>
          <Link
            href={CTA_HREF}
            className="rounded-md bg-gold px-3.5 py-1.5 text-[13px] font-semibold text-ink-on-accent shadow-[0_0_20px_rgba(242,181,68,0.25)] transition-all hover:bg-gold-hover hover:shadow-[0_0_28px_rgba(242,181,68,0.4)]"
          >
            {l.cta}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { lang } = useI18n();
  return (
    <footer className="border-t border-edge-subtle">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <ZenithMark size={18} />
          <span className="text-[12.5px] text-ink-muted">ZENITH — See your edge clearly.</span>
        </div>
        <nav className="flex items-center gap-5 text-[12.5px] text-ink-muted">
          <Link href="/pricing" className="hover:text-ink-secondary">
            {LABELS[lang].pricing}
          </Link>
          <Link href="/mt5" className="hover:text-ink-secondary">
            EA
          </Link>
          <Link href={clerkEnabled ? '/sign-in' : '/dashboard'} className="hover:text-ink-secondary">
            {LABELS[lang].signin}
          </Link>
        </nav>
        <p className="z-numeric text-[11.5px] text-ink-faint">© 2026 ZENITH</p>
      </div>
    </footer>
  );
}
