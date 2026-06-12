'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ZenithMark } from '@/components/shell/zenith-mark';


const CTA_HREF = "/sign-up";

type Cycle = 'monthly' | 'annual';

/* ── Plan data (faithful to pricing.html) ─────────────────────────── */

type Feat = { txt: React.ReactNode; kind?: 'yes' | 'accent' | 'no'; tag?: string };
type Plan = {
  id: string;
  badge: string;
  badgeClass: string;
  name: string;
  desc: string;
  monthly: number;
  annual: number;
  annualNote: React.ReactNode;
  cta: string;
  ctaKind: 'starter' | 'pro' | 'elite';
  variant?: 'recommended' | 'elite';
  features: Feat[];
};

const PLANS: Plan[] = [
  {
    id: 'starter',
    badge: '⚡ Starter',
    badgeClass: 'badge-starter',
    name: 'Starter',
    desc: 'Parfait pour commencer. CSV rapide, stats essentielles, EA gratuit.',
    monthly: 8.99,
    annual: 7.19,
    annualNote: (
      <>
        soit 86.28€/an — <span className="text-profit font-semibold">économisez 21€</span>
      </>
    ),
    cta: 'Commencer gratuitement',
    ctaKind: 'starter',
    features: [
      { txt: <>Import CSV MT4/MT5 <strong className="text-ink font-medium">illimité</strong></> },
      { txt: <>EA MT5 <strong className="text-ink font-medium">gratuit inclus</strong></> },
      { txt: 'Dashboard P&L, Win Rate, Drawdown' },
      { txt: '1 compte de trading' },
      { txt: 'Trade log + notes' },
      { txt: 'Sync automatique MT5', kind: 'no' },
      { txt: 'Analytics avancées', kind: 'no' },
      { txt: 'Rapport PDF', kind: 'no' },
    ],
  },
  {
    id: 'pro',
    badge: '🔥 Recommandé',
    badgeClass: 'badge-pro',
    name: 'Pro',
    desc: 'Sync automatique en temps réel. La version que 80% de nos traders utilisent.',
    monthly: 14.99,
    annual: 11.99,
    annualNote: (
      <>
        soit 143.88€/an — <span className="text-profit font-semibold">économisez 36€</span>
      </>
    ),
    cta: 'Démarrer en Pro →',
    ctaKind: 'pro',
    variant: 'recommended',
    features: [
      { txt: <><strong className="text-ink font-medium">Tout Starter</strong>, plus :</> },
      { txt: <><strong className="text-ink font-medium">Sync MT5 automatique</strong> — trades importés en temps réel</>, kind: 'accent', tag: 'AUTO' },
      { txt: '3 comptes de trading', kind: 'accent' },
      { txt: 'Analytics : R-multiple, expectancy, heatmap calendrier' },
      { txt: 'Journal de notes enrichi + screenshots' },
      { txt: 'Webhook entrant (intégrations tierces)' },
      { txt: 'Rapport PDF mensuel auto' },
      { txt: 'Support prioritaire', kind: 'no' },
    ],
  },
  {
    id: 'elite',
    badge: '💎 Elite',
    badgeClass: 'badge-elite',
    name: 'Elite',
    desc: 'Pour les traders sérieux. Comptes illimités, support dédié, accès bêta.',
    monthly: 29.99,
    annual: 23.99,
    annualNote: (
      <>
        soit 287.88€/an — <span className="text-profit font-semibold">économisez 72€</span>
      </>
    ),
    cta: "Accéder à l'Elite →",
    ctaKind: 'elite',
    variant: 'elite',
    features: [
      { txt: <><strong className="text-ink font-medium">Tout Pro</strong>, plus :</> },
      { txt: <><strong className="text-ink font-medium">Comptes illimités</strong></>, kind: 'accent' },
      { txt: <><strong className="text-ink font-medium">Support prioritaire</strong> — réponse &lt; 2h</>, kind: 'accent' },
      { txt: 'Accès bêta aux nouvelles features', kind: 'accent' },
      { txt: 'Dashboard personnalisable (widgets, layout)' },
      { txt: 'Rapport PDF hebdomadaire automatisé' },
      { txt: 'Export API — vos données partout' },
      { txt: 'Onboarding 1:1 à la demande' },
    ],
  },
];

const STEPS: { n: number; title: string; desc: React.ReactNode; code?: string; final?: boolean; highlight?: boolean }[] = [
  { n: 1, title: 'Télécharger ZenithBridge.ex5', desc: 'Cliquez sur le bouton ci-dessus. Votre clé API Zenith est générée automatiquement dans votre espace.' },
  { n: 2, title: 'Ouvrir le dossier données MT5', desc: <>Dans MT5 → <strong>Fichier → Ouvrir le dossier des données</strong>.</>, code: 'Fichier → Ouvrir dossier données' },
  { n: 3, title: "Copier l'EA dans MQL5/Experts", desc: <>Glissez <code className="font-mono text-accent">ZenithBridge.ex5</code> dans le dossier :</>, code: 'MQL5 / Experts /' },
  { n: 4, title: 'Rafraîchir le Navigateur MT5', desc: <>Panneau Navigateur → clic droit sur <strong>Expert Advisors</strong> → <strong>Actualiser</strong>.</> },
  { n: 5, title: "Glisser l'EA sur n'importe quel chart", desc: <>Faites glisser <strong>ZenithBridge</strong> depuis le Navigateur sur un graphique ouvert.</>, highlight: true },
  { n: 6, title: 'Entrer votre clé API Zenith', desc: <>Collez votre <strong>API Key</strong> dans la fenêtre de configuration.</>, code: 'Zenith → Paramètres → Intégrations → Copier la clé', highlight: true },
  { n: 7, title: 'Activer le trading algorithmique', desc: <>Activez le bouton <strong>« Activer le trading algorithmique »</strong>. L'icône EA doit être verte.</> },
  { n: 8, title: "C'est tout. ✅", desc: 'Vos trades suivants sont envoyés automatiquement à Zenith. L’historique passé est importable via CSV une seule fois.', final: true },
];

const COMPARE: { cat?: string; name?: string; cells?: React.ReactNode[] }[] = [
  { cat: 'Import & Synchronisation' },
  { name: 'Import CSV MT4/MT5', cells: [<Tick />, <Tick />, <Tick />] },
  { name: 'EA MT5 (sync auto)', cells: [<><Tick /> <span className="text-ink-faint text-[0.7rem]">gratuit</span></>, <><Tick /> <span className="text-ink text-[0.8rem] font-medium">temps réel</span></>, <><Tick /> <span className="text-ink text-[0.8rem] font-medium">temps réel</span></>] },
  { name: 'Webhook entrant', cells: [<Cross />, <Tick />, <Tick />] },
  { name: 'Export API', cells: [<Cross />, <Cross />, <Tick />] },
  { cat: 'Analytics' },
  { name: 'P&L, Win Rate, Drawdown', cells: [<Tick />, <Tick />, <Tick />] },
  { name: 'R-multiple & Expectancy', cells: [<Cross />, <Tick />, <Tick />] },
  { name: 'Heatmap calendrier', cells: [<Cross />, <Tick />, <Tick />] },
  { name: 'Rapport PDF auto', cells: [<Cross />, <span className="text-ink text-[0.8rem] font-medium">mensuel</span>, <span className="text-ink text-[0.8rem] font-medium">hebdo</span>] },
  { cat: 'Comptes & Limites' },
  { name: 'Comptes de trading', cells: [<Val>1</Val>, <Val>3</Val>, <Val>Illimité</Val>] },
  { name: 'Historique conservé', cells: [<Val>1 an</Val>, <Val>3 ans</Val>, <Val>Illimité</Val>] },
  { cat: 'Support' },
  { name: 'Support email', cells: [<Tick />, <Tick />, <Tick />] },
  { name: 'Support prioritaire (<2h)', cells: [<Cross />, <Cross />, <Tick />] },
  { name: 'Accès bêta', cells: [<Cross />, <Cross />, <Tick />] },
];

const FAQ: { q: string; a: string }[] = [
  { q: "L'EA MT5 est-il disponible sur Starter ?", a: "Oui. L'EA est gratuit sur tous les plans. En Starter il envoie les trades mais la sync est manuelle (CSV). En Pro+, la sync est automatique en temps réel." },
  { q: "Ai-je besoin d'un VPS pour la sync auto ?", a: "Non. L'EA tourne sur votre propre MT5. Tant que votre terminal est ouvert, vos trades arrivent sur Zenith en temps réel." },
  { q: "L'EA peut-il passer des ordres sur mon compte ?", a: "Non. L'EA est en lecture seule. Il lit vos trades exécutés et les envoie à Zenith. Aucun accès à votre capital ni à vos ordres." },
  { q: 'Puis-je changer de plan à tout moment ?', a: 'Oui. Upgrade ou downgrade immédiat depuis votre espace. Aucun engagement, remboursement au prorata automatique.' },
  { q: 'Comment importer mon historique existant ?', a: 'Dans MT5 : Fichier → Rapport de compte → Exporter en CSV, puis importez dans Zenith. Opération unique, après quoi l’EA prend le relais.' },
  { q: 'Compatible avec quels brokers ?', a: "Tous les brokers proposant MetaTrader 5. L'EA utilise les API standard MT5, il n'est pas lié à un broker spécifique." },
];

function Tick() {
  return <span className="text-profit text-base">✓</span>;
}
function Cross() {
  return <span className="text-ink-faint text-base">—</span>;
}
function Val({ children }: { children: React.ReactNode }) {
  return <span className="text-ink text-[0.8rem] font-medium">{children}</span>;
}

function fmt(n: number) {
  return n.toFixed(2);
}

export default function PricingPage() {
  const [cycle, setCycle] = useState<Cycle>('monthly');

  return (
    <div className="mx-auto max-w-[1100px] px-6 pb-20 sm:px-8">
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

        <h1 className="relative font-display text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.025em] text-ink">
          Le journal de trading
          <br />
          <span className="z-gradient-text">qui travaille avec vous.</span>
        </h1>
        <p className="relative mx-auto mt-3 max-w-[480px] text-[1.05rem] text-ink-secondary">
          Analysez vos trades. Automatisez votre sync MT5. Trouvez votre edge.
        </p>

        {/* Billing toggle */}
        <div className="relative mt-7 inline-flex items-center gap-2.5 rounded-[30px] border border-edge bg-high p-[5px]">
          {(['monthly', 'annual'] as Cycle[]).map((cy) => (
            <button
              key={cy}
              onClick={() => setCycle(cy)}
              className={`rounded-[24px] px-[18px] py-1.5 text-[0.825rem] font-medium transition-all ${
                cycle === cy ? 'border border-edge-strong bg-hover text-ink' : 'text-ink-secondary'
              }`}
            >
              {cy === 'monthly' ? 'Mensuel' : 'Annuel'}
              {cy === 'annual' && (
                <span className="ml-1.5 rounded-lg bg-profit-wash px-1.5 py-px text-[0.65rem] font-semibold text-profit">
                  −20%
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom hairline */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[10%] bottom-0 h-px opacity-40"
          style={{ background: 'linear-gradient(90deg, transparent, var(--primary), var(--accent), transparent)' }}
        />
      </section>

      {/* ═══════════ PLAN CARDS ═══════════ */}
      <div className="mt-12 grid grid-cols-1 items-start gap-4 md:grid-cols-[1fr_1.05fr_1fr]">
        {PLANS.map((p) => {
          const recommended = p.variant === 'recommended';
          const elite = p.variant === 'elite';
          return (
            <div
              key={p.id}
              className={`z-shine group relative overflow-hidden rounded-2xl border p-7 transition-all duration-200 ${
                recommended
                  ? 'z-card-glow -translate-y-1.5 bg-hover hover:-translate-y-2'
                  : 'border-edge bg-high hover:-translate-y-0.5 hover:border-edge-strong'
              } ${elite ? 'border-edge-strong' : ''}`}
            >
              {/* top accent hairline for recommended / elite */}
              {recommended && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-80"
                  style={{ background: 'linear-gradient(90deg, transparent, var(--recommended-border), transparent)' }}
                />
              )}
              {elite && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-50"
                  style={{ background: 'linear-gradient(90deg, transparent, var(--violet), var(--accent), transparent)' }}
                />
              )}

              <div className="relative">
                <Badge plan={p} />
                <div className="font-display text-[1.375rem] font-bold tracking-[-0.01em] text-ink">{p.name}</div>
                <p className="mt-1.5 text-[0.8125rem] leading-snug text-ink-secondary">{p.desc}</p>

                <div className="z-numeric mt-6 flex items-baseline gap-1.5">
                  <span className="self-start pt-1.5 text-[1.25rem] font-semibold text-ink-secondary">€</span>
                  <span className="font-display text-[2.5rem] font-extrabold leading-none tracking-[-0.03em] text-ink">
                    {fmt(cycle === 'monthly' ? p.monthly : p.annual)}
                  </span>
                  <span className="text-[0.8125rem] text-ink-faint">/mois</span>
                </div>
                <div className="mb-6 mt-1 min-h-[18px] text-[0.75rem] text-ink-faint">
                  {cycle === 'annual' ? p.annualNote : ' '}
                </div>

                <CtaButton kind={p.ctaKind}>{p.cta}</CtaButton>

                <div className="my-5 h-px bg-edge" />

                <ul className="flex flex-col gap-2.5">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[0.8125rem] leading-snug">
                      <FeatureCheck kind={f.kind} />
                      <span className={f.kind === 'no' ? 'text-ink-faint' : 'text-ink-secondary'}>
                        {f.txt}
                        {f.tag && (
                          <span className="ml-1 rounded bg-[var(--accent-dim)] px-1.5 py-px text-[0.6rem] font-bold uppercase tracking-wider text-accent">
                            {f.tag}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* TRUST STRIP */}
      <div className="mt-9 flex flex-wrap items-center justify-center gap-6 rounded-xl border border-edge bg-surface p-4">
        {[
          ['🔒', 'SSL + données chiffrées'],
          ['↩️', 'Annulation à tout moment'],
          ['💳', 'Paiement sécurisé Stripe'],
          ['📧', 'Onboarding par email inclus'],
        ].map(([icon, label]) => (
          <div key={label} className="flex items-center gap-2 text-[0.8rem] text-ink-secondary">
            <span className="text-base">{icon}</span> {label}
          </div>
        ))}
      </div>


      {/* ═══════════ AFFILIATE LIFETIME ═══════════ */}
      <section className="mt-12" id="affiliate">
        <div className="z-shine relative overflow-hidden rounded-2xl border p-px transition-all duration-200"
          style={{ background: 'linear-gradient(135deg, var(--primary-glow), var(--accent-glow), rgba(65,224,163,0.3))' }}>
          <div className="relative overflow-hidden rounded-[14px] bg-high px-7 py-8">
            {/* Orb bg */}
            <div className="pointer-events-none absolute right-[-60px] top-[-60px] h-[200px] w-[200px] rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, var(--profit) 0%, transparent 70%)' }} />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
              {/* Left content */}
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(65,224,163,0.3)] bg-profit-wash px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-profit">
                    🎁 Offre Partenaires
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[rgba(65,224,163,0.2)] bg-profit-wash px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-profit">
                    GRATUIT — 0€
                  </span>
                </div>
                <h3 className="font-display text-[1.25rem] font-bold tracking-[-0.015em] text-ink">
                  Accès Lifetime via dépôt affilié
                </h3>
                <p className="mt-1.5 text-[0.8375rem] leading-relaxed text-ink-secondary">
                  Déposez chez l'un de nos brokers partenaires et obtenez l'accès{' '}
                  <strong className="text-ink">Lifetime Zenith Elite gratuitement</strong> — sans aucun abonnement mensuel, à vie.
                </p>

                {/* Broker logos */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-[0.7rem] font-medium text-ink-faint">Brokers partenaires :</span>
                  {['Vantage Markets', 'ThinkMarkets', 'IC Markets', 'Pepperstone'].map((b) => (
                    <span
                      key={b}
                      className="rounded-md border border-edge bg-surface px-2.5 py-1 text-[0.7rem] font-medium text-ink-secondary"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right CTA */}
              <div className="flex flex-col items-center gap-2.5 md:items-end">
                <div className="text-center md:text-right">
                  <div className="font-display text-[2rem] font-extrabold leading-none tracking-[-0.03em] text-profit">0€</div>
                  <div className="text-[0.75rem] text-ink-faint">pour toujours</div>
                </div>
                <Link
                  href="/affiliate"
                  className="mt-1 inline-flex items-center gap-2 rounded-[10px] px-6 py-2.5 text-[0.875rem] font-bold transition-all hover:opacity-90 hover:-translate-y-px"
                  style={{ background: 'var(--btn-primary)', color: 'var(--btn-primary-text)', boxShadow: '0 0 20px var(--primary-glow)' }}
                >
                  En savoir plus →
                </Link>
                <p className="text-[0.7rem] text-ink-faint">Dépôt min. ~200$ · Activation sous 24h</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ EA INSTALL ═══════════ */}
      <section className="relative mt-24" id="ea-install">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-11 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--z-border-strong), transparent)' }}
        />
        <p className="mb-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-[var(--step-accent)]">
          Expert Advisor · MT5
        </p>
        <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-tight tracking-[-0.02em] text-ink">
          Sync automatique en <span className="z-gradient-text">3 minutes</span>
        </h2>
        <p className="mb-10 mt-3 max-w-[520px] text-[0.9375rem] text-ink-secondary">
          Notre EA MT5 envoie vos trades à Zenith en temps réel, sans VPS, sans serveur. Il tourne sur votre propre MT5.
        </p>

        {/* Download card */}
        <div className="z-shine relative mb-9 flex flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border border-edge-strong bg-high p-6 sm:flex-row">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-50"
            style={{ background: 'linear-gradient(90deg, transparent, var(--primary), var(--accent), transparent)' }}
          />
          <div className="relative flex items-center gap-4">
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl border border-[var(--primary-glow)] bg-[var(--primary-dim)] text-2xl">
              📦
            </div>
            <div>
              <div className="font-display text-[1.05rem] font-bold text-ink">ZenithBridge.ex5</div>
              <div className="mt-0.5 flex flex-wrap gap-3 text-[0.75rem] text-ink-secondary">
                <span>📐 v2.1.0</span>
                <span>⚖️ 48 KB</span>
                <span>✅ MT5 Build 4000+</span>
                <span>🔒 Signé &amp; vérifié</span>
              </div>
            </div>
          </div>
          <button
            className="relative flex items-center gap-2 whitespace-nowrap rounded-[10px] px-6 py-2.5 text-[0.875rem] font-bold transition-opacity hover:opacity-90"
            style={{ background: 'var(--btn-primary)', color: 'var(--btn-primary-text)' }}
          >
            ⬇️ Télécharger l'EA
          </button>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className={`z-shine relative flex gap-4 overflow-hidden rounded-[14px] border p-5 transition-all duration-200 hover:-translate-y-px hover:border-edge-strong ${
                s.highlight ? 'border-edge-strong bg-hover' : 'border-edge bg-high'
              }`}
            >
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[var(--primary-glow)] bg-[var(--primary-dim)] font-display text-[0.8125rem] font-bold text-[var(--step-accent)]">
                {s.n}
              </div>
              <div className="relative flex-1">
                <div className="mb-1 text-[0.9rem] font-semibold text-ink">{s.title}</div>
                <div className="text-[0.7875rem] leading-snug text-ink-secondary">{s.desc}</div>
                {s.code && (
                  <div className="mt-1.5 inline-block rounded-md border border-edge-strong bg-void px-2.5 py-1 font-mono text-[0.72rem] text-accent">
                    {s.code}
                  </div>
                )}
                {s.final && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[rgba(65,224,163,0.25)] bg-profit-wash px-2.5 py-1 text-[0.72rem] font-semibold text-profit">
                    ✅ Trades synchronisés en temps réel
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="mt-6 flex flex-wrap gap-3">
          <NoteCard accent="primary" title="💡 Sans VPS">
            L'EA tourne sur votre MT5 local. Aucun serveur externe. Les trades sont envoyés dès leur clôture tant que MT5 est ouvert.
          </NoteCard>
          <NoteCard accent="accent" title="🔒 Read-only">
            L'EA est en lecture seule. Il envoie les données vers Zenith mais n'a aucun accès aux ordres ni à votre capital.
          </NoteCard>
          <NoteCard accent="profit" title="📁 Historique">
            Pour vos trades passés, utilisez Fichier → Exporter historique dans MT5, puis importez le CSV dans Zenith.
          </NoteCard>
        </div>
      </section>

      {/* ═══════════ COMPARE ═══════════ */}
      <section className="mt-24" id="compare">
        <div
          aria-hidden
          className="mb-16 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--z-border-strong), transparent)' }}
        />
        <p className="mb-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-[var(--step-accent)]">
          Comparaison détaillée
        </p>
        <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.02em] text-ink">
          Ce qui est inclus
        </h2>

        <table className="mt-6 w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-b border-edge px-5 py-3.5 text-left text-[0.825rem] font-semibold text-ink-secondary">
                Fonctionnalité
              </th>
              {[
                ['Starter', '8.99€/mois', 'text-ink'],
                ['Pro', '14.99€/mois', 'text-[var(--tag-rec)]'],
                ['Elite', '29.99€/mois', 'text-violet'],
              ].map(([n, price, cls]) => (
                <th key={n} className={`border-b border-edge px-5 py-3.5 text-center font-display text-[0.9rem] font-semibold ${cls}`}>
                  {n}
                  <br />
                  <small className="font-normal text-ink-faint">{price}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE.map((row, i) =>
              row.cat ? (
                <tr key={i} className="category-row">
                  <td colSpan={4} className="bg-surface px-5 pb-2 pt-5 text-[0.65rem] font-bold uppercase tracking-[0.09em] text-[var(--step-accent)]">
                    {row.cat}
                  </td>
                </tr>
              ) : (
                <tr key={i} className="transition-colors hover:bg-high">
                  <td className="border-b border-edge px-5 py-3 text-[0.8125rem] text-ink">{row.name}</td>
                  {row.cells!.map((cell, j) => (
                    <td key={j} className="border-b border-edge px-5 py-3 text-center text-[0.8125rem]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="mt-24">
        <div
          aria-hidden
          className="mb-16 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--z-border-strong), transparent)' }}
        />
        <p className="mb-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-[var(--step-accent)]">FAQ</p>
        <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-bold tracking-[-0.02em] text-ink">
          Questions fréquentes
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {FAQ.map((f) => (
            <div key={f.q}>
              <div className="mb-1.5 flex gap-2.5 text-[0.9rem] font-semibold text-ink">
                <span className="font-bold text-[var(--step-accent)]">Q</span>
                {f.q}
              </div>
              <p className="pl-[22px] text-[0.8125rem] leading-relaxed text-ink-secondary">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FOOTER CTA ═══════════ */}
      <div className="z-shine relative mt-24 overflow-hidden rounded-[20px] border border-edge-strong bg-high px-8 py-16 text-center">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'var(--hero-grad)' }} />
        <h2 className="relative font-display text-[2rem] font-bold tracking-[-0.02em] text-ink">Prêt à voir votre edge ?</h2>
        <p className="relative mx-auto mt-3 max-w-[420px] text-ink-secondary">
          Rejoignez les traders qui utilisent Zenith pour analyser, optimiser, et progresser.
        </p>
        <div className="relative mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={CTA_HREF}
            className="rounded-[11px] px-7 py-3 text-[0.9375rem] font-bold transition-opacity hover:opacity-90"
            style={{ background: 'var(--btn-primary)', color: 'var(--btn-primary-text)' }}
          >
            Commencer en Pro — 14.99€/mois →
          </Link>
          <a
            href="#ea-install"
            className="rounded-[11px] border border-edge-strong px-7 py-3 text-[0.9375rem] font-medium text-ink-secondary transition-colors hover:border-gold hover:text-gold"
          >
            Voir la démo
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Small pieces ─────────────────────────────────────────────────── */

function Badge({ plan }: { plan: Plan }) {
  const base = 'mb-4 inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.07em]';
  if (plan.badgeClass === 'badge-pro')
    return (
      <span className={`${base} border-[var(--recommended-glow)] bg-[var(--tag-rec-bg)] text-[var(--tag-rec)]`}>{plan.badge}</span>
    );
  if (plan.badgeClass === 'badge-elite')
    return <span className={`${base} border-[rgba(139,124,246,0.2)] bg-[rgba(139,124,246,0.1)] text-violet`}>{plan.badge}</span>;
  return <span className={`${base} border-[var(--primary-glow)] bg-[var(--primary-dim)] text-gold`}>{plan.badge}</span>;
}

function FeatureCheck({ kind }: { kind?: Feat['kind'] }) {
  const base = 'mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px]';
  if (kind === 'no') return <span className={`${base} bg-white/[0.03] text-ink-faint`}>—</span>;
  if (kind === 'accent') return <span className={`${base} bg-[var(--accent-dim)] text-accent`}>✓</span>;
  return <span className={`${base} bg-[var(--primary-dim)] text-gold`}>✓</span>;
}

function CtaButton({ kind, children }: { kind: Plan['ctaKind']; children: React.ReactNode }) {
  if (kind === 'pro')
    return (
      <Link
        href={CTA_HREF}
        className="block w-full rounded-[10px] py-2.5 text-center text-[0.875rem] font-semibold transition-opacity hover:opacity-90"
        style={{ background: 'var(--btn-primary)', color: 'var(--btn-primary-text)', boxShadow: '0 0 24px var(--primary-glow)' }}
      >
        {children}
      </Link>
    );
  if (kind === 'elite')
    return (
      <Link
        href={CTA_HREF}
        className="block w-full rounded-[10px] py-2.5 text-center text-[0.875rem] font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: 'var(--btn-elite)' }}
      >
        {children}
      </Link>
    );
  return (
    <Link
      href={CTA_HREF}
      className="block w-full rounded-[10px] border border-edge-strong py-2.5 text-center text-[0.875rem] font-semibold text-ink-secondary transition-colors hover:border-gold hover:text-gold"
    >
      {children}
    </Link>
  );
}

function NoteCard({ accent, title, children }: { accent: 'primary' | 'accent' | 'profit'; title: string; children: React.ReactNode }) {
  const map = {
    primary: { bg: 'var(--primary-dim)', bd: 'var(--primary-glow)', tc: 'var(--primary)' },
    accent: { bg: 'var(--accent-dim)', bd: 'var(--accent-glow)', tc: 'var(--accent)' },
    profit: { bg: 'rgba(65,224,163,0.06)', bd: 'rgba(65,224,163,0.15)', tc: 'var(--profit)' },
  }[accent];
  return (
    <div
      className="min-w-[220px] flex-1 rounded-[10px] border p-4 text-[0.78rem] leading-relaxed text-ink-secondary"
      style={{ background: map.bg, borderColor: map.bd }}
    >
      <strong className="mb-1 block" style={{ color: map.tc }}>
        {title}
      </strong>
      {children}
    </div>
  );
}
