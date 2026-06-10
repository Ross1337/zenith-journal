'use client';

import { useAccounts } from '@/lib/hooks';
import { useUiStore } from '@/lib/store';

/** Scope selector — every page reads the chosen account from the UI store. */
export function AccountSwitcher() {
  const { data: accounts } = useAccounts();
  const accountId = useUiStore((s) => s.accountId);
  const setAccountId = useUiStore((s) => s.setAccountId);

  if (!accounts || accounts.length === 0) return null;

  // A stale persisted id (deleted account) falls back to "all".
  const valid = accounts.some((a) => a.id === accountId) ? accountId : null;

  return (
    <select
      value={valid ?? 'all'}
      onChange={(e) => setAccountId(e.target.value === 'all' ? null : e.target.value)}
      className="h-8 rounded-md border border-edge bg-high px-2.5 text-[13px] text-ink focus:border-edge-strong"
      aria-label="Account scope"
    >
      <option value="all">All accounts</option>
      {accounts.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}
        </option>
      ))}
    </select>
  );
}
