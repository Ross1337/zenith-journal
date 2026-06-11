import Link from 'next/link';
import { ZenithMark } from '@/components/shell/zenith-mark';
import { CursorReveal, CursorRevealVivid } from '@/components/landing/cursor-reveal';
import { StatTicker } from '@/components/landing/stat-ticker';
import { Marquee } from '@/components/landing/marquee';

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
          0%, 100% { text-shadow: 0 0 20px rgba(66,226,184,0.4), 0 0 40px rgba(242,181,68,0.2); }
          50% { text-shadow: 0 0 40px rgba(66,226,184,0.7), 0 0 80px rgba(66,226,184,0.35); }
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

/** Client-side scroll reveal via IntersectionObserver — no lib. */
function ScrollReveal() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            function init() {
              var obs = new IntersectionObserver(function(entries) {
                entries.forEach(function(e) { if (e.isIntersecting) { e.target.classList.add('in'); } });
              }, { threshold: 0.15 });
              document.querySelectorAll('.reveal, .why-line').forEach(function(el) { obs.observe(el); });
            }
            if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
          })();
        `,
      }}
    />
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-edge-subtle bg-void/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1100px] items-center gap-8 px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <ZenithMark size={24} />
          <span className="font-display text-[14px] font-semibold tracking-[0.18em] text-ink">
            ZENITH
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-[13px] text-ink-secondary sm:flex">
          <a href="#features" className="transition-colors duration-fast hover:text-ink">Features</a>
          <a href="#why" className="transition-colors duration-fast hover:text-ink">Why</a>
          <a href="#pricing" className="transition-colors duration-fast hover:text-ink">Tarifs</a>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href={clerkEnabled ? '/sign-in' : '/dashboard'}
            className="rounded-md px-3 py-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink"
          >
            Sign in
          </Link>
          <Link
            href={CTA_HREF}
            className="rounded-md bg-gold px-3.5 py-1.5 text-[13px] font-semibold text-ink-on-accent transition-colors hover:bg-gold-hover"
          >
            Get started
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
          <stop offset="0%" stopColor="#42e2b8" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#42e2b8" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="#42e2b8" strokeOpacity="0.15" strokeDasharray="2 8" />
      ))}
      <path d={`${path} L${w},${h} L0,${h} Z`} fill="url(#heroFillVivid)" />
      <path d={path} fill="none" stroke="#42e2b8" strokeWidth="2.5" strokeLinejoin="round" filter="url(#glow)" />
      <circle cx={w} cy={h - 24 - (points[points.length - 1]! / max) * (h - 60)} r="5" fill="#42e2b8" filter="url(#glow)" />
    </svg>
  );

  const darkChart = (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Equity curve illustration">
      <defs>
        <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#42e2b8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#42e2b8" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="#1e2330" strokeDasharray="2 8" />
      ))}
      <path d={`${path} L${w},${h} L0,${h} Z`} fill="url(#heroFill)" />
      <path d={path} fill="none" stroke="#42e2b8" strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx={w} cy={h - 24 - (points[points.length - 1]! / max) * (h - 60)} r="4" fill="#42e2b8" />
    </svg>
  );

  return (
    <section className="relative overflow-hidden">
      {/* Dawn glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
        style={{ background: 'radial-gradient(ellipse 65% 50% at 50% 0%, rgba(66,226,184,0.13) 0%, transparent 70%)' }}
      />
      <div className="relative mx-auto max-w-[1100px] px-6 pb-20 pt-20 text-center sm:pt-28">
        <p className="badge-anim mx-auto mb-5 w-fit rounded-full border border-edge bg-raised px-3 py-1 text-[11.5px] uppercase tracking-[0.16em] text-ink-muted opacity-0">
          The trading journal for serious traders
        </p>

        <h1 className="mx-auto max-w-3xl font-display text-[40px] font-semibold leading-[1.08] tracking-tight text-ink sm:text-[58px]">
          <span className="word-1 inline-block opacity-0">See</span>{' '}
          <span className="word-2 inline-block opacity-0">your</span>{' '}
          <span className="word-3 inline-block opacity-0">edge</span>{' '}
          <span className="word-gold inline-block opacity-0 text-gold">clearly.</span>
        </h1>

        <p className="sub-anim mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-ink-secondary opacity-0">
          Log a trade in under 30 seconds. ZENITH turns your executions into
          P&L, R-multiples, behavioral analytics and an equity curve you can
          finally trust — across every account you trade.
        </p>

        <div className="cta-anim mt-8 flex items-center justify-center gap-3 opacity-0">
          <Link
            href={CTA_HREF}
            className="rounded-md bg-gold px-6 py-2.5 text-[14px] font-semibold text-ink-on-accent shadow-[0_0_32px_rgba(66,226,184,0.3)] transition-colors hover:bg-gold-hover"
          >
            Start journaling free
          </Link>
          <a
            href="#pricing"
            className="rounded-md border border-edge px-6 py-2.5 text-[14px] font-medium text-ink-secondary transition-colors hover:border-edge-strong hover:text-ink"
          >
            See pricing
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
            Join <span className="text-ink font-semibold">1,200+</span> traders who know their edge
          </p>
        </div>

        {/* Hero visual with cursor reveal */}
        <CursorReveal>
          <div className="hero-visual-anim relative mx-auto mt-14 max-w-[920px] rounded-xl border border-edge bg-raised p-4 shadow-modal opacity-0">
            <div className="flex items-center justify-between px-2 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-profit" />
                <span className="z-numeric text-[11.5px] uppercase tracking-[0.14em] text-ink-muted">
                  Equity curve · all accounts
                </span>
              </div>
              <span className="z-numeric text-[13px] font-semibold text-profit">+$12,840.50</span>
            </div>
            {darkChart}
            <div className="grid grid-cols-2 gap-3 px-2 pt-4 sm:grid-cols-4">
              {[['Win rate','54.2%'],['Profit factor','1.82'],['Expectancy','+0.43R'],['Max drawdown','−$2,140']].map(([label, value]) => (
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
                  <span className="h-2 w-2 rounded-full bg-gold" style={{boxShadow: '0 0 8px rgba(242,181,68,0.8)'}} />
                  <span className="z-numeric text-[11.5px] uppercase tracking-[0.14em] text-gold/70">
                    Equity curve · all accounts
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
  { title: 'Frictionless logging', body: 'Symbol, entry, exit, stop — live P&L and R-multiple computed as you type. Everything else is optional and one tap away.' },
  { title: 'Broker CSV import', body: 'Drop any execution export — IBKR, NinjaTrader, Tradovate, generic. Fills are matched into trades, previewed, deduplicated, then committed.' },
  { title: 'Analytics that answer questions', body: 'Equity curve, R distribution, P&L heatmap, breakdowns by setup, symbol, hour and weekday. Find where the edge lives — and where it leaks.' },
  { title: 'Psychology, quantified', body: 'Plan adherence, tagged mistakes, emotional state before/during/after. The honest layer most journals skip is the one that pays.' },
  { title: 'Prop-firm guardrails', body: 'Eval and funded accounts carry their own profit targets and drawdown limits, tracked live so you never blow a challenge by accident.' },
  { title: 'A journal, not just numbers', body: 'Daily plans, recaps, lessons and ideas in markdown, with mood tracking — connected to the trading days they describe.' },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-[1100px] px-6 py-20">
      <header className="mx-auto mb-12 max-w-xl text-center reveal">
        <h2 className="font-display text-[30px] font-semibold tracking-tight text-ink">
          Built for the review loop
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-secondary">
          Log → review → adjust. Every screen in ZENITH serves the loop that actually improves traders.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <article
            key={f.title}
            className="reveal rounded-xl border border-edge-subtle bg-raised p-5 transition-all duration-300 hover:border-gold/30 hover:shadow-[0_0_24px_rgba(66,226,184,0.06)]"
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
  { num: '01', text: 'NO SYSTEM' },
  { num: '02', text: 'NO DATA' },
  { num: '03', text: 'NO REVIEW' },
];

function WhySection() {
  return (
    <section id="why" className="border-t border-edge-subtle bg-raised/30 py-20">
      <div className="mx-auto max-w-[1100px] px-6">
        <p className="reveal mb-4 text-[11.5px] uppercase tracking-[0.2em] text-gold">
          Why traders fail
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
          ZENITH fixes all three. One place to log, one place to review, one system that shows you where the edge is — and where it leaks.
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
              className={`reveal ${p.badge
                ? 'relative rounded-xl border border-gold/50 bg-raised p-6 shadow-[0_0_40px_rgba(66,226,184,0.12)]'
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
        style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 100%, rgba(242,181,68,0.1) 0%, transparent 70%)' }}
      />
      <div className="relative mx-auto max-w-[1100px] px-6 py-24 text-center reveal">
        <ZenithMark size={36} className="mx-auto" />
        <h2 className="mt-6 font-display text-[32px] font-semibold tracking-tight text-ink">
          Your next 100 trades deserve a record.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[14.5px] text-ink-secondary">
          The traders who review are the traders who last. Start tonight.
        </p>
        <Link
          href={CTA_HREF}
          className="mt-8 inline-block rounded-md bg-gold px-7 py-3 text-[14px] font-semibold text-ink-on-accent shadow-[0_0_32px_rgba(66,226,184,0.3)] transition-colors hover:bg-gold-hover"
        >
          Start journaling free
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
          <span className="text-[12.5px] text-ink-muted">ZENITH — See your edge clearly.</span>
        </div>
        <nav className="flex items-center gap-5 text-[12.5px] text-ink-muted">
          <a href="#features" className="hover:text-ink-secondary">Features</a>
          <a href="#pricing" className="hover:text-ink-secondary">Tarifs</a>
          <Link href={clerkEnabled ? '/sign-in' : '/dashboard'} className="hover:text-ink-secondary">Sign in</Link>
        </nav>
        <p className="z-numeric text-[11.5px] text-ink-faint">© 2026 ZENITH</p>
      </div>
    </footer>
  );
}
