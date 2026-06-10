'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useApi, useSubscription } from '@/lib/hooks';

const PLAN_LABELS = { free: 'Free', pro: 'Pro', lifetime: 'Lifetime' } as const;

const PLANS = [
  {
    id: 'pro' as const,
    name: 'Pro',
    price: '$14.99 / month',
    blurb: 'Unlimited trades & accounts, CSV import, full analytics, journal & psychology.',
  },
  {
    id: 'lifetime' as const,
    name: 'Lifetime',
    price: '$199 once',
    blurb: 'Everything in Pro, forever. No subscription.',
  },
];

export default function BillingPage() {
  // useSearchParams needs a Suspense boundary for prerendering.
  return (
    <Suspense fallback={<Skeleton className="h-64 max-w-2xl" />}>
      <BillingContent />
    </Suspense>
  );
}

function BillingContent() {
  const { data: sub, isLoading } = useSubscription();
  const api = useApi();
  const params = useSearchParams();
  const checkoutResult = params.get('checkout');

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const go = async (fn: () => Promise<{ url: string }>, key: string) => {
    setBusy(key);
    setError(null);
    try {
      const { url } = await fn();
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setBusy(null);
    }
  };

  if (isLoading || !sub) {
    return (
      <>
        <header className="mb-6">
          <Skeleton className="h-7 w-44" />
        </header>
        <Skeleton className="h-64 max-w-2xl" />
      </>
    );
  }

  const isPaid = sub.plan !== 'free';

  return (
    <>
      <header className="mb-6">
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-ink">Billing</h1>
        <p className="mt-1 text-[13px] text-ink-muted">Subscription and payment management.</p>
      </header>

      <div className="max-w-2xl space-y-4">
        {checkoutResult === 'success' && (
          <div className="rounded-lg border border-profit/40 bg-profit-wash px-4 py-3 text-[13px] text-profit">
            Payment received — welcome aboard. Your plan updates within a few seconds.
          </div>
        )}
        {checkoutResult === 'canceled' && (
          <div className="rounded-lg border border-edge bg-high px-4 py-3 text-[13px] text-ink-secondary">
            Checkout canceled — no charge was made.
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-loss/40 bg-loss-wash px-4 py-3 text-[13px] text-loss">
            {error}
          </div>
        )}

        {/* Current plan */}
        <Card>
          <CardHeader title="Current plan" />
          <div className="flex flex-wrap items-center gap-4 px-5 pb-5 pt-2">
            <span
              className={clsx(
                'rounded-md border px-3 py-1 font-display text-[14px] font-semibold',
                isPaid ? 'border-gold/50 bg-gold-wash text-gold' : 'border-edge bg-high text-ink-secondary',
              )}
            >
              {PLAN_LABELS[sub.plan]}
            </span>
            <div className="text-[12.5px] text-ink-muted">
              {!sub.billingEnabled ? (
                'Billing is not configured on this deployment — every feature is unlocked.'
              ) : sub.plan === 'lifetime' ? (
                'Lifetime access — nothing to renew, ever.'
              ) : sub.plan === 'pro' ? (
                <>
                  Status <span className="text-ink-secondary">{sub.status}</span>
                  {sub.currentPeriodEnd && (
                    <>
                      {' · '}
                      {sub.cancelAtPeriodEnd ? 'ends' : 'renews'}{' '}
                      <span className="z-numeric text-ink-secondary">
                        {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </>
              ) : (
                'Free plan — 50 trades / month, 1 account.'
              )}
            </div>
            {sub.billingEnabled && isPaid && sub.plan === 'pro' && (
              <button
                type="button"
                onClick={() => void go(() => api.billing.portal(), 'portal')}
                disabled={busy !== null}
                className="ml-auto rounded-md border border-edge px-4 py-2 text-[13px] font-medium text-ink-secondary transition-colors duration-fast hover:border-edge-strong hover:text-ink disabled:opacity-60"
              >
                {busy === 'portal' ? 'Opening…' : 'Manage in Stripe portal'}
              </button>
            )}
          </div>
        </Card>

        {/* Upgrade options */}
        {sub.billingEnabled && sub.plan !== 'lifetime' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PLANS.filter((p) => p.id !== sub.plan).map((p) => (
              <Card key={p.id}>
                <div className="flex h-full flex-col px-5 py-4">
                  <h2 className="font-display text-[15px] font-semibold text-ink">{p.name}</h2>
                  <p className="z-numeric mt-1 text-[20px] font-semibold text-gold">{p.price}</p>
                  <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-ink-muted">
                    {p.blurb}
                  </p>
                  <button
                    type="button"
                    onClick={() => void go(() => api.billing.checkout(p.id), p.id)}
                    disabled={busy !== null}
                    className="mt-4 rounded-md bg-gold px-4 py-2 text-[13px] font-semibold text-ink-on-accent transition-colors duration-fast hover:bg-gold-hover disabled:opacity-60"
                  >
                    {busy === p.id ? 'Redirecting…' : `Upgrade to ${p.name}`}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <p className="text-[11.5px] text-ink-faint">
          Payments are processed by Stripe. ZENITH never sees your card details.
        </p>
      </div>
    </>
  );
}
