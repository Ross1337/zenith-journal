'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n-context';

const API_URL = 'http://192.168.1.195:4000/v1';

const STEP_GRADIENTS = [
  'linear-gradient(135deg, #42e2b8, #5b8eff)',
  'linear-gradient(135deg, #5b8eff, #a78bfa)',
  'linear-gradient(135deg, #a78bfa, #fb7185)',
  'linear-gradient(135deg, #fb7185, #2dd4bf)',
  'linear-gradient(135deg, #2dd4bf, #42e2b8)',
  'linear-gradient(135deg, #42e2b8, #a78bfa)',
  'linear-gradient(135deg, #5b8eff, #2dd4bf)',
  'linear-gradient(135deg, #a78bfa, #5b8eff)',
];

const COPY = {
  fr: {
    eyebrow: 'Zenith EA · MQL5',
    title: 'Synchronisez MT4/MT5 automatiquement',
    subtitle:
      'L’Expert Advisor Zenith capture chaque trade depuis MetaTrader et le pousse vers votre journal en temps réel. Gratuit, open source, vérifiable.',
    download: 'Télécharger ZenithEA.ex5',
    dlVersion: 'v1.2.3 · Compatible MT5 Build 3815+ · MT4 dispo',
    whatTitle: 'Qu’est-ce que Zenith EA ?',
    what: [
      { t: 'Expert Advisor MQL5 gratuit', d: 'Installé directement dans MetaTrader 4 ou 5, sur votre machine ou votre VPS.' },
      { t: 'Capture automatique des trades', d: 'Chaque ouverture, modification et clôture est détectée sans aucune action de votre part.' },
      { t: 'Push temps réel vers l’API Zenith', d: 'Vos trades apparaissent dans le journal en quelques secondes.' },
      { t: 'Open source, code vérifiable', d: 'Le code MQL5 est ouvert : auditez exactement ce qui est envoyé.' },
    ],
    stepsTitle: 'Installation en 8 étapes',
    steps: [
      { t: 'Télécharger ZenithEA.ex5', d: 'Cliquez sur le bouton de téléchargement ci-dessus pour récupérer le fichier compilé.' },
      { t: 'Ouvrir le dossier de données', d: 'Dans MT5 : Fichier → Ouvrir le dossier des données.' },
      { t: 'Copier le fichier', d: 'Collez ZenithEA.ex5 dans le dossier MQL5 / Experts.' },
      { t: 'Rafraîchir le Navigator', d: 'Redémarrez MT5, ou faites clic droit → Actualiser sur la section Expert Advisors du Navigator.' },
      { t: 'Glisser-déposer l’EA', d: 'Faites glisser ZenithEA depuis le Navigator sur n’importe quel graphique.' },
      { t: 'Configurer les paramètres', d: `Renseignez API Key, API URL (${API_URL}) et Account ID dans l’onglet Inputs.` },
      { t: 'Autoriser les requêtes', d: 'Outils → Options → Expert Advisors : cochez « Allow WebRequest » et ajoutez l’URL de l’API.' },
      { t: 'Vérifier l’activation', d: 'Le smiley avec chapeau doit apparaître en haut à droite du graphique — l’EA tourne.' },
    ],
    configTitle: 'Configuration',
    configFields: [
      { k: 'API Key', v: 'zk_live_••••••••••••••••', hint: 'Paramètres → Intégrations' },
      { k: 'API URL', v: API_URL, hint: 'URL de l’API Zenith' },
      { k: 'Account ID', v: 'acc_8421', hint: 'Identifiant du compte cible' },
    ],
    configNote:
      'Le mot de passe investisseur (investor / read-only) suffit. Aucun mot de passe maître n’est nécessaire — l’EA ne passe jamais d’ordre.',
    faqTitle: 'Questions fréquentes',
    faq: [
      { q: 'Est-ce que ça impacte mes trades ?', a: 'Non. L’EA est en lecture seule : il observe et transmet, il ne place jamais aucun ordre.' },
      { q: 'Est-ce que ça marche sur MT4 ?', a: 'Oui. Une version MT4 est également disponible, avec la même installation.' },
      { q: 'Est-ce que mon broker le permet ?', a: 'Oui. Tous les brokers autorisent les Expert Advisors en lecture seule, c’est une fonctionnalité standard de MetaTrader.' },
    ],
    secure: 'Lecture seule',
    secureDesc: 'Aucun ordre passé. L’EA observe vos trades, rien de plus.',
    realtime: 'Temps réel',
    realtimeDesc: 'Chaque évènement est transmis instantanément à votre journal.',
    history: 'Historique',
    historyDesc: 'Au premier lancement, tout votre historique est importé.',
    settingsCta: 'Obtenir ma clé API',
  },
  en: {
    eyebrow: 'Zenith EA · MQL5',
    title: 'Sync MT4/MT5 automatically',
    subtitle:
      'The Zenith Expert Advisor captures every trade from MetaTrader and pushes it to your journal in real time. Free, open source, verifiable.',
    download: 'Download ZenithEA.ex5',
    dlVersion: 'v1.2.3 · MT5 Build 3815+ · MT4 available',
    whatTitle: 'What is the Zenith EA?',
    what: [
      { t: 'Free MQL5 Expert Advisor', d: 'Installs straight into MetaTrader 4 or 5, on your machine or VPS.' },
      { t: 'Automatic trade capture', d: 'Every open, modification and close is detected with zero action from you.' },
      { t: 'Real-time push to the Zenith API', d: 'Your trades show up in the journal within seconds.' },
      { t: 'Open source, verifiable code', d: 'The MQL5 source is open — audit exactly what gets sent.' },
    ],
    stepsTitle: '8-step installation',
    steps: [
      { t: 'Download ZenithEA.ex5', d: 'Use the download button above to grab the compiled file.' },
      { t: 'Open the data folder', d: 'In MT5: File → Open Data Folder.' },
      { t: 'Copy the file', d: 'Paste ZenithEA.ex5 into the MQL5 / Experts folder.' },
      { t: 'Refresh the Navigator', d: 'Restart MT5, or right-click → Refresh on the Expert Advisors section of the Navigator.' },
      { t: 'Drag & drop the EA', d: 'Drag ZenithEA from the Navigator onto any chart.' },
      { t: 'Configure the inputs', d: `Fill in API Key, API URL (${API_URL}) and Account ID in the Inputs tab.` },
      { t: 'Allow requests', d: 'Tools → Options → Expert Advisors: check "Allow WebRequest" and add the API URL.' },
      { t: 'Confirm it is running', d: 'The smiley-with-hat icon should appear top-right of the chart — the EA is live.' },
    ],
    configTitle: 'Configuration',
    configFields: [
      { k: 'API Key', v: 'zk_live_••••••••••••••••', hint: 'Settings → Integrations' },
      { k: 'API URL', v: API_URL, hint: 'Zenith API endpoint' },
      { k: 'Account ID', v: 'acc_8421', hint: 'Target account identifier' },
    ],
    configNote:
      'The investor (read-only) password is enough. No master password is required — the EA never places an order.',
    faqTitle: 'Frequently asked',
    faq: [
      { q: 'Does it affect my trades?', a: 'No. The EA is read-only: it observes and transmits, it never places any order.' },
      { q: 'Does it work on MT4?', a: 'Yes. An MT4 build is also available, with the same install flow.' },
      { q: 'Will my broker allow it?', a: 'Yes. Every broker allows read-only Expert Advisors — it is a standard MetaTrader feature.' },
    ],
    secure: 'Read-only',
    secureDesc: 'No orders placed. The EA observes your trades, nothing more.',
    realtime: 'Real-time',
    realtimeDesc: 'Every event is streamed instantly to your journal.',
    history: 'History',
    historyDesc: 'On first launch, your entire history is imported.',
    settingsCta: 'Get my API key',
  },
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
  const { lang } = useI18n();
  const c = COPY[lang];

  const FEATURES = [
    { title: c.secure, desc: c.secureDesc, color: '#2dd4bf' },
    { title: c.realtime, desc: c.realtimeDesc, color: '#5b8eff' },
    { title: c.history, desc: c.historyDesc, color: '#a78bfa' },
  ];

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(45,212,191,0.12) 0%, transparent 70%)' }}
      />

      <section className="relative mx-auto max-w-[1000px] px-6 pb-24 pt-20">
        {/* Hero */}
        <div className="text-center">
          <p className="mb-4 text-[11.5px] uppercase tracking-[0.2em] text-teal">{c.eyebrow}</p>
          <h1 className="z-gradient-text mx-auto max-w-2xl font-display text-[38px] font-semibold leading-[1.1] tracking-tight sm:text-[44px]">
            {c.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-ink-secondary">{c.subtitle}</p>
        </div>

        {/* Download card */}
        <div className="z-card-glow relative mt-10 overflow-hidden rounded-xl border border-edge-subtle bg-raised px-6 py-5">
          <AccentLine />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-on-accent"
                style={{ background: 'var(--z-gradient-solar)' }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M10 3v9.5M6 9l4 4 4-4" />
                  <path d="M4 16.5h12" />
                </svg>
              </div>
              <div>
                <p className="z-numeric text-[15px] font-semibold text-ink">ZenithEA.ex5</p>
                <p className="mt-0.5 text-[12.5px] text-ink-muted">{c.dlVersion}</p>
              </div>
            </div>
            <a
              href="/downloads/ZenithEA.ex5"
              download
              className="rounded-lg bg-gold px-5 py-2.5 text-[13.5px] font-semibold text-ink-on-accent shadow-[0_0_20px_rgba(66,226,184,0.25)] transition-colors hover:bg-gold-hover"
            >
              {c.download}
            </a>
          </div>
        </div>

        {/* Section 1 — What is it */}
        <h2 className="mb-5 mt-16 font-display text-[24px] font-semibold tracking-tight text-ink">{c.whatTitle}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {c.what.map((w) => (
            <div key={w.t} className="rounded-xl border border-edge-subtle bg-raised p-5">
              <p className="text-[14px] font-semibold text-ink">{w.t}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{w.d}</p>
            </div>
          ))}
        </div>

        {/* Feature trio */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="relative overflow-hidden rounded-xl border border-edge-subtle bg-raised p-5">
              <AccentLine color={`${f.color}8c`} />
              <div className="h-8 w-8 rounded-md" style={{ background: `${f.color}26`, border: `1px solid ${f.color}55` }} />
              <p className="mt-3 text-[14px] font-semibold text-ink">{f.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Section 2 — Installation */}
        <h2 className="mb-5 mt-16 font-display text-[24px] font-semibold tracking-tight text-ink">{c.stepsTitle}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {c.steps.map((step, i) => (
            <div key={step.t} className="relative overflow-hidden rounded-xl border border-edge-subtle bg-raised px-5 py-4 shadow-inner-light">
              <div className="relative flex items-start gap-4">
                <span className="z-step-badge" style={{ background: STEP_GRADIENTS[i] }}>
                  {i + 1}
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-ink">{step.t}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">{step.d}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section 3 — Configuration */}
        <h2 className="mb-5 mt-16 font-display text-[24px] font-semibold tracking-tight text-ink">{c.configTitle}</h2>
        <div className="overflow-hidden rounded-xl border border-edge-subtle bg-raised">
          <div className="border-b border-edge-subtle bg-high/40 px-5 py-2.5">
            <span className="z-numeric text-[11.5px] uppercase tracking-[0.14em] text-ink-muted">Inputs · ZenithEA</span>
          </div>
          <div className="divide-y divide-edge-subtle/60">
            {c.configFields.map((field) => (
              <div key={field.k} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5">
                <div>
                  <p className="text-[13px] font-medium text-ink">{field.k}</p>
                  <p className="text-[11.5px] text-ink-faint">{field.hint}</p>
                </div>
                <code className="z-numeric rounded-md border border-edge bg-void px-3 py-1.5 text-[12.5px] text-teal">
                  {field.v}
                </code>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-muted">
          <span className="text-teal">ℹ</span>
          {c.configNote}
        </p>

        {/* Section 4 — FAQ */}
        <h2 className="mb-5 mt-16 font-display text-[24px] font-semibold tracking-tight text-ink">{c.faqTitle}</h2>
        <div className="space-y-3">
          {c.faq.map((item) => (
            <div key={item.q} className="rounded-xl border border-edge-subtle bg-raised px-5 py-4">
              <p className="text-[14px] font-semibold text-ink">{item.q}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">{item.a}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/settings/integrations"
            className="rounded-lg bg-gold px-6 py-2.5 text-[14px] font-semibold text-ink-on-accent shadow-[0_0_24px_rgba(66,226,184,0.3)] transition-colors hover:bg-gold-hover"
          >
            {c.settingsCta}
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-edge px-6 py-2.5 text-[14px] font-medium text-ink-secondary transition-colors hover:border-edge-strong hover:text-ink"
          >
            {lang === 'fr' ? 'Voir les tarifs' : 'See pricing'}
          </Link>
        </div>
      </section>
    </div>
  );
}
