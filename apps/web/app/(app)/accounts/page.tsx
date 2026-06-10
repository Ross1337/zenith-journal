'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { AccountType, type Account } from '@zenith/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Field, Input, Select } from '@/components/ui/field';
import { PnlValue } from '@/components/ui/pnl-value';
import { ImportCsv } from '@/components/accounts/import-csv';
import {
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from '@/lib/hooks';
import { fmtCurrency, fmtPct } from '@/lib/format';

const TYPE_LABELS: Record<Account['accountType'], string> = {
  live: 'Live',
  demo: 'Demo',
  prop: 'Prop funded',
  eval: 'Prop eval',
};

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();
  const [creating, setCreating] = useState(false);

  return (
    <>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-ink">
            Accounts
          </h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            Live, demo, prop — every account tracked separately, aggregated on demand.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="rounded-md bg-gold px-4 py-2 text-[13px] font-semibold text-ink-on-accent transition-colors duration-fast hover:bg-gold-hover"
        >
          {creating ? 'Close' : '+ Add account'}
        </button>
      </header>

      {creating && <AccountForm onDone={() => setCreating(false)} />}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {(accounts ?? []).map((a) => (
            <AccountCard key={a.id} account={a} />
          ))}
          {(accounts ?? []).length === 0 && (
            <Card className="lg:col-span-2">
              <p className="px-5 py-14 text-center text-[13px] text-ink-muted">
                No accounts yet — add your first one to start logging trades.
              </p>
            </Card>
          )}
        </div>
      )}

      {(accounts ?? []).length > 0 && <ImportCsv accounts={accounts ?? []} />}
    </>
  );
}

function AccountCard({ account }: { account: Account }) {
  const del = useDeleteAccount();
  const update = useUpdateAccount();
  const [confirming, setConfirming] = useState(false);

  const pnl = account.currentBalance - account.initialBalance;
  const prop = account.propConfig;

  return (
    <Card className={clsx(!account.isActive && 'opacity-55')}>
      <div className="px-5 py-4">
        <header className="flex items-center gap-3">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: account.color ?? 'var(--z-gold)' }}
            aria-hidden
          />
          <h2 className="min-w-0 flex-1 truncate font-display text-[15px] font-semibold text-ink">
            {account.name}
          </h2>
          <span className="rounded-xs border border-edge px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-muted">
            {TYPE_LABELS[account.accountType]}
          </span>
        </header>
        <p className="mt-0.5 text-[12px] text-ink-muted">
          {account.broker ?? 'No broker'} · {account.currency}
          {!account.isActive && ' · archived'}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">Balance</p>
            <p className="z-numeric mt-1 text-[18px] font-semibold text-ink">
              {fmtCurrency(account.currentBalance)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">P&L</p>
            <PnlValue value={pnl} className="mt-1 block text-[18px] font-semibold" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">Return</p>
            <p
              className={clsx(
                'z-numeric mt-1 text-[18px] font-semibold',
                pnl > 0 ? 'text-profit' : pnl < 0 ? 'text-loss' : 'text-ink',
              )}
            >
              {fmtPct(account.initialBalance > 0 ? pnl / account.initialBalance : null)}
            </p>
          </div>
        </div>

        {/* Prop firm guardrails */}
        {prop && (
          <div className="mt-4 space-y-2.5 rounded-md border border-edge-subtle bg-high px-4 py-3">
            <Guardrail
              label="Profit target"
              value={Math.max(0, pnl)}
              limit={prop.profitTarget}
              tone="profit"
            />
            <Guardrail
              label={`Max drawdown (${prop.drawdownType})`}
              value={Math.max(0, -pnl)}
              limit={prop.maxDrawdown}
              tone="loss"
            />
          </div>
        )}

        <footer className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => update.mutate({ id: account.id, isActive: !account.isActive })}
            className="rounded-md px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors duration-fast hover:bg-hover hover:text-ink"
          >
            {account.isActive ? 'Archive' : 'Restore'}
          </button>
          {confirming ? (
            <span className="flex items-center gap-2 text-[12px]">
              <span className="text-ink-muted">Delete account + all its trades?</span>
              <button
                type="button"
                onClick={() => del.mutate(account.id)}
                className="font-semibold text-loss hover:underline"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="text-ink-muted hover:text-ink"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-md px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors duration-fast hover:bg-loss-wash hover:text-loss"
            >
              Delete
            </button>
          )}
        </footer>
      </div>
    </Card>
  );
}

function Guardrail({
  label,
  value,
  limit,
  tone,
}: {
  label: string;
  value: number;
  limit: number;
  tone: 'profit' | 'loss';
}) {
  const frac = Math.min(1, value / limit);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.1em] text-ink-muted">{label}</span>
        <span className="z-numeric text-[11.5px] text-ink-secondary">
          {fmtCurrency(value, true)} / {fmtCurrency(limit, true)}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-overlay">
        <div
          className={clsx('h-full rounded-full', tone === 'profit' ? 'bg-profit' : 'bg-loss')}
          style={{ width: `${frac * 100}%` }}
        />
      </div>
    </div>
  );
}

function AccountForm({ onDone }: { onDone: () => void }) {
  const create = useCreateAccount();
  const [name, setName] = useState('');
  const [broker, setBroker] = useState('');
  const [accountType, setAccountType] = useState<Account['accountType']>('live');
  const [initialBalance, setInitialBalance] = useState('');
  const [profitTarget, setProfitTarget] = useState('');
  const [maxDrawdown, setMaxDrawdown] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isProp = accountType === 'prop' || accountType === 'eval';

  const submit = async () => {
    const balance = Number(initialBalance);
    if (!name.trim() || !(balance > 0)) {
      setError('Name and a positive starting balance are required');
      return;
    }
    try {
      await create.mutateAsync({
        name: name.trim(),
        broker: broker.trim() || null,
        accountType,
        initialBalance: balance,
        propConfig:
          isProp && Number(profitTarget) > 0 && Number(maxDrawdown) > 0
            ? {
                profitTarget: Number(profitTarget),
                maxDailyLoss: Number(maxDrawdown) / 2,
                maxDrawdown: Number(maxDrawdown),
                drawdownType: 'trailing',
              }
            : null,
      });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create account');
    }
  };

  return (
    <Card className="mb-5">
      <div className="space-y-4 px-5 py-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Name" className="col-span-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Apex Eval 150K" />
          </Field>
          <Field label="Broker">
            <Input value={broker} onChange={(e) => setBroker(e.target.value)} placeholder="Optional" />
          </Field>
          <Field label="Type">
            <Select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as Account['accountType'])}
            >
              {AccountType.options.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Starting balance">
            <Input
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              inputMode="decimal"
              placeholder="150000"
            />
          </Field>
          {isProp && (
            <>
              <Field label="Profit target">
                <Input
                  value={profitTarget}
                  onChange={(e) => setProfitTarget(e.target.value)}
                  inputMode="decimal"
                  placeholder="9000"
                />
              </Field>
              <Field label="Max drawdown">
                <Input
                  value={maxDrawdown}
                  onChange={(e) => setMaxDrawdown(e.target.value)}
                  inputMode="decimal"
                  placeholder="5000"
                />
              </Field>
            </>
          )}
        </div>
        <div className="flex items-center justify-end gap-3">
          {error && <span className="text-[12px] text-loss">{error}</span>}
          <button
            type="button"
            onClick={submit}
            disabled={create.isPending}
            className="rounded-md bg-gold px-4 py-2 text-[13px] font-semibold text-ink-on-accent transition-colors duration-fast hover:bg-gold-hover disabled:opacity-60"
          >
            {create.isPending ? 'Creating…' : 'Create account'}
          </button>
        </div>
      </div>
    </Card>
  );
}
