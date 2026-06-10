'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Field, Input, Select } from '@/components/ui/field';
import { useProfile, useUpdateProfile } from '@/lib/hooks';
import { applyTheme, type Theme } from '@/lib/theme';

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

const THEMES: Array<{ value: Theme; label: string; desc: string }> = [
  { value: 'dark', label: 'Observatory', desc: 'Dark — the default ZENITH night sky' },
  { value: 'light', label: 'Daylight', desc: 'Light — for bright rooms' },
  { value: 'auto', label: 'Auto', desc: 'Follow the system preference' },
];

export default function SettingsPage() {
  const { data: profile, isLoading } = useProfile();
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

  if (isLoading || !profile) {
    return (
      <>
        <header className="mb-6">
          <Skeleton className="h-7 w-44" />
        </header>
        <Skeleton className="h-64" />
      </>
    );
  }

  const saveProfile = async () => {
    await update.mutateAsync({ displayName: displayName.trim() || null, timezone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const setTheme = (theme: Theme) => {
    applyTheme(theme); // instant feedback
    update.mutate({ theme });
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-ink">
          Settings
        </h1>
        <p className="mt-1 text-[13px] text-ink-muted">Profile, timezone and appearance.</p>
      </header>

      <div className="max-w-2xl space-y-4">
        <Card>
          <CardHeader title="Profile" />
          <div className="space-y-4 px-5 pb-5 pt-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Display name">
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we call you?"
                />
              </Field>
              <Field label="Email">
                <Input value={profile.email ?? '—'} disabled className="opacity-60" />
              </Field>
              <Field label="Timezone" hint="charts & day buckets">
                <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Base currency">
                <Input value={profile.baseCurrency} disabled className="opacity-60" />
              </Field>
            </div>
            <div className="flex items-center justify-end gap-3">
              {saved && <span className="text-[12px] text-profit">Saved ✓</span>}
              <button
                type="button"
                onClick={saveProfile}
                disabled={update.isPending}
                className="rounded-md bg-gold px-4 py-2 text-[13px] font-semibold text-ink-on-accent transition-colors duration-fast hover:bg-gold-hover disabled:opacity-60"
              >
                Save changes
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Appearance" />
          <div className="grid grid-cols-1 gap-3 px-5 pb-5 pt-2 sm:grid-cols-3">
            {THEMES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTheme(t.value)}
                className={clsx(
                  'rounded-lg border px-4 py-3 text-left transition-colors duration-fast',
                  profile.theme === t.value
                    ? 'border-gold/50 bg-gold-wash'
                    : 'border-edge bg-high hover:border-edge-strong',
                )}
              >
                <p
                  className={clsx(
                    'font-display text-[13.5px] font-semibold',
                    profile.theme === t.value ? 'text-gold' : 'text-ink',
                  )}
                >
                  {t.label}
                </p>
                <p className="mt-1 text-[11.5px] leading-snug text-ink-muted">{t.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Account" />
          <div className="px-5 pb-5 pt-2">
            <p className="text-[12.5px] leading-relaxed text-ink-muted">
              Signed in as <span className="z-numeric text-ink-secondary">{profile.id}</span>.
              Subscription management lives in{' '}
              <a href="/billing" className="text-gold hover:text-gold-hover">
                Billing
              </a>
              .
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
