'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n-context';

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
const CTA_HREF = clerkEnabled ? '/sign-up' : '/dashboard';

type Cycle = 'monthly' | 'annual';

const COPY = {
  fr: {
    eyebrow: 'Tarifs',
    title: 'Un prix clair pour chaque trader',
    subtitle: 'Sans engagement. Annulable à tout moment. Données exportables.',
    monthly: 'Mensuel',
    annual: 'Annuel',
    save: '−20 %',
    perMonth: '/ mois',
    billedAnnually: 'facturé annuellement',
    popular: 'Populaire',
    start: 'Commencer',
    contact: 'Contacter',
    compare: 'Comparatif détaillé',
    note: 'Tous les prix sont en euros, TVA incluse. L’EA Zenith est gratuite sur tous les plans.',
  },
  en: {
    eyebrow: 'Pricing',
    title: 'Clear pricing for every trader',
    subtitle: 'No commitment. Cancel anytime. Your data is always exportable.',
    monthly: 'Monthly',
    annual: 'Annual',
    save: '−20%',
    perMonth: '/ mo',
    billedAnnually: 'billed annually',
    popular: 'Popular',
    start: 'Get started',
    contact: 'Contact us',
    compare: 'Full comparison',
    note: 'All prices in euros, VAT included. The Zenith EA is free on every plan.',
  },
} as const;

type Plan = {
  id: string;
  name: string;
  monthly: number;
  tagline: { fr: string; en: string };
  accent: string; // tailwind text/border color suffix
  highlight?: boolean;
  cta: 'start' | 'contact';
  features: { fr: string; en: string }[];
};

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthly: 8.99,
    accent: 'ion',
    cta: 'start',
    tagline: { fr: 'Pour démarrer son journal sérieusement.', en: 'To start journaling seriously.' },
    features: [
      { fr: 'Import CSV manuel', en: 'Manual CSV import' },
      { fr: 'Dashboard basique', en: 'Basic dashboard' },
      { fr: 'Journal de trading', en: 'Trading journal' },
      { fr: 'EA gratuite (installation manuelle sur VPS)', en: 'Free EA (manual install on your VPS)' },
      { fr: 'Support email sous 48 h', en: 'Email support within 48h' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 14.99,
    accent: 'gold',
    highlight: true,
    cta: 'start',
    tagline: { fr: 'Le choix des traders réguliers.', en: 'The choice of serious, active traders.' },
    features: [
      { fr: 'Tout Starter, plus :', en: 'Everything in Starter, plus:' },
      { fr: 'Synchronisation automatique MT4/MT5', en: 'Automatic MT4/MT5 sync' },
      { fr: 'Analytics avancés + Edge Score', en: 'Advanced analytics + Edge Score' },
      { fr: 'Calendrier de performance', en: 'Performance calendar' },
      { fr: 'Import illimité', en: 'Unlimited imports' },
      { fr: 'Support prioritaire sous 24 h', en: 'Priority support within 24h' },
      { fr: '3 comptes de trading', en: '3 trading accounts' },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    monthly: 29.99,
    accent: 'violet',
    cta: 'contact',
    tagline: { fr: 'Accompagnement haut de gamme.', en: 'White-glove, high-touch support.' },
    features: [
      { fr: 'Tout Pro, plus :', en: 'Everything in Pro, plus:' },
      { fr: 'Comptes illimités', en: 'Unlimited accounts' },
      { fr: 'Support VIP téléphone', en: 'VIP phone support' },
      { fr: 'Coaching mensuel', en: 'Monthly coaching' },
      { fr: 'Accès API', en: 'API access' },
      { fr: 'Accès anticipé aux nouveautés', en: 'Early access to new features' },
      { fr: 'Badge « Premium »', en: '"Premium" badge' },
    ],
  },
];

// Cross-plan comparison matrix.
const MATRIX: { label: { fr: string; en: string }; cells: [boolean, boolean, boolean] }[] = [
  { label: { fr: 'Journal & dashboard', en: 'Journal & dashboard' }, cells: [true, true, true] },
  { label: { fr: 'Import CSV', en: 'CSV import' }, cells: [true, true, true] },
  { label: { fr: 'EA MT4/MT5 gratuite', en: 'Free MT4/MT5 EA' }, cells: [true, true, true] },
  { label: { fr: 'Synchronisation automatique', en: 'Automatic sync' }, cells: [false, true, true] },
  { label: { fr: 'Analytics avancés + Edge Score', en: 'Advanced analytics + Edge Score' }, cells: [false, true, true] },
  { label: { fr: 'Calendrier de performance', en: 'Performance calendar' }, cells: [false, true, true] },
  { label: { fr: 'Comptes de trading', en: 'Trading accounts' }, cells: [false, true, true] },
  { label: { fr: 'Accès API', en: 'API access' }, cells: [false, false, true] },
  { label: { fr: 'Coaching mensuel', en: 'Monthly coaching' }, cells: [false, false, true] },
  { label: { fr: 'Support VIP téléphone', en: 'VIP phone support' }, cells: [false, false, true] },
];

const ACCENT_RING: Record<string, string> = {
  ion: 'text-ion',
  gold: 'text-gold',
  violet: 'text-violet',
};

function price(monthly: number, cycle: Cycle): string {
  const v = cycle === 'annual' ? monthly * 0.8 : monthly;
  return v.toFixed(2).replace('.', ',');
}

function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden className="mt-0.5 shrink-0 text-profit">
      <path d="M2.5 7.5l3 3 6-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Cross() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden className="mt-0.5 shrink-0 text-ink-faint">
      <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function PricingPage() {
  const { lang } = useI18n();
  const [cycle, setCycle] = useState<Cycle>('monthly');
  const c = COPY[lang];

  return (
    <div className="relative overflow-hidden">
      {/* Aurora wash behind the header */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(242,181,68,0.12) 0%, transparent 70%)' }}
      />

      <section className="relative mx-auto max-w-[1100px] px-6 pb-24 pt-20 text-center">
        <p className="mb-4 text-[11.5px] uppercase tracking-[0.2em] text-gold">{c.eyebrow}</p>
        <h1 className="mx-auto max-w-2xl font-display text-[38px] font-semibold leading-[1.1] tracking-tight text-ink sm:text-[46px]">
          {c.title}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-ink-secondary">{c.subtitle}</p>

        {/* Billing cycle toggle */}
        <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-edge bg-raised p-1">
          {(['monthly', 'annual'] as Cycle[]).map((cy) => (
            <button
              key={cy}
              onClick={() => setCycle(cy)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
                cycle === cy ? 'bg-gold text-ink-on-accent shadow-[0_0_18px_rgba(242,181,68,0.3)]' : 'text-ink-secondary hover:text-ink'
              }`}
            >
              {cy === 'monthly' ? c.monthly : c.annual}
              {cy === 'annual' && (
                <span className={`ml-1.5 text-[11px] font-semibold ${cycle === cy ? 'text-ink-on-accent' : 'text-profit'}`}>
                  {c.save}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Plan cards */}
        <div className="mt-12 grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
          {PLANS.map((p) => (
            <article
              key={p.id}
              className={
                p.highlight
                  ? 'relative rounded-2xl border border-gold/50 bg-raised p-7 text-left shadow-[0_0_48px_rgba(242,181,68,0.14)] lg:-mt-3 lg:scale-[1.03]'
                  : 'relative rounded-2xl border border-edge-subtle bg-raised p-7 text-left transition-colors hover:border-edge-strong'
              }
            >
              {/* Colored top rail */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[3px] rounded-t-2xl"
                style={{
                  background: `linear-gradient(90deg, transparent, var(--z-${p.accent}), transparent)`,
                }}
              />
              {p.highlight && (
                <span className="absolute -top-3 left-7 rounded-full bg-gold px-3 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-ink-on-accent">
                  {c.popular}
                </span>
              )}
              <h3 className={`font-display text-[15px] font-semibold uppercase tracking-[0.14em] ${ACCENT_RING[p.accent]}`}>
                {p.name}
              </h3>
              <p className="mt-2 text-[13px] leading-snug text-ink-muted">{p.tagline[lang]}</p>
              <p className="z-numeric mt-5 flex items-baseline gap-1 text-ink">
                <span className="text-[40px] font-semibold leading-none">{price(p.monthly, cycle)}€</span>
                <span className="text-[13px] font-normal text-ink-muted">{c.perMonth}</span>
              </p>
              <p className="mt-1 h-4 text-[11.5px] text-ink-faint">
                {cycle === 'annual' ? c.billedAnnually : ' '}
              </p>

              <Link
                href={p.cta === 'contact' ? '/#contact' : CTA_HREF}
                className={
                  p.highlight
                    ? 'mt-6 block rounded-lg bg-gold px-4 py-2.5 text-center text-[14px] font-semibold text-ink-on-accent shadow-[0_0_24px_rgba(242,181,68,0.3)] transition-all hover:bg-gold-hover'
                    : 'mt-6 block rounded-lg border border-edge px-4 py-2.5 text-center text-[14px] font-medium text-ink-secondary transition-colors hover:border-edge-strong hover:text-ink'
                }
              >
                {p.cta === 'contact' ? c.contact : c.start}
              </Link>

              <ul className="mt-6 space-y-3">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] leading-snug text-ink-secondary">
                    <Check />
                    {f[lang]}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* Comparison matrix */}
        <div className="mt-20">
          <h2 className="mb-6 text-center font-display text-[22px] font-semibold tracking-tight text-ink">{c.compare}</h2>
          <div className="overflow-hidden rounded-xl border border-edge-subtle bg-raised">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-edge-subtle text-ink-muted">
                  <th className="px-5 py-3 font-medium" />
                  {PLANS.map((p) => (
                    <th key={p.id} className={`px-4 py-3 text-center font-semibold ${ACCENT_RING[p.accent]}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((row, i) => (
                  <tr key={i} className="border-b border-edge-subtle/60 last:border-0">
                    <td className="px-5 py-3 text-ink-secondary">{row.label[lang]}</td>
                    {row.cells.map((on, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="flex justify-center">{on ? <Check /> : <Cross />}</div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-center text-[12px] text-ink-faint">{c.note}</p>
        </div>
      </section>
    </div>
  );
}
