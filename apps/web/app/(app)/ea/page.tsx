'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n-context';

/** Per-step gradient — rotating combinations of the Arctic accent palette. */
const STEP_GRADIENTS = [
  'linear-gradient(135deg, #42e2b8, #5b8eff)',
  'linear-gradient(135deg, #5b8eff, #b06eff)',
  'linear-gradient(135deg, #b06eff, #f2a030)',
  'linear-gradient(135deg, #f2a030, #42e2b8)',
  'linear-gradient(135deg, #42e2b8, #b06eff)',
  'linear-gradient(135deg, #5b8eff, #42e2b8)',
  'linear-gradient(135deg, #b06eff, #5b8eff)',
  'linear-gradient(135deg, #42e2b8, #f2a030)',
];

const STEPS = [
  {
    title: 'Créez votre compte Zenith',
    desc: 'Inscrivez-vous sur zenith.trade et activez votre abonnement. Accédez à Paramètres → Intégrations pour générer votre clé API.',
  },
  {
    title: 'Téléchargez le fichier EA',
    desc: 'Cliquez sur le bouton ci-dessus. Vous obtenez ZenithEA.ex5 — le fichier compilé à installer dans MetaTrader 5.',
  },
  {
    title: 'Ouvrez MetaTrader 5',
    desc: 'Lancez MT5 et cliquez sur Fichier → Ouvrir le dossier des données dans la barre de menu.',
  },
  {
    title: "Copiez l'EA dans le dossier Experts",
    desc: "Dans le dossier qui s'ouvre, naviguez vers MQL5 / Experts. Collez-y le fichier ZenithEA.ex5.",
  },
  {
    title: 'Activez le trading automatisé',
    desc: 'Dans MT5, cliquez sur Activer le trading algorithmique dans la barre d’outils.',
  },
  {
    title: "Ajoutez l'EA à un graphique",
    desc: "Dans le Navigateur, faites glisser ZenithEA sur un graphique. Une fenêtre de paramètres s'ouvre.",
  },
  {
    title: 'Entrez votre clé API',
    desc: "Dans les Paramètres d'entrée, collez votre clé API Zenith dans le champ api_key.",
  },
  {
    title: 'Lancez — c’est parti !',
    desc: 'Cliquez OK. Chaque trade est automatiquement transmis vers Zenith en temps réel.',
  },
];

/** Hairline accent across the top of a card. */
function AccentLine({ color = 'rgba(66,226,184,0.55)' }: { color?: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-px"
      style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
    />
  );
}

/** Faint diagonal shine overlay. */
function Shine() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background: 'linear-gradient(135deg, rgba(66,226,184,0.04) 0%, transparent 45%)',
      }}
    />
  );
}

export default function EaPage() {
  const t = useT();

  const FEATURES = [
    {
      title: t('ea_feat_secure'),
      desc: t('ea_feat_secure_desc'),
      color: '#42e2b8',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M10 2.5 4 5v4.5c0 3.7 2.6 6.6 6 8 3.4-1.4 6-4.3 6-8V5l-6-2.5Z" />
          <path d="m7.5 10 1.8 1.8L13 8.2" />
        </svg>
      ),
    },
    {
      title: t('ea_feat_realtime'),
      desc: t('ea_feat_realtime_desc'),
      color: '#5b8eff',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M11 2.5 4.5 11h5L9 17.5 15.5 9h-5l.5-6.5Z" />
        </svg>
      ),
    },
    {
      title: t('ea_feat_history'),
      desc: t('ea_feat_history_desc'),
      color: '#b06eff',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="10" cy="10" r="7" />
          <path d="M10 6v4l2.8 1.8" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Header */}
      <header className="mb-7">
        <h1 className="z-gradient-text font-display text-[26px] font-semibold tracking-tight">
          {t('ea_title')}
        </h1>
        <p className="mt-1.5 text-[13.5px] text-ink-secondary">{t('ea_subtitle')}</p>
      </header>

      {/* Download card */}
      <div className="z-card-glow relative overflow-hidden rounded-lg border border-edge-subtle bg-raised px-6 py-5">
        <AccentLine />
        <Shine />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-md text-ink-on-accent"
              style={{ background: 'var(--z-gradient-solar)' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M10 3v9.5M6 9l4 4 4-4" />
                <path d="M4 16.5h12" />
              </svg>
            </div>
            <div>
              <p className="z-numeric text-[15px] font-semibold text-ink">ZenithEA.ex5</p>
              <p className="mt-0.5 text-[12.5px] text-ink-muted">{t('ea_dl_version')}</p>
            </div>
          </div>
          <a
            href="/downloads/ZenithEA.ex5"
            download
            className="rounded-md bg-gold px-5 py-2.5 text-[13.5px] font-semibold text-ink-on-accent shadow-[0_0_20px_rgba(66,226,184,0.18)] transition-colors duration-fast hover:bg-gold-hover active:bg-gold-active"
          >
            {t('ea_download')}
          </a>
        </div>
      </div>

      {/* Installation steps */}
      <h2 className="mb-4 mt-9 font-display text-[15px] font-semibold uppercase tracking-[0.14em] text-ink-secondary">
        {t('ea_steps_title')}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="relative overflow-hidden rounded-lg border border-edge-subtle bg-raised px-5 py-4 shadow-inner-light"
          >
            <AccentLine />
            <div className="relative flex items-start gap-4">
              <span className="z-step-badge" style={{ background: STEP_GRADIENTS[i] }}>
                {i + 1}
              </span>
              <div>
                <p className="text-[14px] font-semibold text-ink">{step.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">{step.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div className="mt-9 grid grid-cols-1 gap-4 md:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="relative overflow-hidden rounded-lg border border-edge-subtle bg-raised px-5 py-5 shadow-inner-light"
          >
            <AccentLine color={`${f.color}8c`} />
            <Shine />
            <div className="relative">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-md"
                style={{ color: f.color, background: `${f.color}1f` }}
              >
                {f.icon}
              </div>
              <p className="mt-3 text-[14px] font-semibold text-ink">{f.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      <p className="mt-8 text-[12.5px] text-ink-muted">
        {t('ea_note')}{' '}
        <Link href="/settings" className="text-gold underline-offset-2 hover:underline">
          {t('nav_settings')} →
        </Link>
      </p>
    </>
  );
}
