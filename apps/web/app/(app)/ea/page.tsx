'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n-context';

/**
 * Per-step badge gradients — full literal class strings so Tailwind's
 * scanner picks them up. Palette rotates through the solar accents.
 */
const STEP_BADGES = [
  'z-step-badge bg-gradient-to-br from-[#42e2b8] to-[#5b8eff]',
  'z-step-badge bg-gradient-to-br from-[#5b8eff] to-[#a78bfa]',
  'z-step-badge bg-gradient-to-br from-[#a78bfa] to-[#2dd4bf]',
  'z-step-badge bg-gradient-to-br from-[#42e2b8] to-[#5b8eff]',
  'z-step-badge bg-gradient-to-br from-[#42e2b8] to-[#a78bfa]',
  'z-step-badge bg-gradient-to-br from-[#5b8eff] to-[#2dd4bf]',
  'z-step-badge bg-gradient-to-br from-[#a78bfa] to-[#42e2b8]',
  'z-step-badge bg-gradient-to-br from-[#2dd4bf] to-[#5b8eff]',
];

/** Accent hairline color per step — the badge's leading hue at ~55%. */
const STEP_ACCENTS = [
  'rgba(66,226,184,0.55)',
  'rgba(91,142,255,0.55)',
  'rgba(167,139,250,0.55)',
  'rgba(45,212,191,0.55)',
  'rgba(66,226,184,0.55)',
  'rgba(91,142,255,0.55)',
  'rgba(167,139,250,0.55)',
  'rgba(45,212,191,0.55)',
];

const STEPS = {
  fr: [
    {
      t: 'Créez votre compte Zenith',
      d: 'Inscrivez-vous sur zenith.trade et activez votre abonnement. Accédez à Paramètres → Intégrations pour générer votre clé API.',
    },
    {
      t: 'Téléchargez le fichier EA',
      d: 'Cliquez sur le bouton ci-dessus. Vous obtenez ZenithEA.ex5 — le fichier compilé à installer dans MetaTrader 5.',
    },
    {
      t: 'Ouvrez MetaTrader 5',
      d: 'Lancez MT5 et cliquez sur Fichier → Ouvrir le dossier des données dans la barre de menu.',
    },
    {
      t: "Copiez l'EA dans le dossier Experts",
      d: "Dans le dossier qui s'ouvre, naviguez vers MQL5 / Experts. Collez-y le fichier ZenithEA.ex5.",
    },
    {
      t: 'Activez le trading automatisé',
      d: "Dans MT5, cliquez sur Activer le trading algorithmique dans la barre d'outils.",
    },
    {
      t: "Ajoutez l'EA à un graphique",
      d: "Dans le Navigateur, faites glisser ZenithEA sur un graphique. Une fenêtre de paramètres s'ouvre.",
    },
    {
      t: 'Entrez votre clé API',
      d: "Dans les Paramètres d'entrée, collez votre clé API Zenith dans le champ api_key.",
    },
    {
      t: "Lancez — c'est parti !",
      d: 'Cliquez OK. Chaque trade est automatiquement transmis vers Zenith en temps réel.',
    },
  ],
  en: [
    {
      t: 'Create your Zenith account',
      d: 'Sign up on zenith.trade and activate your subscription. Go to Settings → Integrations to generate your API key.',
    },
    {
      t: 'Download the EA file',
      d: 'Click the button above. You get ZenithEA.ex5 — the compiled file to install into MetaTrader 5.',
    },
    {
      t: 'Open MetaTrader 5',
      d: 'Launch MT5 and click File → Open Data Folder in the menu bar.',
    },
    {
      t: 'Copy the EA into the Experts folder',
      d: 'In the folder that opens, navigate to MQL5 / Experts. Paste the ZenithEA.ex5 file there.',
    },
    {
      t: 'Enable automated trading',
      d: 'In MT5, click Enable algorithmic trading in the toolbar.',
    },
    {
      t: 'Add the EA to a chart',
      d: 'In the Navigator, drag ZenithEA onto a chart. A settings window opens.',
    },
    {
      t: 'Enter your API key',
      d: 'In the Input parameters, paste your Zenith API key into the api_key field.',
    },
    {
      t: "Launch — you're live!",
      d: 'Click OK. Every trade is automatically streamed to Zenith in real time.',
    },
  ],
} as const;

function AccentLine({ color = 'rgba(66,226,184,0.55)' }: { color?: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-px"
      style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
    />
  );
}

export default function EaPage() {
  const { t, lang } = useI18n();
  const steps = STEPS[lang];

  const FEATURES = [
    { title: t('ea_feat_secure'), desc: t('ea_feat_secure_desc'), color: '#2dd4bf' },
    { title: t('ea_feat_realtime'), desc: t('ea_feat_realtime_desc'), color: '#5b8eff' },
    { title: t('ea_feat_history'), desc: t('ea_feat_history_desc'), color: '#a78bfa' },
  ];

  return (
    <>
      <header className="mb-6">
        <h1 className="z-gradient-text font-display text-[22px] font-semibold tracking-tight">
          {t('ea_title')}
        </h1>
        <p className="mt-1 text-[13px] text-ink-secondary">{t('ea_subtitle')}</p>
      </header>

      {/* Download card — the hero element, glowing. */}
      <div className="z-card-glow relative overflow-hidden rounded-lg border border-edge-subtle bg-raised px-6 py-5">
        <AccentLine />
        {/* Inner shine */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'var(--card-shine)',
          }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-on-accent"
              style={{ background: 'var(--z-gradient-solar)' }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
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
            className="rounded-md bg-gold px-5 py-2.5 text-[13.5px] font-semibold text-ink-on-accent shadow-[0_0_20px_var(--z-gold-glow)] transition-colors duration-fast hover:bg-gold-hover"
          >
            {t('ea_download')}
          </a>
        </div>
      </div>

      {/* Installation steps */}
      <h2 className="mb-4 mt-10 font-display text-[17px] font-semibold tracking-tight text-ink">
        {t('ea_steps_title')}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {steps.map((step, i) => (
          <div
            key={step.t}
            className="relative overflow-hidden rounded-lg border border-edge-subtle bg-raised px-5 py-4 shadow-inner-light"
          >
            <AccentLine color={STEP_ACCENTS[i]} />
            <div className="flex items-start gap-4">
              <span className={STEP_BADGES[i]}>{i + 1}</span>
              <div>
                <p className="text-[14px] font-semibold text-ink">{step.t}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">{step.d}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feature trio */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="relative overflow-hidden rounded-lg border border-edge-subtle bg-raised p-5"
          >
            <AccentLine color={`${f.color}8c`} />
            <div
              className="h-8 w-8 rounded-md"
              style={{ background: `${f.color}26`, border: `1px solid ${f.color}55` }}
              aria-hidden
            />
            <p className="mt-3 text-[14px] font-semibold text-ink">{f.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* API key note */}
      <p className="mt-8 text-[12.5px] leading-relaxed text-ink-muted">
        {t('ea_note')}{' '}
        <Link href="/settings/integrations" className="font-medium text-gold hover:underline">
          {lang === 'fr' ? 'Ouvrir les paramètres →' : 'Open settings →'}
        </Link>
      </p>
    </>
  );
}
