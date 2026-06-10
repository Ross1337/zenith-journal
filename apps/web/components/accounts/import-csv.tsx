'use client';

import { useRef, useState } from 'react';
import clsx from 'clsx';
import { useQueryClient } from '@tanstack/react-query';
import { InstrumentType, type Account, type Trade } from '@zenith/types';
import { Card, CardHeader } from '@/components/ui/card';
import { Field, Select } from '@/components/ui/field';
import { PnlValue } from '@/components/ui/pnl-value';
import { useApi } from '@/lib/hooks';
import { fmtDateTime, fmtPnl, pnlTone } from '@/lib/format';
import type { ImportPreview } from '@/lib/api-client';

/**
 * Broker CSV → trades, in two explicit steps: preview (parse + match,
 * nothing written) then confirm. Duplicate fills are detected server-side,
 * so re-importing the same file is always safe.
 */
export function ImportCsv({ accounts }: { accounts: Account[] }) {
  const api = useApi();
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [instrumentType, setInstrumentType] = useState<Trade['instrumentType']>('future');
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setPreview(null);
    setFileName(null);
    setDone(null);
    setError(null);
  };

  const handleFile = async (file: File) => {
    if (!accountId) {
      setError('Create an account first');
      return;
    }
    reset();
    setFileName(file.name);
    setBusy(true);
    try {
      setPreview(await api.imports.preview(accountId, file));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Preview failed');
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    if (!preview) return;
    setBusy(true);
    setError(null);
    try {
      const result = await api.imports.commit({ accountId, instrumentType, fills: preview.fills });
      setDone(
        `Imported ${result.importedTrades} trades (${result.importedExecutions} executions).`,
      );
      setPreview(null);
      void qc.invalidateQueries({ queryKey: ['trades'] });
      void qc.invalidateQueries({ queryKey: ['metrics'] });
      void qc.invalidateQueries({ queryKey: ['accounts'] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader title="Import trades" hint="broker CSV — IBKR, NinjaTrader, Tradovate, generic" />
      <div className="space-y-4 px-5 pb-5 pt-2">
        <div className="grid grid-cols-2 gap-4 sm:max-w-md">
          <Field label="Into account">
            <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Instrument type">
            <Select
              value={instrumentType}
              onChange={(e) => setInstrumentType(e.target.value as Trade['instrumentType'])}
            >
              {InstrumentType.options.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          className={clsx(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center transition-colors duration-fast',
            dragging
              ? 'border-gold bg-gold-wash'
              : 'border-edge bg-high hover:border-edge-strong',
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = '';
            }}
          />
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden className={dragging ? 'text-gold' : 'text-ink-muted'}>
            <path d="M11 3v10m0-10L7 7m4-4l4 4M3 15v3a1 1 0 001 1h14a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-[13.5px] font-medium text-ink-secondary">
            {busy ? 'Parsing…' : dragging ? 'Drop to parse' : 'Drag a CSV here, or click to browse'}
          </p>
          <p className="text-[11.5px] text-ink-faint">
            Needs Symbol · Side · Qty · Price · Time columns — nothing is saved until you confirm.
          </p>
        </div>

        {error && <p className="text-[13px] text-loss">{error}</p>}
        {done && <p className="text-[13px] text-profit">{done}</p>}

        {/* Preview */}
        {preview && (
          <div className="rounded-lg border border-edge-subtle">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-edge-subtle bg-high px-4 py-2.5 text-[12.5px]">
              <span className="font-medium text-ink">{fileName}</span>
              <span className="z-numeric text-ink-secondary">
                {preview.fills.length} fills → {preview.trades.length} trades
              </span>
              <span className={clsx('z-numeric font-medium', pnlTone(preview.totalNetPnl) === 'profit' ? 'text-profit' : 'text-loss')}>
                {fmtPnl(preview.totalNetPnl)}
              </span>
              {preview.duplicates > 0 && (
                <span className="text-warning">{preview.duplicates} duplicates skipped</span>
              )}
              {preview.errors.length > 0 && (
                <span className="text-loss">{preview.errors.length} rows ignored</span>
              )}
            </div>

            {preview.errors.length > 0 && (
              <ul className="max-h-24 overflow-y-auto border-b border-edge-subtle px-4 py-2 text-[11.5px] text-loss/90">
                {preview.errors.slice(0, 12).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}

            <div className="max-h-64 overflow-y-auto">
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr className="text-left text-[10.5px] uppercase tracking-[0.12em] text-ink-muted">
                    <th className="px-4 py-2">Opened</th>
                    <th className="px-2 py-2">Symbol</th>
                    <th className="px-2 py-2">Side</th>
                    <th className="px-2 py-2 text-right">Qty</th>
                    <th className="px-2 py-2 text-right">Entry</th>
                    <th className="px-2 py-2 text-right">Exit</th>
                    <th className="px-4 py-2 text-right">Net P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge-subtle">
                  {preview.trades.map((t, i) => (
                    <tr key={i}>
                      <td className="z-numeric whitespace-nowrap px-4 py-2 text-ink-secondary">
                        {fmtDateTime(new Date(t.openedAt))}
                      </td>
                      <td className="z-numeric px-2 py-2 font-medium text-ink">{t.symbol}</td>
                      <td className="px-2 py-2">
                        <span
                          className={clsx(
                            'z-numeric rounded-xs px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                            t.direction === 'long' ? 'bg-profit-wash text-profit' : 'bg-loss-wash text-loss',
                          )}
                        >
                          {t.direction}
                        </span>
                      </td>
                      <td className="z-numeric px-2 py-2 text-right text-ink-secondary">{t.qty}</td>
                      <td className="z-numeric px-2 py-2 text-right text-ink-secondary">{t.avgEntry}</td>
                      <td className="z-numeric px-2 py-2 text-right text-ink-secondary">{t.avgExit ?? '—'}</td>
                      <td className="px-4 py-2 text-right">
                        {t.netPnl !== null ? <PnlValue value={t.netPnl} /> : <span className="text-ink-faint">open</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-edge-subtle px-4 py-3">
              <button
                type="button"
                onClick={reset}
                className="rounded-md px-3 py-1.5 text-[12.5px] font-medium text-ink-muted transition-colors duration-fast hover:bg-hover hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={busy || preview.trades.length === 0}
                className="rounded-md bg-gold px-4 py-1.5 text-[12.5px] font-semibold text-ink-on-accent transition-colors duration-fast hover:bg-gold-hover disabled:opacity-60"
              >
                {busy ? 'Importing…' : `Import ${preview.trades.length} trades`}
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
