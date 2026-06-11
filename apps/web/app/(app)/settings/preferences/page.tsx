'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile, useUpdateProfile } from '@/lib/hooks';
import { applyTheme, type Theme } from '@/lib/theme';
import { ThemeSwitcher } from '@/components/shell/theme-switcher';
import { useI18n } from '@/lib/i18n-context';
import type { Lang } from '@/lib/i18n';

const NOTIF_KEY = 'zenith.notifications';
type Notifs = { email: boolean; product: boolean };

export default function PreferencesPage() {
  const { t, lang, setLang } = useI18n();
  const { data: profile, isLoading, isError } = useProfile();
  const update = useUpdateProfile();

  const [notifs, setNotifs] = useState<Notifs>({ email: true, product: true });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(NOTIF_KEY);
      if (raw) setNotifs({ email: true, product: true, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  const toggleNotif = (key: keyof Notifs) => {
    setNotifs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        window.localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const setTheme = (theme: Theme) => {
    applyTheme(theme); // instant feedback
    update.mutate({ theme });
  };

  const THEMES: Array<{ value: Theme; label: string; desc: string }> = [
    { value: 'dark', label: t('settings_theme_dark_label'), desc: t('settings_theme_dark_desc') },
    { value: 'light', label: t('settings_theme_light_label'), desc: t('settings_theme_light_desc') },
    { value: 'auto', label: t('settings_theme_auto_label'), desc: t('settings_theme_auto_desc') },
  ];

  const LANGS: Array<{ value: Lang; label: string; flag: string }> = [
    { value: 'fr', label: t('settings_lang_fr'), flag: '🇫🇷' },
    { value: 'en', label: t('settings_lang_en'), flag: '🇬🇧' },
  ];

  if (isLoading) {
    return (
      <>
        <header className="mb-6">
          <Skeleton className="h-7 w-44" />
        </header>
        <Skeleton className="h-64" />
      </>
    );
  }

  if (isError || !profile) {
    return <div className="py-8 text-center text-[13px] text-ink-muted">{t('loading_error')}</div>;
  }

  return (
    <>
      <header className="mb-6">
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-ink">
          {t('settings_preferences')}
        </h1>
        <p className="mt-1 text-[13px] text-ink-muted">{t('settings_preferences_subtitle')}</p>
      </header>

      <div className="max-w-2xl space-y-4">
        {/* Language */}
        <Card>
          <CardHeader title={t('settings_language')} hint={t('settings_language_hint')} />
          <div className="grid grid-cols-2 gap-3 px-5 pb-5 pt-2">
            {LANGS.map((lng) => (
              <button
                key={lng.value}
                type="button"
                onClick={() => setLang(lng.value)}
                className={clsx(
                  'flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors duration-fast',
                  lang === lng.value
                    ? 'border-gold/50 bg-gold-wash'
                    : 'border-edge bg-high hover:border-edge-strong',
                )}
              >
                <span className="text-[20px]" aria-hidden>
                  {lng.flag}
                </span>
                <span
                  className={clsx(
                    'font-display text-[13.5px] font-semibold',
                    lang === lng.value ? 'text-gold' : 'text-ink',
                  )}
                >
                  {lng.label}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader title={t('settings_appearance')} />
          <div className="grid grid-cols-1 gap-3 px-5 pb-5 pt-2 sm:grid-cols-3">
            {THEMES.map((th) => (
              <button
                key={th.value}
                type="button"
                onClick={() => setTheme(th.value)}
                className={clsx(
                  'rounded-lg border px-4 py-3 text-left transition-colors duration-fast',
                  profile.theme === th.value
                    ? 'border-gold/50 bg-gold-wash'
                    : 'border-edge bg-high hover:border-edge-strong',
                )}
              >
                <p
                  className={clsx(
                    'font-display text-[13.5px] font-semibold',
                    profile.theme === th.value ? 'text-gold' : 'text-ink',
                  )}
                >
                  {th.label}
                </p>
                <p className="mt-1 text-[11.5px] leading-snug text-ink-muted">{th.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Brand color theme — Cosmos / Ember / Arctic */}
        <Card>
          <CardHeader
            title={lang === 'fr' ? 'Thème de couleur' : 'Color theme'}
            hint={lang === 'fr' ? 'Repeint toute l’application' : 'Repaints the whole app'}
          />
          <div className="px-5 pb-5 pt-3">
            <ThemeSwitcher variant="full" />
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader title={t('settings_notifications')} />
          <div className="divide-y divide-edge-subtle/60 px-5 pb-2 pt-1">
            <NotifRow
              label={t('settings_notif_email')}
              desc={t('settings_notif_email_desc')}
              on={notifs.email}
              onToggle={() => toggleNotif('email')}
            />
            <NotifRow
              label={t('settings_notif_product')}
              desc={t('settings_notif_product_desc')}
              on={notifs.product}
              onToggle={() => toggleNotif('product')}
            />
          </div>
        </Card>
      </div>
    </>
  );
}

function NotifRow({
  label,
  desc,
  on,
  onToggle,
}: {
  label: string;
  desc: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <p className="text-[13.5px] font-medium text-ink">{label}</p>
        <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={onToggle}
        className={clsx(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-base',
          on ? 'bg-gold' : 'bg-edge-strong',
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-base',
            on ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
}
