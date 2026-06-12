import Link from 'next/link';
import { ZenithMark } from '@/components/shell/zenith-mark';
import { ThemeSwitcher } from '@/components/shell/theme-switcher';
import { CursorReveal, CursorRevealVivid } from '@/components/landing/cursor-reveal';
import { StatTicker } from '@/components/landing/stat-ticker';
import { Marquee } from '@/components/landing/marquee';
import { ScrollReveal } from '@/components/landing/scroll-reveal';

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
const CTA_HREF = clerkEnabled ? '/sign-up' : '/dashboard';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-void">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes arcticPulse {
          0%, 100% { text-shadow: 0 0 20px var(--primary-glow), 0 0 40px var(--accent-glow); }
          50% { text-shadow: 0 0 44px var(--primary-glow), 0 0 84px var(--primary-glow); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .word-1 { animation: slideUp 0.7s ease both 0.0s; }
        .word-2 { animation: slideUp 0.7s ease both 0.15s; }
        .word-3 { animation: slideUp 0.7s ease both 0.3s; }
        .word-gold { animation: slideUp 0.7s ease both 0.45s, arcticPulse 3s ease-in-out infinite 1.2s; }
        .badge-anim { animation: fadeIn 0.6s ease both 0.6s; }
        .sub-anim { animation: slideUp 0.7s ease both 0.5s; }
        .cta-anim { animation: slideUp 0.7s ease both 0.65s; }
        .hero-visual-anim { animation: slideUp 0.9s ease both 0.8s; }
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.in { opacity: 1; transform: none; }
        .why-line { opacity: 0; transform: translateX(-40px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .why-line.in { opacity: 1; transform: none; }
      `}</style>
      <ScrollReveal />
      <Nav />
      <main>
        <Hero />
        <StatTicker />
        <Features />
        <WhySection />
        <Marquee />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-edge-subtle bg-void/70 backdrop-blur-xl">
      {/* Hairline aurora glow under the glass bar */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-aurora opacity-40" />
      <div className="mx-auto flex h-14 max-w-[1100px] items-center gap-8 px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <ZenithMark size={24} />
          <span className="font-display text-[14px] font-semibold tracking-[0.18em] text-ink">
            ZENITH
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-[13px] text-ink-secondary sm:flex">
          <a href="#features" className="transition-colors duration-fast hover:text-ink">Fonctionnalités</a>
          <a href="#why" className="transition-colors duration-fast hover:text-ink">Pourquoi</a>
          <Link href="/pricing" className="transition-colors duration-fast hover:text-gold">Tarifs</Link>
          <Link href="/mt5" className="transition-colors duration-fast hover:text-teal">EA</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <ThemeSwitcher />
          <span aria-hidden className="hidden h-4 w-px bg-edge sm:block" />
          <Link
            href={clerkEnabled ? '/sign-in' : '/dashboard'}
            className="hidden rounded-md px-3 py-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink sm:block"
          >
            Connexion
          </Link>
          <Link
            href={CTA_HREF}
            className="rounded-md bg-gold px-3.5 py-1.5 text-[13px] font-semibold text-ink-on-accent shadow-[0_0_20px_var(--z-gold-glow)] transition-all hover:bg-gold-hover hover:shadow-[0_0_28px_var(--z-gold-glow)]"
          >
            Commencer
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const points = [0,14,9,22,31,26,38,35,47,42,58,53,67,75,70,84,79,92,88,103,97,112,108,124,118,133,141,136,152,160];
  const w = 900, h = 230;
  const max = Math.max(...points);
  const path = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'}${((i / (points.length - 1)) * w).toFixed(1)},${(h - 24 - (p / max) * (h - 60)).toFixed(1)}`
  ).join(' ');

  const vividChart = (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" aria-hidden>
      <defs>
        <linearGradient id="heroFillVivid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="var(--primary)" strokeOpacity="0.15" strokeDasharray="2 8" />
      ))}
      <path d={`${path} L${w},${h} L0,${h} Z`} fill="url(#heroFillVivid)" />
      <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" filter="url(#glow)" />
      <circle cx={w} cy={h - 24 - (points[points.length - 1]! / max) * (h - 60)} r="5" fill="var(--primary)" filter="url(#glow)" />
    </svg>
  );

  const darkChart = (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Equity curve illustration">
      <defs>
        <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="#1e2330" strokeDasharray="2 8" />
      ))}
      <path d={`${path} L${w},${h} L0,${h} Z`} fill="url(#heroFill)" />
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx={w} cy={h - 24 - (points[points.length - 1]! / max) * (h - 60)} r="4" fill="var(--accent)" />
    </svg>
  );

  return (
    <section className="relative overflow-hidden">
      {/* Dawn glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
        style={{ background: 'var(--hero-grad)' }}
      />
      {/* Floating orbs */}
      <div className="z-orb z-orb-primary h-[320px] w-[420px] opacity-50" style={{ top: -120, left: '8%' }} />
      <div className="z-orb z-orb-accent h-[300px] w-[300px] opacity-40" style={{ top: -80, right: '10%' }} />
      <div className="relative mx-auto max-w-[1100px] px-6 pb-20 pt-20 text-center sm:pt-28">
        <p className="badge-anim mx-auto mb-5 w-fit rounded-full border border-edge bg-raised px-3 py-1 text-[11.5px] uppercase tracking-[0.16em] text-ink-muted opacity-0">
          Le journal de trading pour traders sérieux
        </p>

        <h1 className="mx-auto max-w-3xl font-display text-[40px] font-semibold leading-[1.08] tracking-tight text-ink sm:text-[58px]">
          <span className="word-1 inline-block opacity-0">Visualisez</span>{' '}
          <span className="word-2 inline-block opacity-0">votre</span>{' '}
          <span className="word-3 inline-block opacity-0">edge</span>{' '}
          <span className="word-gold z-gradient-text inline-block opacity-0 [filter:drop-shadow(0_0_18px_var(--z-gold-glow))]">clairement.</span>
        </h1>

        <p className="sub-anim mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-ink-secondary opacity-0">
          Enregistrez un trade en moins de 30 secondes. ZENITH transforme vos
          exécutions en P&L, R-multiples, analytics comportementaux et une courbe
          d’equity en laquelle vous pouvez enfin avoir confiance — sur chacun de
          vos comptes.
        </p>

        <div className="cta-anim mt-8 flex items-center justify-center gap-3 opacity-0">
          <Link
            href={CTA_HREF}
            className="rounded-md bg-gold px-6 py-2.5 text-[14px] font-semibold text-ink-on-accent shadow-[0_0_32px_var(--z-gold-glow)] transition-colors hover:bg-gold-hover"
          >
            Commencer gratuitement
          </Link>
          <a
            href="#pricing"
            className="rounded-md border border-edge px-6 py-2.5 text-[14px] font-medium text-ink-secondary transition-colors hover:border-edge-strong hover:text-ink"
          >
            Voir les tarifs
          </a>
        </div>

        {/* Social proof */}
        <div className="badge-anim mt-6 flex items-center justify-center gap-3 opacity-0">
          <div className="flex -space-x-2">
            {['#7C6AC4','#4ADE80','#F2B544','#60A5FA','#F87171'].map((c, i) => (
              <div
                key={i}
                className="h-7 w-7 rounded-full border-2 border-void"
                style={{ background: c, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0B10', fontWeight: 700 }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <p className="text-[12.5px] text-ink-muted">
            Rejoignez <span className="text-ink font-semibold">1 200+</span> traders qui connaissent leur edge
          </p>
        </div>

        {/* Hero visual with cursor reveal */}
        <CursorReveal>
          <div className="hero-visual-anim relative mx-auto mt-14 max-w-[920px] rounded-xl border border-edge bg-raised p-4 shadow-modal opacity-0">
            <div className="flex items-center justify-between px-2 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-profit" />
                <span className="z-numeric text-[11.5px] uppercase tracking-[0.14em] text-ink-muted">
                  Courbe d’equity · tous les comptes
                </span>
              </div>
              <span className="z-numeric text-[13px] font-semibold text-profit">+$12,840.50</span>
            </div>
            {darkChart}
            <div className="grid grid-cols-2 gap-3 px-2 pt-4 sm:grid-cols-4">
              {[['Taux de réussite','54.2%'],['Facteur de profit','1.82'],['Espérance','+0.43R'],['Drawdown max','−$2,140']].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-edge-subtle bg-high px-4 py-3 text-left">
                  <p className="text-[10.5px] uppercase tracking-[0.14em] text-ink-muted">{label}</p>
                  <p className="z-numeric mt-1 text-[17px] font-semibold text-ink">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vivid glowing layer revealed by cursor */}
          <CursorRevealVivid>
            <div className="absolute inset-0 mx-auto mt-14 max-w-[920px] rounded-xl border border-gold/40 bg-raised p-4" style={{top: 'calc(14rem + 56px)'}}>
              <div className="flex items-center justify-between px-2 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-gold" style={{boxShadow: '0 0 8px var(--primary)'}} />
                  <span className="z-numeric text-[11.5px] uppercase tracking-[0.14em] text-gold/70">
                    Courbe d’equity · tous les comptes
                  </span>
                </div>
                <span className="z-numeric text-[13px] font-semibold text-gold">+$12,840.50</span>
              </div>
              {vividChart}
            </div>
          </CursorRevealVivid>
        </CursorReveal>
      </div>
    </section>
  );
}

const FEATURES = [
  { title: 'Saisie sans friction', body: 'Symbole, entrée, sortie, stop — P&L et R-multiple calculés en direct pendant que vous tapez. Tout le reste est optionnel, à un clic près.' },
  { title: 'Import CSV broker', body: 'Déposez n’importe quel export d’exécutions — IBKR, NinjaTrader, Tradovate, générique. Les fills sont regroupés en trades, prévisualisés, dédupliqués, puis validés.' },
  { title: 'Des analytics qui répondent', body: 'Courbe d’equity, distribution des R, heatmap de P&L, répartitions par setup, symbole, heure et jour de la semaine. Trouvez où vit l’edge — et où il fuit.' },
  { title: 'La psychologie, quantifiée', body: 'Respect du plan, erreurs taguées, état émotionnel avant/pendant/après. La couche honnête que la plupart des journaux évitent est celle qui paie.' },
  { title: 'Garde-fous prop-firm', body: 'Les comptes eval et funded portent leurs propres objectifs de profit et limites de drawdown, suivis en direct pour ne jamais griller un challenge par accident.' },
  { title: 'Un journal, pas que des chiffres', body: 'Plans quotidiens, recaps, leçons et idées en markdown, avec suivi de l’humeur — connectés aux journées de trading qu’ils décrivent.' },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-[1100px] px-6 py-20">
      <header className="mx-auto mb-12 max-w-xl text-center reveal">
        <h2 className="font-display text-[30px] font-semibold tracking-tight text-ink">
          Conçu pour la boucle de revue
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-secondary">
          Enregistrer → revoir → ajuster. Chaque écran de ZENITH sert la boucle qui fait vraiment progresser les traders.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <article
            key={f.title}
            className="reveal z-shine overflow-hidden rounded-xl border border-edge-subtle bg-raised p-5 transition-all duration-300 hover:border-gold/30 hover:shadow-[0_0_24px_var(--z-gold-glow)]"
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <span className="z-numeric text-[11px] text-gold">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="mt-2 font-display text-[15px] font-semibold text-ink">{f.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const WHY = [
  { num: '01', text: 'AUCUN SYSTÈME' },
  { num: '02', text: 'AUCUNE DONNÉE' },
  { num: '03', text: 'AUCUNE REVUE' },
];

function WhySection() {
  return (
    <section id="why" className="border-t border-edge-subtle bg-raised/30 py-20">
      <div className="mx-auto max-w-[1100px] px-6">
        <p className="reveal mb-4 text-[11.5px] uppercase tracking-[0.2em] text-gold">
          Pourquoi les traders échouent
        </p>
        <div className="space-y-2">
          {WHY.map((w, i) => (
            <div
              key={w.num}
              className="why-line flex items-baseline gap-4 py-2"
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <span
                className="shrink-0 font-display font-bold text-ink-faint"
                style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}
              >
                {w.num} /
              </span>
              <span
                className="font-display font-bold leading-none tracking-tight text-ink"
                style={{ fontSize: 'clamp(3rem, 7vw, 7rem)', lineHeight: 1 }}
              >
                {w.text}
              </span>
            </div>
          ))}
        </div>
        <p className="reveal mt-8 max-w-lg text-[14.5px] leading-relaxed text-ink-secondary">
          ZENITH corrige les trois. Un seul endroit pour enregistrer, un seul pour revoir, un seul système qui vous montre où est l’edge — et où il fuit.
        </p>
      </div>
    </section>
  );
}

const PLANS = [
  {
    name: 'Starter', price: '8.99€', cadence: '/ mois', cta: 'Commencer', highlight: false, badge: null,
    features: ['Import CSV MT4/MT5', 'EA MT5 gratuit inclus', 'Dashboard P&L / Win Rate / Drawdown', '1 compte de trading', 'Trade log + notes'],
  },
  {
    name: 'Pro', price: '14.99€', cadence: '/ mois', cta: 'Démarrer en Pro →', highlight: true, badge: 'Le plus populaire',
    features: ['Tout Starter +', 'Sync MT5 automatique en temps réel', '3 comptes de trading', 'Analytics : R-multiple, expectancy, heatmap', 'Rapport PDF mensuel'],
  },
  {
    name: 'Elite', price: '29.99€', cadence: '/ mois', cta: 'Accéder à l’Elite →', highlight: false, badge: null,
    features: ['Tout Pro +', 'Comptes illimités', 'Support prioritaire < 2h', 'Dashboard personnalisable', 'Rapport PDF hebdomadaire'],
  },
];

function Pricing() {
  return (
    <section id="pricing" className="border-t border-edge-subtle bg-raised/40">
      <div className="mx-auto max-w-[1100px] px-6 py-20">
        <header className="mx-auto mb-12 max-w-xl text-center reveal">
          <h2 className="font-display text-[30px] font-semibold tracking-tight text-ink">Tarifs clairs</h2>
          <p className="mt-3 text-[14.5px] text-ink-secondary">Moins cher qu’un revenge trade raté.</p>
        </header>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <article
              key={p.name}
              className={`reveal z-shine overflow-hidden ${p.badge
                ? 'relative rounded-xl border border-gold/50 bg-raised p-6 shadow-[0_0_40px_var(--recommended-glow)]'
                : 'rounded-xl border border-edge-subtle bg-raised p-6'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {p.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-ink-on-accent">
                  {p.badge}
                </span>
              )}
              <h3 className="font-display text-[14px] font-semibold uppercase tracking-[0.14em] text-ink-secondary">{p.name}</h3>
              <p className="z-numeric mt-3 text-[34px] font-semibold leading-none text-ink">
                {p.price}
                <span className="ml-2 text-[12.5px] font-normal text-ink-muted">{p.cadence}</span>
              </p>
              <ul className="mt-5 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-ink-secondary">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="mt-0.5 shrink-0 text-gold">
                      <path d="M2.5 7.5l3 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={CTA_HREF}
                className={p.badge
                  ? 'mt-6 block rounded-md bg-gold px-4 py-2.5 text-center text-[13.5px] font-semibold text-ink-on-accent transition-colors hover:bg-gold-hover'
                  : 'mt-6 block rounded-md border border-edge px-4 py-2.5 text-center text-[13.5px] font-medium text-ink-secondary transition-colors hover:border-edge-strong hover:text-ink'
                }
              >
                {p.cta}
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-8 text-center text-[12px] text-ink-faint">
          Prix en EUR · Sans engagement · Données exportables
        </p>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-edge-subtle">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[300px]"
        style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 100%, var(--primary-glow) 0%, transparent 70%)' }}
      />
      <div className="relative mx-auto max-w-[1100px] px-6 py-24 text-center reveal">
        <ZenithMark size={36} className="mx-auto" />
        <h2 className="mt-6 font-display text-[32px] font-semibold tracking-tight text-ink">
          Vos 100 prochains trades méritent d’être consignés.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[14.5px] text-ink-secondary">
          Les traders qui revoient sont ceux qui durent. Commencez ce soir.
        </p>
        <Link
          href={CTA_HREF}
          className="mt-8 inline-block rounded-md bg-gold px-7 py-3 text-[14px] font-semibold text-ink-on-accent shadow-[0_0_32px_var(--z-gold-glow)] transition-colors hover:bg-gold-hover"
        >
          Commencer gratuitement
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-edge-subtle">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <ZenithMark size={18} />
          <span className="text-[12.5px] text-ink-muted">ZENITH — Visualisez votre edge clairement.</span>
        </div>
        <nav className="flex items-center gap-5 text-[12.5px] text-ink-muted">
          <a href="#features" className="hover:text-ink-secondary">Fonctionnalités</a>
          <a href="#pricing" className="hover:text-ink-secondary">Tarifs</a>
          <Link href={clerkEnabled ? '/sign-in' : '/dashboard'} className="hover:text-ink-secondary">Connexion</Link>
        </nav>
        <p className="z-numeric text-[11.5px] text-ink-faint">© 2026 ZENITH</p>
      </div>
    </footer>
  );
}
