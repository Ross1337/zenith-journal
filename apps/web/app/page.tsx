import Link from 'next/link';
import { ZenithMark } from '@/components/shell/zenith-mark';

/**
 * Public landing — Observatory design. Server-rendered, zero client JS
 * beyond the shared layout. CTAs route to sign-up (Clerk) or straight to
 * the app in demo mode.
 */

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
const CTA_HREF = clerkEnabled ? '/sign-up' : '/dashboard';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-void">
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </div>
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
          <a href="#features" className="transition-colors duration-fast hover:text-ink">
            Features
          </a>
          <a href="#pricing" className="transition-colors duration-fast hover:text-ink">
            Pricing
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href={clerkEnabled ? '/sign-in' : '/dashboard'}
            className="rounded-md px-3 py-1.5 text-[13px] font-medium text-ink-secondary transition-colors duration-fast hover:text-ink"
          >
            Sign in
          </Link>
          <Link
            href={CTA_HREF}
            className="rounded-md bg-gold px-3.5 py-1.5 text-[13px] font-semibold text-ink-on-accent transition-colors duration-fast hover:bg-gold-hover"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Dawn glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
        style={{
          background:
            'radial-gradient(ellipse 65% 50% at 50% 0%, rgba(242,181,68,0.13) 0%, transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-[1100px] px-6 pb-20 pt-20 text-center sm:pt-28">
        <p className="z-numeric mx-auto mb-5 w-fit rounded-full border border-edge bg-raised px-3 py-1 text-[11.5px] uppercase tracking-[0.16em] text-ink-muted">
          The trading journal for serious traders
        </p>
        <h1 className="mx-auto max-w-3xl font-display text-[40px] font-semibold leading-[1.08] tracking-tight text-ink sm:text-[56px]">
          See your edge <span className="text-gold">clearly.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-ink-secondary">
          Log a trade in under 30 seconds. ZENITH turns your executions into
          P&L, R-multiples, behavioral analytics and an equity curve you can
          finally trust — across every account you trade.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href={CTA_HREF}
            className="rounded-md bg-gold px-6 py-2.5 text-[14px] font-semibold text-ink-on-accent shadow-[0_0_24px_rgba(242,181,68,0.25)] transition-colors duration-fast hover:bg-gold-hover"
          >
            Start journaling free
          </Link>
          <a
            href="#pricing"
            className="rounded-md border border-edge px-6 py-2.5 text-[14px] font-medium text-ink-secondary transition-colors duration-fast hover:border-edge-strong hover:text-ink"
          >
            See pricing
          </a>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

/** Deterministic equity curve — the product's core artifact as hero art. */
function HeroVisual() {
  // Pre-computed walk with a positive drift (no runtime randomness → stable SSR).
  const points = [
    0, 14, 9, 22, 31, 26, 38, 35, 47, 42, 58, 53, 67, 75, 70, 84, 79, 92, 88, 103, 97, 112, 108,
    124, 118, 133, 141, 136, 152, 160,
  ];
  const w = 900;
  const h = 230;
  const max = Math.max(...points);
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${((i / (points.length - 1)) * w).toFixed(1)},${(h - 24 - (p / max) * (h - 60)).toFixed(1)}`)
    .join(' ');

  return (
    <div className="relative mx-auto mt-14 max-w-[920px] rounded-xl border border-edge bg-raised p-4 shadow-modal">
      <div className="flex items-center justify-between px-2 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-profit" />
          <span className="z-numeric text-[11.5px] uppercase tracking-[0.14em] text-ink-muted">
            Equity curve · all accounts
          </span>
        </div>
        <span className="z-numeric text-[13px] font-semibold text-profit">+$12,840.50</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Equity curve illustration">
        <defs>
          <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f2b544" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f2b544" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="#1e2330" strokeDasharray="2 8" />
        ))}
        <path d={`${path} L${w},${h} L0,${h} Z`} fill="url(#heroFill)" />
        <path d={path} fill="none" stroke="#f2b544" strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx={w} cy={h - 24 - (points[points.length - 1]! / max) * (h - 60)} r="4" fill="#f2b544" />
      </svg>
      <div className="grid grid-cols-2 gap-3 px-2 pt-4 sm:grid-cols-4">
        {[
          ['Win rate', '54.2%'],
          ['Profit factor', '1.82'],
          ['Expectancy', '+0.43R'],
          ['Max drawdown', '−$2,140'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-edge-subtle bg-high px-4 py-3 text-left">
            <p className="text-[10.5px] uppercase tracking-[0.14em] text-ink-muted">{label}</p>
            <p className="z-numeric mt-1 text-[17px] font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stats() {
  return (
    <section className="border-y border-edge-subtle bg-raised/50">
      <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-6 px-6 py-10 text-center sm:grid-cols-4">
        {[
          ['< 30s', 'to log a trade'],
          ['30+', 'metrics computed live'],
          ['1 drop', 'to import broker CSVs'],
          ['∞', 'accounts, one journal'],
        ].map(([big, small]) => (
          <div key={small}>
            <p className="z-numeric font-display text-[28px] font-semibold text-gold">{big}</p>
            <p className="mt-1 text-[12.5px] text-ink-muted">{small}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const FEATURES: Array<{ title: string; body: string }> = [
  {
    title: 'Frictionless logging',
    body: 'Symbol, entry, exit, stop — live P&L and R-multiple computed as you type. Everything else (setup, emotions, mistakes) is optional and one tap away.',
  },
  {
    title: 'Broker CSV import',
    body: 'Drop any execution export — IBKR, NinjaTrader, Tradovate, generic. Fills are matched into trades, previewed, deduplicated, then committed.',
  },
  {
    title: 'Analytics that answer questions',
    body: 'Equity curve, R distribution, P&L heatmap, breakdowns by setup, symbol, hour and weekday. Find where the edge lives — and where it leaks.',
  },
  {
    title: 'Psychology, quantified',
    body: 'Plan adherence, tagged mistakes, emotional state before/during/after. The honest layer most journals skip is the one that pays.',
  },
  {
    title: 'Prop-firm guardrails',
    body: 'Eval and funded accounts carry their own profit targets and drawdown limits, tracked live so you never blow a challenge by accident.',
  },
  {
    title: 'A journal, not just numbers',
    body: 'Daily plans, recaps, lessons and ideas in markdown, with mood tracking — connected to the trading days they describe.',
  },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-[1100px] px-6 py-20">
      <header className="mx-auto mb-12 max-w-xl text-center">
        <h2 className="font-display text-[30px] font-semibold tracking-tight text-ink">
          Built for the review loop
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-secondary">
          Log → review → adjust. Every screen in ZENITH serves the loop that
          actually improves traders.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <article
            key={f.title}
            className="rounded-lg border border-edge-subtle bg-raised p-5 shadow-inner-light"
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

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    cta: 'Start free',
    highlight: false,
    features: ['50 trades / month', '1 account', 'Core KPIs & equity curve', 'Manual trade logging'],
  },
  {
    name: 'Pro',
    price: '$14.99',
    cadence: 'per month',
    cta: 'Go Pro',
    highlight: true,
    features: [
      'Unlimited trades & accounts',
      'CSV import with dedup',
      'Full analytics & heatmaps',
      'Journal, screenshots & psychology',
      'Prop-firm guardrails',
    ],
  },
  {
    name: 'Lifetime',
    price: '$199',
    cadence: 'one payment',
    cta: 'Own it forever',
    highlight: false,
    features: ['Everything in Pro', 'All future features', 'No subscription, ever'],
  },
];

function Pricing() {
  return (
    <section id="pricing" className="border-t border-edge-subtle bg-raised/40">
      <div className="mx-auto max-w-[1100px] px-6 py-20">
        <header className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="font-display text-[30px] font-semibold tracking-tight text-ink">
            Honest pricing
          </h2>
          <p className="mt-3 text-[14.5px] text-ink-secondary">
            Cheaper than one bad revenge trade.
          </p>
        </header>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {PLANS.map((p) => (
            <article
              key={p.name}
              className={
                p.highlight
                  ? 'relative rounded-xl border border-gold/50 bg-raised p-6 shadow-[0_0_40px_rgba(242,181,68,0.12)]'
                  : 'rounded-xl border border-edge-subtle bg-raised p-6'
              }
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-ink-on-accent">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-[14px] font-semibold uppercase tracking-[0.14em] text-ink-secondary">
                {p.name}
              </h3>
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
                className={
                  p.highlight
                    ? 'mt-6 block rounded-md bg-gold px-4 py-2.5 text-center text-[13.5px] font-semibold text-ink-on-accent transition-colors duration-fast hover:bg-gold-hover'
                    : 'mt-6 block rounded-md border border-edge px-4 py-2.5 text-center text-[13.5px] font-medium text-ink-secondary transition-colors duration-fast hover:border-edge-strong hover:text-ink'
                }
              >
                {p.cta}
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-8 text-center text-[12px] text-ink-faint">
          Prices in USD. Cancel anytime — your data exports with you.
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
        style={{
          background:
            'radial-gradient(ellipse 60% 70% at 50% 100%, rgba(242,181,68,0.1) 0%, transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-[1100px] px-6 py-24 text-center">
        <ZenithMark size={36} className="mx-auto" />
        <h2 className="mt-6 font-display text-[32px] font-semibold tracking-tight text-ink">
          Your next 100 trades deserve a record.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[14.5px] text-ink-secondary">
          The traders who review are the traders who last. Start tonight.
        </p>
        <Link
          href={CTA_HREF}
          className="mt-8 inline-block rounded-md bg-gold px-7 py-3 text-[14px] font-semibold text-ink-on-accent shadow-[0_0_32px_rgba(242,181,68,0.3)] transition-colors duration-fast hover:bg-gold-hover"
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
          <span className="text-[12.5px] text-ink-muted">
            ZENITH — See your edge clearly.
          </span>
        </div>
        <nav className="flex items-center gap-5 text-[12.5px] text-ink-muted">
          <a href="#features" className="hover:text-ink-secondary">Features</a>
          <a href="#pricing" className="hover:text-ink-secondary">Pricing</a>
          <Link href={clerkEnabled ? '/sign-in' : '/dashboard'} className="hover:text-ink-secondary">
            Sign in
          </Link>
        </nav>
        <p className="z-numeric text-[11.5px] text-ink-faint">© 2026 ZENITH</p>
      </div>
    </footer>
  );
}
