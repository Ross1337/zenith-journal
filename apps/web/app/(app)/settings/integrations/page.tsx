'use client';

import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { useProfile, useRegenerateApiKey } from '@/lib/hooks';
import { Skeleton } from '@/components/ui/skeleton';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';
const SERVER_BASE = API_URL.replace(/\/v1$/, '');

export default function IntegrationsPage() {
  const { data: profile, isLoading } = useProfile();
  const regenerate = useRegenerateApiKey();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const apiKey = profile?.apiKey ?? '—';
  const ingestUrl = `${SERVER_BASE}/v1/trades/ingest/mt`;
  const webhookUrl = `${SERVER_BASE}/v1/trades/ingest/webhook`;

  if (isLoading || !profile) {
    return (
      <>
        <header className="mb-6">
          <Skeleton className="h-7 w-56" />
        </header>
        <Skeleton className="h-64" />
      </>
    );
  }

  return (
    <>
      <header className="mb-6">
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-ink">
          Integrations
        </h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          Connect Zenith to your trading platform for automatic trade import.
        </p>
      </header>

      <div className="max-w-2xl space-y-4">
        {/* API Key */}
        <Card>
          <CardHeader title="Your API Key" />
          <div className="space-y-3 px-5 pb-5 pt-2">
            <p className="text-[12.5px] leading-relaxed text-ink-muted">
              Use this key to authenticate requests from Expert Advisors, scripts, or webhooks.
              Keep it secret — anyone with this key can write trades to your account.
            </p>
            <div className="flex items-center gap-2">
              <code className="z-numeric flex-1 truncate rounded-md border border-edge bg-base px-3 py-2 text-[12px] text-ink-secondary">
                {apiKey}
              </code>
              <button
                type="button"
                onClick={() => copy(apiKey, 'key')}
                className="shrink-0 rounded-md border border-edge bg-high px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:bg-high-hover"
              >
                {copied === 'key' ? 'Copied ✓' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={() => regenerate.mutate()}
                disabled={regenerate.isPending}
                className="shrink-0 rounded-md border border-loss/40 bg-loss/10 px-3 py-2 text-[12px] font-medium text-loss transition-colors hover:bg-loss/20 disabled:opacity-60"
              >
                Regenerate
              </button>
            </div>
            <p className="text-[11px] text-ink-muted">
              Regenerating invalidates the previous key — update all your EAs and scripts.
            </p>
          </div>
        </Card>

        {/* MetaTrader 5 EA */}
        <Card>
          <CardHeader title="MetaTrader 5 — Expert Advisor" />
          <div className="space-y-4 px-5 pb-5 pt-2">
            <p className="text-[12.5px] leading-relaxed text-ink-muted">
              The ZenithEA Expert Advisor runs inside MetaTrader 5 and automatically sends
              every closed trade to your journal in real time.
            </p>
            <div className="rounded-lg border border-edge bg-base p-4">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                Installation steps
              </p>
              <ol className="list-decimal space-y-1.5 pl-4 text-[12.5px] text-ink-secondary">
                <li>Download the EA file below and copy it to your MT5 <code className="rounded bg-high px-1 py-0.5 text-[11px]">Experts</code> folder.</li>
                <li>In MT5: go to <strong>Tools → Options → Expert Advisors</strong> and enable <em>Allow WebRequests</em>. Add your server URL to the allowed list.</li>
                <li>Drag <strong>ZenithEA</strong> onto any chart. In the settings, set your <strong>API Key</strong>, <strong>Account ID</strong>, and <strong>Endpoint</strong>.</li>
                <li>Trades will be sent automatically whenever a position is closed.</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-[11.5px] font-medium text-ink-muted">Endpoint</p>
                <div className="flex items-center gap-2">
                  <code className="z-numeric flex-1 truncate rounded border border-edge bg-base px-2 py-1.5 text-[11px] text-ink-secondary">
                    {ingestUrl}
                  </code>
                  <button
                    type="button"
                    onClick={() => copy(ingestUrl, 'endpoint')}
                    className="shrink-0 rounded border border-edge bg-high px-2 py-1.5 text-[11px] text-ink transition-colors hover:bg-high-hover"
                  >
                    {copied === 'endpoint' ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[11.5px] font-medium text-ink-muted">API Key</p>
                <div className="flex items-center gap-2">
                  <code className="z-numeric flex-1 truncate rounded border border-edge bg-base px-2 py-1.5 text-[11px] text-ink-secondary">
                    {apiKey}
                  </code>
                  <button
                    type="button"
                    onClick={() => copy(apiKey, 'key2')}
                    className="shrink-0 rounded border border-edge bg-high px-2 py-1.5 text-[11px] text-ink transition-colors hover:bg-high-hover"
                  >
                    {copied === 'key2' ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <a
              href="/ZenithEA.mq5"
              download
              className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-[13px] font-semibold text-ink-on-accent transition-colors hover:bg-gold-hover"
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 12l-4-4h2.5V2h3v6H12L8 12z" />
                <path d="M2 14h12v1.5H2V14z" />
              </svg>
              Download ZenithEA.mq5
            </a>
          </div>
        </Card>

        {/* Webhook */}
        <Card>
          <CardHeader title="Generic Webhook" />
          <div className="space-y-3 px-5 pb-5 pt-2">
            <p className="text-[12.5px] leading-relaxed text-ink-muted">
              POST to this endpoint from any tool — Zapier, Make.com, or a custom script —
              using the <code className="rounded bg-high px-1 text-[11px]">X-Zenith-Key</code> header for authentication.
            </p>
            <div className="flex items-center gap-2">
              <code className="z-numeric flex-1 truncate rounded border border-edge bg-base px-2 py-1.5 text-[11px] text-ink-secondary">
                {webhookUrl}
              </code>
              <button
                type="button"
                onClick={() => copy(webhookUrl, 'webhook')}
                className="shrink-0 rounded border border-edge bg-high px-2 py-1.5 text-[11px] text-ink transition-colors hover:bg-high-hover"
              >
                {copied === 'webhook' ? '✓' : 'Copy'}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-md border border-edge bg-base p-3 text-[11px] leading-relaxed text-ink-secondary">
{`curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -H "X-Zenith-Key: YOUR_API_KEY" \\
  -d '{
    "source": "mt5",
    "accountId": "YOUR_ACCOUNT_UUID",
    "ticket": 12345678,
    "symbol": "EURUSD",
    "type": "buy",
    "openTime": "2026-06-10T08:30:00Z",
    "closeTime": "2026-06-10T14:22:00Z",
    "openPrice": 1.08542,
    "closePrice": 1.08720,
    "lots": 0.1,
    "commission": -1.2,
    "swap": -0.3,
    "profit": 17.8
  }'`}
            </pre>
          </div>
        </Card>

        {/* CSV Import */}
        <Card>
          <CardHeader title="CSV Import" />
          <div className="space-y-2 px-5 pb-5 pt-2">
            <p className="text-[12.5px] leading-relaxed text-ink-muted">
              Import trade history from any broker by uploading a CSV file. Supported formats:
              MT4/MT5 history export, IBKR, NinjaTrader, Tradovate, TradingView, and any
              standard <em>Time, Symbol, Side, Qty, Price</em> layout.
            </p>
            <a
              href="/trades"
              className="inline-block text-[12.5px] font-medium text-gold hover:text-gold-hover"
            >
              Go to Trades → Import CSV →
            </a>
          </div>
        </Card>

        {/* MetaApi — Coming soon */}
        <Card>
          <CardHeader title="MetaApi Cloud" />
          <div className="px-5 pb-5 pt-2">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 rounded-full bg-ink-muted/20 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-muted">
                Coming soon
              </span>
              <p className="text-[12.5px] leading-relaxed text-ink-muted">
                Cloud-based MT4/MT5 sync without installing an EA. Connect any MetaTrader account
                via MetaApi and trades will be imported automatically every 5 minutes.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
