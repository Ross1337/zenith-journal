'use client';

import { useState, useMemo } from 'react';
import { useUiStore } from '@/lib/store';
import { useTrades } from '@/lib/hooks';
import { fmtPnl } from '@/lib/format';
import { AccountSwitcher } from '@/components/shell/account-switcher';
import { useI18n } from '@/lib/i18n-context';

const DAYS_BY_LANG = {
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  fr: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
} as const;
const MONTHS_BY_LANG = {
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  fr: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
} as const;

function toLocalDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function pnlColor(pnl: number, maxAbs: number): string {
  const intensity = maxAbs > 0 ? Math.min(1, Math.abs(pnl) / maxAbs) : 0;
  if (pnl > 0) return `rgba(74, 222, 128, ${0.15 + intensity * 0.55})`;
  if (pnl < 0) return `rgba(248, 113, 113, ${0.15 + intensity * 0.55})`;
  return 'rgba(30, 35, 48, 0.5)';
}

export default function CalendarPage() {
  const { t, lang } = useI18n();
  const DAYS = DAYS_BY_LANG[lang];
  const MONTHS = MONTHS_BY_LANG[lang];
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const accountId = useUiStore((s) => s.accountId) ?? undefined;
  const { data: tradeList, isLoading } = useTrades({
    accountId,
    status: 'closed',
    limit: 1000,
  });

  const trades = tradeList?.items ?? [];

  // Aggregate by day
  const dayMap = useMemo(() => {
    const map = new Map<string, { pnl: number; count: number; wins: number }>();
    for (const t of trades) {
      const key = toLocalDate(t.closedAt ?? t.openedAt);
      const cur = map.get(key) ?? { pnl: 0, count: 0, wins: 0 };
      cur.pnl += t.netPnl ?? 0;
      cur.count += 1;
      if ((t.netPnl ?? 0) > 0) cur.wins += 1;
      map.set(key, cur);
    }
    return map;
  }, [trades]);

  // Calendar grid
  const firstDay = new Date(year, month, 1);
  // Monday = 0
  let startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ date: string; day: number } | null> = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ date: dateStr, day: d });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const maxAbsPnl = Math.max(1, ...Array.from(dayMap.values()).map((v) => Math.abs(v.pnl)));

  // Month stats
  const monthDays = Array.from(dayMap.entries()).filter(([k]) => k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`));
  const winDays = monthDays.filter(([, v]) => v.pnl > 0).length;
  const lossDays = monthDays.filter(([, v]) => v.pnl < 0).length;
  const monthPnl = monthDays.reduce((sum, [, v]) => sum + v.pnl, 0);
  const bestDay = monthDays.reduce((best, [, v]) => Math.max(best, v.pnl), -Infinity);
  const worstDay = monthDays.reduce((worst, [, v]) => Math.min(worst, v.pnl), Infinity);

  // Selected day trades
  const dayTrades = selectedDay
    ? trades.filter((t) => toLocalDate(t.closedAt ?? t.openedAt) === selectedDay)
    : [];

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); } else { setMonth(m => m - 1); }
    setSelectedDay(null);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); } else { setMonth(m => m + 1); }
    setSelectedDay(null);
  }

  const todayStr = toLocalDate(now);

  return (
    <>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1
            className="font-display text-[28px] font-semibold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #F2F4FA 30%, #F2B544)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('cal_title')}
          </h1>
          <p className="mt-1 text-[13px] text-ink-muted">{t('cal_subtitle')}</p>
        </div>
        <AccountSwitcher />
      </header>

      {/* Month nav */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-md border border-edge px-3 py-1.5 text-[13px] text-ink-secondary transition-colors hover:border-edge-strong hover:text-ink"
        >
          ← {t('cal_prev')}
        </button>
        <div className="text-center">
          <h2 className="font-display text-[18px] font-semibold text-ink">{MONTHS[month]} {year}</h2>
          {monthDays.length > 0 && (
            <p className={`text-[12.5px] font-medium ${monthPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
              {fmtPnl(monthPnl)} · {winDays}W / {lossDays}L
            </p>
          )}
        </div>
        <button
          onClick={nextMonth}
          className="rounded-md border border-edge px-3 py-1.5 text-[13px] text-ink-secondary transition-colors hover:border-edge-strong hover:text-ink"
        >
          {t('cal_next')} →
        </button>
      </div>

      {/* Month stats strip */}
      {monthDays.length > 0 && (
        <div className="mb-4 grid grid-cols-4 gap-3">
          {[
            { label: t('cal_win_days'), value: String(winDays), color: 'text-profit' },
            { label: t('cal_loss_days'), value: String(lossDays), color: 'text-loss' },
            { label: t('cal_best_day'), value: bestDay > -Infinity ? fmtPnl(bestDay) : '—', color: 'text-profit' },
            { label: t('cal_worst_day'), value: worstDay < Infinity ? fmtPnl(worstDay) : '—', color: 'text-loss' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-edge-subtle bg-raised px-4 py-3">
              <p className="text-[11px] uppercase tracking-wider text-ink-muted">{s.label}</p>
              <p className={`z-numeric mt-1 text-[20px] font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Calendar grid */}
      <div className="rounded-xl border border-edge-subtle bg-raised overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-edge-subtle">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              {d}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7">
          {cells.map((cell, i) => {
            if (!cell) {
              return <div key={`empty-${i}`} className="border-b border-r border-edge-subtle/50 min-h-[80px]" />;
            }
            const data = dayMap.get(cell.date);
            const isToday = cell.date === todayStr;
            const isSelected = cell.date === selectedDay;
            const bg = data ? pnlColor(data.pnl, maxAbsPnl) : undefined;

            return (
              <button
                key={cell.date}
                onClick={() => setSelectedDay(isSelected ? null : cell.date)}
                className="relative border-b border-r border-edge-subtle/50 min-h-[80px] p-2 text-left transition-all hover:ring-1 hover:ring-gold/30"
                style={{ background: isSelected ? 'rgba(242,181,68,0.12)' : bg }}
              >
                <span
                  className={`z-numeric text-[13px] font-semibold ${
                    isToday
                      ? 'flex h-6 w-6 items-center justify-center rounded-full bg-gold text-[11px] text-ink-on-accent'
                      : data ? 'text-ink' : 'text-ink-muted'
                  }`}
                >
                  {cell.day}
                </span>
                {data && (
                  <div className="mt-1">
                    <p className={`z-numeric text-[11px] font-semibold ${data.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {fmtPnl(data.pnl)}
                    </p>
                    <p className="text-[10px] text-ink-muted">{data.count} {data.count !== 1 ? t('cal_trades') : t('cal_trade')}</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && dayTrades.length > 0 && (
        <div className="mt-4 rounded-xl border border-edge-subtle bg-raised p-4">
          <h3 className="mb-3 font-display text-[15px] font-semibold text-ink">
            {new Date(selectedDay + 'T12:00:00').toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            <span className={`ml-2 text-[13px] font-normal ${dayMap.get(selectedDay)!.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
              {fmtPnl(dayMap.get(selectedDay)!.pnl)}
            </span>
          </h3>
          <div className="space-y-2">
            {dayTrades.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-edge-subtle px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${(t.netPnl ?? 0) >= 0 ? 'bg-profit' : 'bg-loss'}`} />
                  <span className="z-numeric text-[13.5px] font-semibold text-ink">{t.symbol}</span>
                  <span className="text-[12px] text-ink-muted capitalize">{t.direction}</span>
                  {t.setup && (
                    <span className="rounded border border-edge-subtle px-1.5 py-0.5 text-[10px] text-ink-muted">{t.setup}</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {t.rRealized != null && (
                    <span className={`z-numeric text-[12px] font-medium ${t.rRealized >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {t.rRealized >= 0 ? '+' : ''}{t.rRealized.toFixed(2)}R
                    </span>
                  )}
                  <span className={`z-numeric text-[13.5px] font-semibold ${(t.netPnl ?? 0) >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {fmtPnl(t.netPnl ?? 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDay && dayTrades.length === 0 && (
        <div className="mt-4 rounded-xl border border-edge-subtle bg-raised px-5 py-8 text-center text-[13px] text-ink-muted">
          {t('cal_no_trades_day')}
        </div>
      )}

      {isLoading && (
        <div className="mt-4 text-center text-[13px] text-ink-muted">{t('cal_loading')}</div>
      )}
    </>
  );
}
