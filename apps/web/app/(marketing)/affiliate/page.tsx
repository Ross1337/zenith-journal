'use client';

import Link from 'next/link';
import { ZenithMark } from '@/components/shell/zenith-mark';

const BROKERS = [
  {
    name: 'Vantage Markets',
    logo: '🏦',
    minDeposit: '200$',
    leverage: '1:500',
    note: 'Broker ECN réglementé ASIC/CIMA',
    highlight: true,
  },
  {
    name: 'ThinkMarkets',
    logo: '📈',
    minDeposit: '250$',
    leverage: '1:500',
    note: 'Broker primé, spreads ultra-compétitifs',
    highlight: false,
  },
  {
    name: 'IC Markets',
    logo: '🌐',
    minDeposit: '200$',
    leverage: '1:500',
    note: 'N°1 mondial en volume Forex retail',
    highlight: false,
  },
  {
    name: 'Pepperstone',
    logo: '🔷',
    minDeposit: '200$',
    leverage: '1:400',
    note: 'Réglementé FCA, ASIC, CySEC',
    highlight: false,
  },
];

const STEPS = [
  {
    n: 1,
    icon: '🔗',
    title: 'Ouvrez un compte via notre lien',
    desc: 'Cliquez sur le lien affilié Zenith pour le broker de votre choix. Créez votre compte de trading — gratuit et sans engagement.',
    detail: 'Le lien doit être utilisé pour que votre dépôt soit associé à Zenith. Un compte existant ne peut pas être rétroactivement associé.',
    color: 'primary',
  },
  {
    n: 2,
    icon: '💰',
    title: 'Effectuez le dépôt minimum',
    desc: 'Déposez le montant minimum requis (200–250$ selon le broker). Cela active la relation affiliée et déclenche votre accès Lifetime.',
    detail: 'Le dépôt reste sur votre compte de trading et vous appartient. Zenith ne touche pas à vos fonds.',
    color: 'accent',
  },
  {
    n: 3,
    icon: '📧',
    title: 'Envoyez la preuve de dépôt',
    desc: 'Envoyez une capture d\'écran ou PDF de confirmation de dépôt à affiliate@zenith.trading avec votre email Zenith.',
    detail: 'Votre accès Lifetime est activé sous 24h ouvrées après vérification.',
    color: 'profit',
  },
];

const FAQ = [
  {
    q: 'Mon dépôt reste-t-il sur mon compte de trading ?',
    a: "Oui, 100%. Votre dépôt reste sur votre compte chez le broker. Zenith ne touche à aucun de vos fonds. Le modèle fonctionne via une commission d'apport d'affaires versée par le broker à Zenith.",
  },
  {
    q: "Puis-je retirer mes fonds après l'activation Lifetime ?",
    a: "Vous êtes libre de gérer vos fonds comme vous le souhaitez. Cependant, certains brokers peuvent révoquer la commission si les fonds sont retirés immédiatement. Nous recommandons de trader activement au minimum quelques semaines.",
  },
  {
    q: "L'accès Lifetime inclut-il toutes les futures fonctionnalités ?",
    a: "Oui. Lifetime Zenith = accès permanent au plan Elite actuel et à toutes les futures fonctionnalités, sans abonnement mensuel.",
  },
  {
    q: "J'ai déjà un compte chez un de ces brokers. Puis-je en bénéficier ?",
    a: "Malheureusement non. L'offre nécessite l'ouverture d'un nouveau compte via notre lien affilié. Un compte existant ne peut pas être rétroactivement lié à Zenith.",
  },
  {
    q: 'Combien de temps pour activer mon accès Lifetime ?',
    a: "Sous 24h ouvrées après réception et vérification de votre preuve de dépôt. Dans la plupart des cas, l'activation se fait dans les 2–4 heures.",
  },
  {
    q: 'Que se passe-t-il si le broker refuse mon dépôt ?',
    a: 'Contactez-nous à affiliate@zenith.trading et nous trouverons une solution. Nous travaillons en partenariat direct avec ces brokers.',
  },
];

function StepColor(color: string) {
  const map = {
    primary: { bg: 'var(--primary-dim)', bd: 'var(--primary-glow)', tc: 'var(--primary)' },
    accent: { bg: 'var(--accent-dim)', bd: 'var(--accent-glow)', tc: 'var(--accent)' },
    profit: { bg: 'rgba(65,224,163,0.06)', bd: 'rgba(65,224,163,0.15)', tc: 'var(--profit)' },
  }[color] ?? { bg: 'var(--primary-dim)', bd: 'var(--primary-glow)', tc: 'var(--primary)' };
  return map;
}

export default function AffiliatePage() {
  return (
    <div className="mx-auto max-w-[900px] px-6 pb-24 sm:px-8">
      {/* ═══════════ HERO ═══════════ */}
      <section
        className="relative overflow-hidden pt-16 pb-14 text-center"
        style={{ background: 'var(--hero-grad)' }}
      >
        <div className="z-orb z-orb-primary h-[300px] w-[400px] opacity-60" style={{ top: -100, left: -100 }} />
        <div className="z-orb z-orb-accent h-[300px] w-[300px] opacity-50" style={{ top: -80, right: -80 }} />

        <div className="relative mb-5 inline-flex items-center gap-2.5">
          <ZenithMark size={32} />
          <span className="z-gradient-text font-display text-[1.1rem] font-bold tracking-[0.06em]">ZENITH</span>
        </div>

        <div className="relative mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(65,224,163,0.25)] bg-profit-wash px-4 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-profit">
          <span>🎁</span>
          <span>Offre Partenaires</span>
        </div>

        <h1 className="relative font-display text-[clamp(1.75rem,4.5vw,2.875rem)] font-extrabold leading-[1.05] tracking-[-0.025em] text-ink">
          Accès Lifetime Zenith
          <br />
          <span className="z-gradient-text">gratuitement, via votre broker</span>
        </h1>
        <p className="relative mx-auto mt-4 max-w-[520px] text-[1rem] text-ink-secondary">
          Déposez chez l'un de nos brokers partenaires via notre lien et obtenez un accès permanent à Zenith Elite — sans aucun abonnement.
        </p>

        {/* Value pill */}
        <div className="relative mt-6 inline-flex items-baseline gap-2">
          <span className="font-display text-[2.5rem] font-extrabold tracking-[-0.03em] text-profit">0€</span>
          <span className="text-ink-secondary">/mois — pour toujours</span>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[10%] bottom-0 h-px opacity-40"
          style={{ background: 'linear-gradient(90deg, transparent, var(--primary), var(--accent), transparent)' }}
        />
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="mt-16">
        <p className="mb-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-[var(--step-accent)]">
          Comment ça marche
        </p>
        <h2 className="font-display text-[clamp(1.375rem,2.5vw,1.875rem)] font-bold tracking-[-0.02em] text-ink">
          3 étapes vers votre accès Lifetime
        </h2>

        <div className="mt-8 flex flex-col gap-5">
          {STEPS.map((step) => {
            const c = StepColor(step.color);
            return (
              <div
                key={step.n}
                className="z-shine relative flex gap-5 overflow-hidden rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-px hover:border-edge-strong"
                style={{ borderColor: c.bd, background: c.bg }}
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border font-display text-[1.1rem] font-extrabold"
                  style={{ borderColor: c.bd, background: 'var(--void)', color: c.tc }}
                >
                  {step.n}
                </div>
                <div className="flex-1">
                  <div className="mb-1.5 flex items-center gap-2.5">
                    <span className="text-xl">{step.icon}</span>
                    <span className="font-display text-[1rem] font-bold text-ink">{step.title}</span>
                  </div>
                  <p className="text-[0.875rem] leading-relaxed text-ink-secondary">{step.desc}</p>
                  <p className="mt-2 text-[0.775rem] leading-relaxed text-ink-faint">{step.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════ BROKERS ═══════════ */}
      <section className="mt-20">
        <div
          aria-hidden
          className="mb-12 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--z-border-strong), transparent)' }}
        />
        <p className="mb-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-[var(--step-accent)]">
          Brokers Partenaires
        </p>
        <h2 className="font-display text-[clamp(1.375rem,2.5vw,1.875rem)] font-bold tracking-[-0.02em] text-ink">
          Choisissez votre broker
        </h2>
        <p className="mt-2 text-[0.875rem] text-ink-secondary">
          Tous réglementés, tous compatibles MetaTrader 5. Choisissez celui qui correspond à votre région et préférences.
        </p>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {BROKERS.map((broker) => (
            <div
              key={broker.name}
              className={`z-shine group relative overflow-hidden rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-0.5 ${
                broker.highlight
                  ? 'z-card-glow border-[var(--recommended-border)] bg-hover'
                  : 'border-edge bg-high hover:border-edge-strong'
              }`}
            >
              {broker.highlight && (
                <>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, var(--recommended-border), transparent)' }}
                  />
                  <span className="absolute right-4 top-4 rounded-lg border border-[rgba(65,224,163,0.25)] bg-profit-wash px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-profit">
                    Populaire
                  </span>
                </>
              )}
              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-edge-strong bg-surface text-2xl">
                  {broker.logo}
                </div>
                <div className="flex-1">
                  <div className="font-display text-[1rem] font-bold text-ink">{broker.name}</div>
                  <p className="mt-0.5 text-[0.775rem] text-ink-secondary">{broker.note}</p>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    <span className="rounded-md border border-edge bg-surface px-2.5 py-1 text-[0.7rem] font-medium text-ink-secondary">
                      Dépôt min. <strong className="text-ink">{broker.minDeposit}</strong>
                    </span>
                    <span className="rounded-md border border-edge bg-surface px-2.5 py-1 text-[0.7rem] font-medium text-ink-secondary">
                      Levier <strong className="text-ink">{broker.leverage}</strong>
                    </span>
                  </div>
                  <button
                    className="mt-4 w-full rounded-[9px] py-2 text-[0.8125rem] font-semibold transition-opacity hover:opacity-90"
                    style={{
                      background: broker.highlight ? 'var(--btn-primary)' : 'transparent',
                      color: broker.highlight ? 'var(--btn-primary-text)' : 'var(--ink-secondary)',
                      border: broker.highlight ? 'none' : '1px solid var(--edge-strong)',
                    }}
                  >
                    Ouvrir un compte →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ VALUE PROP ═══════════ */}
      <section className="mt-16">
        <div className="z-shine relative overflow-hidden rounded-2xl border border-edge-strong bg-high p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
            style={{ background: 'linear-gradient(90deg, transparent, var(--primary), var(--accent), transparent)' }}
          />
          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: '💎', title: 'Plan Elite complet', desc: 'Tout inclus : comptes illimités, sync auto, analytics avancées, support prioritaire.' },
              { icon: '♾️', title: 'Pour toujours', desc: 'Lifetime = accès permanent. Aucun abonnement, même si les prix augmentent.' },
              { icon: '🔒', title: 'Vos fonds sont les vôtres', desc: 'Le dépôt reste sur votre compte de trading. Zenith est rémunéré par le broker.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="mb-1 font-semibold text-ink">{item.title}</div>
                  <p className="text-[0.8125rem] leading-relaxed text-ink-secondary">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="mt-20">
        <div
          aria-hidden
          className="mb-12 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--z-border-strong), transparent)' }}
        />
        <p className="mb-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-[var(--step-accent)]">FAQ</p>
        <h2 className="font-display text-[clamp(1.375rem,2.5vw,1.875rem)] font-bold tracking-[-0.02em] text-ink">
          Questions fréquentes
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {FAQ.map((f) => (
            <div key={f.q}>
              <div className="mb-1.5 flex gap-2.5 text-[0.875rem] font-semibold text-ink">
                <span className="font-bold text-[var(--step-accent)]">Q</span>
                {f.q}
              </div>
              <p className="pl-[22px] text-[0.8125rem] leading-relaxed text-ink-secondary">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <div className="z-shine relative mt-20 overflow-hidden rounded-[20px] border border-edge-strong bg-high px-8 py-14 text-center">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'var(--hero-grad)' }} />
        <h2 className="relative font-display text-[1.875rem] font-bold tracking-[-0.02em] text-ink">
          Prêt à démarrer ?
        </h2>
        <p className="relative mx-auto mt-3 max-w-[400px] text-ink-secondary">
          Choisissez votre broker, ouvrez un compte, et recevez votre accès Lifetime Zenith sous 24h.
        </p>
        <div className="relative mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="#brokers"
            className="rounded-[11px] px-7 py-3 text-[0.9375rem] font-bold transition-opacity hover:opacity-90"
            style={{ background: 'var(--btn-primary)', color: 'var(--btn-primary-text)' }}
          >
            Voir les brokers partenaires →
          </a>
          <Link
            href="/pricing"
            className="rounded-[11px] border border-edge-strong px-7 py-3 text-[0.9375rem] font-medium text-ink-secondary transition-colors hover:border-gold hover:text-gold"
          >
            Voir les abonnements classiques
          </Link>
        </div>
        <p className="relative mt-5 text-[0.75rem] text-ink-faint">
          Des questions ? Écrivez-nous à{' '}
          <a href="mailto:affiliate@zenith.trading" className="underline hover:text-ink">
            affiliate@zenith.trading
          </a>
        </p>
      </div>
    </div>
  );
}
