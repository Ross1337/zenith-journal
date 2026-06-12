'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { JournalEntryType, type JournalEntry } from '@zenith/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { Markdown } from '@/lib/markdown';
import { useCreateJournalEntry, useDeleteJournalEntry, useJournal } from '@/lib/hooks';
import { useT } from '@/lib/i18n-context';
import type { TKey } from '@/lib/i18n';

type EntryType = JournalEntry['type'];

const TYPE_LABEL_KEYS: Record<EntryType, TKey> = {
  daily_plan: 'jt_daily_plan',
  daily_recap: 'jt_daily_recap',
  trade_note: 'jt_trade_note',
  idea: 'jt_idea',
  lesson: 'jt_lesson',
  weekly_review: 'jt_weekly_review',
};

const TYPE_TONES: Record<EntryType, string> = {
  daily_plan: 'border-info/40 bg-info/10 text-info',
  daily_recap: 'border-gold/40 bg-gold-wash text-gold',
  trade_note: 'border-edge bg-high text-ink-secondary',
  idea: 'border-ion/40 bg-ion-wash text-ion',
  lesson: 'border-profit/40 bg-profit-wash text-profit',
  weekly_review: 'border-edge-strong bg-overlay text-ink-secondary',
};

export default function JournalPage() {
  const t = useT();
  const [typeFilter, setTypeFilter] = useState<EntryType | 'all'>('all');
  const [composing, setComposing] = useState(false);
  const { data, isLoading } = useJournal(typeFilter === 'all' ? {} : { type: typeFilter });

  const entries = data?.items ?? [];

  return (
    <>
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="z-gradient-text font-display text-[20px] font-semibold tracking-tight lg:text-[22px]">
            {t('jr_title')}
          </h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            {t('jr_subtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setComposing((v) => !v)}
          className="self-start rounded-md bg-gold px-4 py-2 text-[13px] font-semibold text-ink-on-accent transition-colors duration-fast hover:bg-gold-hover"
        >
          {composing ? t('jr_close') : t('jr_new')}
        </button>
      </header>

      {composing && <Composer onDone={() => setComposing(false)} />}

      {/* Type filter */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <FilterChip active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
          {t('jr_all')}
        </FilterChip>
        {JournalEntryType.options.map((opt) => (
          <FilterChip key={opt} active={typeFilter === opt} onClick={() => setTypeFilter(opt)}>
            {t(TYPE_LABEL_KEYS[opt])}
          </FilterChip>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : entries.length === 0 ? (
        <Card>
          <p className="px-5 py-14 text-center text-[13px] text-ink-muted">
            {t('jr_empty')}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <Entry key={e.id} entry={e} />
          ))}
        </div>
      )}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'rounded-md border px-2.5 py-1 text-[12px] font-medium transition-colors duration-fast',
        active
          ? 'border-gold/50 bg-gold-wash text-gold'
          : 'border-edge bg-high text-ink-muted hover:text-ink-secondary',
      )}
    >
      {children}
    </button>
  );
}

function Entry({ entry }: { entry: JournalEntry }) {
  const t = useT();
  const del = useDeleteJournalEntry();
  return (
    <Card>
      <article className="px-5 py-4">
        <header className="flex items-center gap-3">
          <span
            className={clsx(
              'rounded-xs border px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider',
              TYPE_TONES[entry.type],
            )}
          >
            {t(TYPE_LABEL_KEYS[entry.type])}
          </span>
          {entry.title && (
            <h2 className="min-w-0 flex-1 truncate font-display text-[15px] font-semibold text-ink">
              {entry.title}
            </h2>
          )}
          <span className="z-numeric ml-auto whitespace-nowrap text-[11.5px] text-ink-faint">
            {entry.tradingDay ?? entry.createdAt.toISOString().slice(0, 10)}
          </span>
          {entry.mood !== null && <MoodDot mood={entry.mood} />}
          <button
            type="button"
            aria-label="Delete entry"
            onClick={() => del.mutate(entry.id)}
            className="text-ink-faint transition-colors duration-fast hover:text-loss"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 3.5h10M5.5 3.5V2.25A.75.75 0 016.25 1.5h1.5a.75.75 0 01.75.75V3.5m2.25 0v8.25a1 1 0 01-1 1H4.25a1 1 0 01-1-1V3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <div className="mt-2 text-[13.5px] leading-relaxed text-ink-secondary">
          <Markdown>{entry.content}</Markdown>
        </div>
        {entry.tags.length > 0 && (
          <footer className="mt-3 flex flex-wrap gap-1.5">
            {entry.tags.map((t) => (
              <span key={t} className="rounded-xs bg-high px-1.5 py-0.5 text-[11px] text-ink-muted">
                #{t}
              </span>
            ))}
          </footer>
        )}
      </article>
    </Card>
  );
}

function MoodDot({ mood }: { mood: number }) {
  return (
    <span
      title={`Mood ${mood}/5`}
      className={clsx(
        'z-numeric rounded-xs px-1.5 py-0.5 text-[10.5px] font-semibold',
        mood <= 2 ? 'bg-loss-wash text-loss' : mood === 3 ? 'bg-high text-ink-muted' : 'bg-profit-wash text-profit',
      )}
    >
      {mood}/5
    </span>
  );
}

function Composer({ onDone }: { onDone: () => void }) {
  const t = useT();
  const create = useCreateJournalEntry();
  const [type, setType] = useState<EntryType>('daily_plan');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [tradingDay, setTradingDay] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!content.trim()) {
      setError(t('jc_write_first'));
      return;
    }
    try {
      await create.mutateAsync({
        type,
        title: title.trim() || null,
        content: content.trim(),
        mood,
        tradingDay,
        tags: [],
      });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('jc_failed'));
    }
  };

  return (
    <Card className="mb-5">
      <div className="space-y-4 px-5 py-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label={t('jc_type')}>
            <Select value={type} onChange={(e) => setType(e.target.value as EntryType)}>
              {JournalEntryType.options.map((opt) => (
                <option key={opt} value={opt}>
                  {t(TYPE_LABEL_KEYS[opt])}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('jc_title')} className="col-span-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('jc_optional')} />
          </Field>
          <Field label={t('jc_trading_day')}>
            <Input type="date" value={tradingDay} onChange={(e) => setTradingDay(e.target.value)} />
          </Field>
        </div>
        <Field label={t('jc_entry')} hint={t('jc_markdown')}>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[140px]"
            placeholder={'## Bias\nWhat does the day look like?\n\n## Levels\n- …'}
          />
        </Field>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] uppercase tracking-[0.1em] text-ink-muted">{t('jc_mood')}</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMood(mood === n ? null : n)}
                className={clsx(
                  'z-numeric h-7 w-7 rounded-md border text-[12px] transition-colors duration-fast',
                  mood === n
                    ? 'border-gold/50 bg-gold-wash text-gold'
                    : 'border-edge bg-high text-ink-muted hover:border-edge-strong',
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {error && <span className="text-[12px] text-loss">{error}</span>}
            <button
              type="button"
              onClick={submit}
              disabled={create.isPending}
              className="rounded-md bg-gold px-4 py-2 text-[13px] font-semibold text-ink-on-accent transition-colors duration-fast hover:bg-gold-hover disabled:opacity-60"
            >
              {create.isPending ? t('jc_saving') : t('jc_save')}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
