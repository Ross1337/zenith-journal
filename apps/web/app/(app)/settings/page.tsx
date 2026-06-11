'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Field, Input, Select } from '@/components/ui/field';
import { useProfile, useUpdateProfile } from '@/lib/hooks';
import { useT } from '@/lib/i18n-context';

const TIMEZONES = [
  'UTC',
  'Europe/Paris',
  'Europe/London',
  'Europe/Zurich',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Asia/Dubai',
  'Australia/Sydney',
];

export default function SettingsPage() {
  const t = useT();
  const { data: profile, isLoading, isError } = useProfile();
  const update = useUpdateProfile();

  const [displayName, setDisplayName] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? '');
      setTimezone(profile.timezone);
    }
  }, [profile]);

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
    return (
      <div className="py-8 text-center text-[13px] text-ink-muted">
        {t('loading_error')}
      </div>
    );
  }

  const saveProfile = async () => {
    await update.mutateAsync({ displayName: displayName.trim() || null, timezone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-ink">
          {t('settings_title')}
        </h1>
        <p className="mt-1 text-[13px] text-ink-muted">{t('settings_subtitle')}</p>
      </header>

      <div className="max-w-2xl space-y-4">
        <Card>
          <CardHeader title={t('settings_profile')} />
          <div className="space-y-4 px-5 pb-5 pt-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t('settings_display_name')}>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('settings_display_name_placeholder')}
                />
              </Field>
              <Field label={t('settings_email')}>
                <Input value={profile.email ?? '—'} disabled className="opacity-60" />
              </Field>
              <Field label={t('settings_timezone')} hint={t('settings_timezone_hint')}>
                <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t('settings_currency')}>
                <Input value={profile.baseCurrency} disabled className="opacity-60" />
              </Field>
            </div>
            <div className="flex items-center justify-end gap-3">
              {saved && <span className="text-[12px] text-profit">{t('settings_saved')}</span>}
              <button
                type="button"
                onClick={saveProfile}
                disabled={update.isPending}
                className="rounded-md bg-gold px-4 py-2 text-[13px] font-semibold text-ink-on-accent transition-colors duration-fast hover:bg-gold-hover disabled:opacity-60"
              >
                {t('settings_save')}
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title={t('settings_account')} />
          <div className="px-5 pb-5 pt-2">
            <p className="text-[12.5px] leading-relaxed text-ink-muted">
              {t('settings_signed_in')}{' '}
              <span className="z-numeric text-ink-secondary">{profile.id}</span>.{' '}
              Subscription management lives in{' '}
              <a href="/billing" className="text-gold hover:text-gold-hover">
                {t('settings_billing_link')}
              </a>
              .
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
