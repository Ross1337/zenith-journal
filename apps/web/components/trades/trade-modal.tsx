'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import clsx from 'clsx';
import {
  Direction,
  InstrumentType,
  MarketCondition,
  TradeGrade,
  TradeMistake,
  TradingSession,
  type CreateTradeInput,
} from '@zenith/types';
import { grossPnl, netPnl, rPlanned, rRealized } from '@zenith/calc';
import { Chip, Field, Input, SegmentedControl, Select, Textarea } from '@/components/ui/field';
import { useAccounts, useApi, useCreateTrade } from '@/lib/hooks';
import { useUiStore } from '@/lib/store';
import { fmtPnl, fmtR, pnlTone } from '@/lib/format';

/**
 * Log Trade — the single most important interaction in ZENITH.
 * Target: a closed trade captured in under 30 seconds. Essentials on top,
 * context & psychology below, live P&L/R preview as numbers are typed.
 */

const MISTAKE_LABELS: Record<TradeMistake, string> = {
  late_entry: 'Late entry',
  no_stop: 'No stop',
  early_exit: 'Early exit',
  oversized: 'Oversized',
  revenge: 'Revenge trade',
  fomo: 'FOMO',
  moved_stop: 'Moved stop',
  overtrading: 'Overtrading',
  against_plan: 'Against plan',
};

const SESSION_LABELS: Record<z.infer<typeof TradingSession>, string> = {
  asia: 'Asia',
  london: 'London',
  newyork: 'New York',
  overlap: 'Overlap',
  other: 'Other',
};

// Form-level schema: numeric inputs arrive as strings (HTML), converted on submit.
const num = (msg: string) =>
  z.string().min(1, msg).refine((v) => Number.isFinite(Number(v)) && Number(v) > 0, msg);
const optNum = z
  .string()
  .refine((v) => v === '' || (Number.isFinite(Number(v)) && Number(v) > 0), 'Invalid number');
const optNonNeg = z
  .string()
  .refine((v) => v === '' || (Number.isFinite(Number(v)) && Number(v) >= 0), 'Invalid number');

const FormSchema = z
  .object({
    accountId: z.string().min(1, 'Pick an account'),
    symbol: z.string().min(1, 'Required').max(32),
    instrumentType: InstrumentType,
    direction: Direction,
    qty: num('Qty > 0'),
    avgEntry: num('Entry > 0'),
    avgExit: optNum,
    initialStop: optNum,
    target: optNum,
    openedAt: z.string().min(1, 'Required'),
    closedAt: z.string(),
    commissionTotal: optNonNeg,
    feesTotal: optNonNeg,
    setup: z.string().max(80),
    session: z.union([TradingSession, z.literal('')]),
    timeframe: z.string().max(16),
    marketCondition: z.union([MarketCondition, z.literal('')]),
    followedPlan: z.enum(['unset', 'yes', 'no']),
    mistakes: z.array(TradeMistake),
    emotionPre: z.number().int().min(1).max(5).nullable(),
    emotionDuring: z.number().int().min(1).max(5).nullable(),
    emotionPost: z.number().int().min(1).max(5).nullable(),
    grade: z.union([TradeGrade, z.literal('')]),
    tags: z.string(),
    notes: z.string(),
  })
  .refine((v) => !(v.avgExit !== '' && v.closedAt === ''), {
    message: 'Closed time required when an exit is set',
    path: ['closedAt'],
  })
  .refine((v) => !(v.closedAt !== '' && v.openedAt !== '' && v.closedAt < v.openedAt), {
    message: 'Must be after open',
    path: ['closedAt'],
  });

type FormValues = z.infer<typeof FormSchema>;

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaults(accountId: string): FormValues {
  return {
    accountId,
    symbol: '',
    instrumentType: 'future',
    direction: 'long',
    qty: '',
    avgEntry: '',
    avgExit: '',
    initialStop: '',
    target: '',
    openedAt: toLocalInput(new Date()),
    closedAt: '',
    commissionTotal: '',
    feesTotal: '',
    setup: '',
    session: '',
    timeframe: '',
    marketCondition: '',
    followedPlan: 'unset',
    mistakes: [],
    emotionPre: null,
    emotionDuring: null,
    emotionPost: null,
    grade: '',
    tags: '',
    notes: '',
  };
}

export function TradeModal() {
  const open = useUiStore((s) => s.tradeModalOpen);
  const close = useUiStore((s) => s.closeTradeModal);
  const storeAccountId = useUiStore((s) => s.accountId);

  const { data: accounts } = useAccounts();
  const createTrade = useCreateTrade();
  const api = useApi();

  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const firstAccountId = storeAccountId ?? accounts?.[0]?.id ?? '';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: defaults(firstAccountId),
  });

  // Re-arm defaults each time the modal opens (fresh timestamps, current account).
  useEffect(() => {
    if (open) {
      reset(defaults(firstAccountId));
      setScreenshot(null);
      setSubmitError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Esc to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const [direction, qty, avgEntry, avgExit, initialStop, target, commissionTotal, feesTotal] =
    watch([
      'direction',
      'qty',
      'avgEntry',
      'avgExit',
      'initialStop',
      'target',
      'commissionTotal',
      'feesTotal',
    ]);

  // Live preview — recomputed on every keystroke, same calc the server uses.
  const live = useMemo(() => {
    const q = Number(qty);
    const entry = Number(avgEntry);
    const exit = Number(avgExit);
    const stop = Number(initialStop);
    const tgt = Number(target);
    const hasCore = q > 0 && entry > 0;
    const input = {
      direction,
      qty: q,
      avgEntry: entry,
      avgExit: exit,
      commission: Number(commissionTotal) || 0,
      fees: Number(feesTotal) || 0,
    };
    const net = hasCore && exit > 0 ? netPnl(input) : null;
    return {
      gross: hasCore && exit > 0 ? grossPnl(input) : null,
      net,
      rRealized:
        net !== null && stop > 0
          ? rRealized(net, { avgEntry: entry, initialStop: stop, qty: q })
          : null,
      rPlanned: entry > 0 && stop > 0 && tgt > 0 ? rPlanned(entry, stop, tgt) : null,
    };
  }, [direction, qty, avgEntry, avgExit, initialStop, target, commissionTotal, feesTotal]);

  if (!open) return null;

  const onSubmit = handleSubmit(async (v) => {
    setSubmitError(null);
    const optional = (s: string) => (s === '' ? undefined : Number(s));
    const input: CreateTradeInput = {
      accountId: v.accountId,
      symbol: v.symbol.trim().toUpperCase(),
      instrumentType: v.instrumentType,
      direction: v.direction,
      qty: Number(v.qty),
      avgEntry: Number(v.avgEntry),
      avgExit: optional(v.avgExit) ?? null,
      initialStop: optional(v.initialStop) ?? null,
      target: optional(v.target) ?? null,
      openedAt: new Date(v.openedAt),
      closedAt: v.closedAt ? new Date(v.closedAt) : null,
      commissionTotal: Number(v.commissionTotal) || 0,
      feesTotal: Number(v.feesTotal) || 0,
      setup: v.setup.trim() || null,
      session: v.session || null,
      timeframe: v.timeframe.trim() || null,
      marketCondition: v.marketCondition || null,
      followedPlan: v.followedPlan === 'unset' ? null : v.followedPlan === 'yes',
      mistakes: v.mistakes,
      emotionPre: v.emotionPre,
      emotionDuring: v.emotionDuring,
      emotionPost: v.emotionPost,
      grade: v.grade || null,
      tags: v.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      notes: v.notes.trim() || null,
    };

    try {
      const trade = await createTrade.mutateAsync(input);
      if (screenshot) {
        const { url } = await api.uploads.image(screenshot);
        await api.trades.addMedia(trade.id, { url });
      }
      close();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong');
    }
  });

  const mistakes = watch('mistakes');
  const grade = watch('grade');
  const followedPlan = watch('followedPlan');

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-void/70 px-4 py-10 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
      role="dialog"
      aria-modal="true"
      aria-label="Log trade"
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-2xl rounded-xl border border-edge bg-raised shadow-modal"
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-edge-subtle px-6 py-4">
          <div>
            <h2 className="font-display text-[17px] font-semibold tracking-tight text-ink">
              Log trade
            </h2>
            <p className="mt-0.5 text-[12px] text-ink-muted">
              Numbers first — psychology below. Everything but the essentials is optional.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded-md p-1.5 text-ink-muted transition-colors duration-fast hover:bg-hover hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="max-h-[65vh] space-y-6 overflow-y-auto px-6 py-5">
          {/* ── Essentials ── */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Account" error={errors.accountId?.message} className="col-span-2">
              <Select {...register('accountId')}>
                {(accounts ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Symbol" error={errors.symbol?.message}>
              <Input {...register('symbol')} placeholder="NQ" autoFocus className="uppercase" />
            </Field>
            <Field label="Instrument">
              <Select {...register('instrumentType')}>
                {InstrumentType.options.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Direction" className="col-span-2">
              <SegmentedControl
                value={direction}
                onChange={(v) => setValue('direction', v, { shouldValidate: true })}
                options={[
                  { value: 'long', label: 'Long', tone: 'profit' },
                  { value: 'short', label: 'Short', tone: 'loss' },
                ]}
              />
            </Field>
            <Field label="Qty" error={errors.qty?.message}>
              <Input {...register('qty')} inputMode="decimal" placeholder="2" />
            </Field>
            <Field label="Commission" error={errors.commissionTotal?.message}>
              <Input {...register('commissionTotal')} inputMode="decimal" placeholder="0.00" />
            </Field>

            <Field label="Entry" error={errors.avgEntry?.message}>
              <Input {...register('avgEntry')} inputMode="decimal" placeholder="18500" />
            </Field>
            <Field label="Exit" error={errors.avgExit?.message} hint="blank = open">
              <Input {...register('avgExit')} inputMode="decimal" placeholder="18530" />
            </Field>
            <Field label="Stop" error={errors.initialStop?.message}>
              <Input {...register('initialStop')} inputMode="decimal" placeholder="18480" />
            </Field>
            <Field label="Target" error={errors.target?.message}>
              <Input {...register('target')} inputMode="decimal" placeholder="18560" />
            </Field>

            <Field label="Opened" error={errors.openedAt?.message} className="col-span-2">
              <Input {...register('openedAt')} type="datetime-local" />
            </Field>
            <Field label="Closed" error={errors.closedAt?.message} className="col-span-2">
              <Input {...register('closedAt')} type="datetime-local" />
            </Field>
          </section>

          {/* Live preview strip */}
          <section className="flex flex-wrap items-center gap-x-8 gap-y-2 rounded-lg border border-edge-subtle bg-high px-5 py-3">
            <LiveStat label="Net P&L" value={live.net === null ? '—' : fmtPnl(live.net)} tone={live.net === null ? undefined : pnlTone(live.net)} />
            <LiveStat label="R realized" value={fmtR(live.rRealized)} tone={live.rRealized === null ? undefined : pnlTone(live.rRealized)} />
            <LiveStat
              label="R planned"
              value={live.rPlanned === null ? '—' : `${live.rPlanned.toFixed(2)}R`}
            />
            <span className="ml-auto text-[11px] uppercase tracking-[0.12em] text-ink-faint">
              live · same math as the server
            </span>
          </section>

          {/* ── Context ── */}
          <section>
            <SectionTitle>Context</SectionTitle>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="Setup" className="col-span-2">
                <Input {...register('setup')} placeholder="ORB breakout" />
              </Field>
              <Field label="Timeframe">
                <Input {...register('timeframe')} placeholder="5m" />
              </Field>
              <Field label="Market">
                <Select {...register('marketCondition')}>
                  <option value="">—</option>
                  {MarketCondition.options.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Session" className="col-span-2">
                <Select {...register('session')}>
                  <option value="">—</option>
                  {TradingSession.options.map((s) => (
                    <option key={s} value={s}>
                      {SESSION_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Tags" hint="comma separated" className="col-span-2">
                <Input {...register('tags')} placeholder="A-setup, news-day" />
              </Field>
            </div>
          </section>

          {/* ── Discipline & psychology ── */}
          <section>
            <SectionTitle>Discipline</SectionTitle>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Followed plan?">
                  <SegmentedControl
                    value={followedPlan}
                    onChange={(v) => setValue('followedPlan', v)}
                    options={[
                      { value: 'unset', label: '—' },
                      { value: 'yes', label: 'Yes', tone: 'profit' },
                      { value: 'no', label: 'No', tone: 'loss' },
                    ]}
                  />
                </Field>
                <Field label="Grade">
                  <div className="flex gap-1.5">
                    {TradeGrade.options.map((g) => (
                      <Chip
                        key={g}
                        active={grade === g}
                        onClick={() => setValue('grade', grade === g ? '' : g)}
                      >
                        {g}
                      </Chip>
                    ))}
                  </div>
                </Field>
              </div>

              <Field label="Mistakes" hint="be honest — this is the edge">
                <div className="flex flex-wrap gap-1.5">
                  {TradeMistake.options.map((m) => (
                    <Chip
                      key={m}
                      tone="loss"
                      active={mistakes.includes(m)}
                      onClick={() =>
                        setValue(
                          'mistakes',
                          mistakes.includes(m)
                            ? mistakes.filter((x) => x !== m)
                            : [...mistakes, m],
                        )
                      }
                    >
                      {MISTAKE_LABELS[m]}
                    </Chip>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <EmotionPicker
                  label="Before"
                  value={watch('emotionPre')}
                  onChange={(v) => setValue('emotionPre', v)}
                />
                <EmotionPicker
                  label="During"
                  value={watch('emotionDuring')}
                  onChange={(v) => setValue('emotionDuring', v)}
                />
                <EmotionPicker
                  label="After"
                  value={watch('emotionPost')}
                  onChange={(v) => setValue('emotionPost', v)}
                />
              </div>
            </div>
          </section>

          {/* ── Notes & screenshot ── */}
          <section>
            <SectionTitle>Notes</SectionTitle>
            <Field label="Trade notes" hint="markdown supported">
              <Textarea
                {...register('notes')}
                placeholder={'What was the thesis? What did you see?\n\n**Bold**, *italic*, lists…'}
              />
            </Field>
            <div className="mt-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
              />
              {screenshot ? (
                <div className="flex items-center gap-3 rounded-md border border-edge bg-high px-3 py-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(screenshot)}
                    alt="Screenshot preview"
                    className="h-12 w-20 rounded-sm border border-edge-subtle object-cover"
                  />
                  <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink-secondary">
                    {screenshot.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setScreenshot(null)}
                    className="text-[12px] text-ink-muted hover:text-loss"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-edge px-3 py-3 text-[12.5px] text-ink-muted transition-colors duration-fast hover:border-edge-strong hover:text-ink-secondary"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M7 1v8m0-8L4 4m3-3l3 3M1 10v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Attach a chart screenshot
                </button>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-4 border-t border-edge-subtle px-6 py-4">
          <p className="text-[12px] text-loss">{submitError}</p>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={close}
              className="rounded-md px-4 py-2 text-[13px] font-medium text-ink-secondary transition-colors duration-fast hover:bg-hover hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={clsx(
                'rounded-md bg-gold px-5 py-2 text-[13px] font-semibold text-ink-on-accent transition-colors duration-fast',
                isSubmitting ? 'opacity-60' : 'hover:bg-gold-hover active:bg-gold-active',
              )}
            >
              {isSubmitting ? 'Saving…' : 'Save trade'}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h3 className="font-display text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-secondary">
        {children}
      </h3>
      <div className="z-horizon flex-1" />
    </div>
  );
}

function LiveStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'profit' | 'loss' | 'breakeven';
}) {
  return (
    <div>
      <p className="text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">{label}</p>
      <p
        className={clsx(
          'z-numeric mt-0.5 text-[16px] font-semibold',
          tone === 'profit' ? 'text-profit' : tone === 'loss' ? 'text-loss' : 'text-ink',
        )}
      >
        {value}
      </p>
    </div>
  );
}

/** 1–5 emotional state: tilt → flow. */
function EmotionPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11.5px] font-medium uppercase tracking-[0.1em] text-ink-muted">
        {label}
        <span className="ml-2 normal-case tracking-normal text-ink-faint">tilt → flow</span>
      </p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${label} ${n}/5`}
            onClick={() => onChange(value === n ? null : n)}
            className={clsx(
              'z-numeric h-8 w-8 rounded-md border text-[12.5px] font-medium transition-colors duration-fast',
              value === n
                ? n <= 2
                  ? 'border-loss/50 bg-loss-wash text-loss'
                  : n === 3
                    ? 'border-edge-strong bg-overlay text-ink'
                    : 'border-profit/50 bg-profit-wash text-profit'
                : 'border-edge bg-high text-ink-muted hover:border-edge-strong',
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
