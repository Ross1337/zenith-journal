'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import AdminShell from '@/components/AdminShell';
import Link from 'next/link';

interface UserDetail {
  id: string;
  email: string | null;
  displayName: string | null;
  role: string;
  affiliateStatus: string;
  affiliateBroker: string | null;
  stars: number;
  createdAt: string;
  subscription?: { plan: string; status: string; currentPeriodEnd?: string } | null;
  accounts?: Array<{ id: string; name: string; broker: string | null; accountType: string; currentBalance: number; isActive: boolean }>;
  _count?: { trades: number; journalEntries: number };
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editStars, setEditStars] = useState(0);

  function load() {
    apiFetch<UserDetail>(`/admin/users/${id}`)
      .then(u => { setUser(u); setEditStars(u.stars); })
      .catch(e => setError(e.message));
  }

  useEffect(() => { load(); }, [id]);

  async function update(data: Record<string, unknown>) {
    setSaving(true);
    try {
      await apiFetch(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  if (!user) return (
    <AdminShell>
      <div className="text-sm" style={{ color: '#6e7790' }}>{error || 'Loading…'}</div>
    </AdminShell>
  );

  return (
    <AdminShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/users" className="text-sm" style={{ color: '#6e7790' }}>← Users</Link>
          <span style={{ color: '#2a3050' }}>/</span>
          <span className="text-sm" style={{ color: '#eef1fa' }}>{user.email}</span>
        </div>

        {error && <p className="text-sm px-3 py-2 rounded" style={{ background: 'rgba(255,80,80,0.1)', color: '#ff8080' }}>{error}</p>}

        {/* Account Info */}
        <div className="rounded-lg p-5 border" style={{ background: '#0e1018', borderColor: '#232a44' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#eef1fa' }}>Account Info</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['ID', user.id],
              ['Email', user.email],
              ['Name', user.displayName],
              ['Role', user.role],
              ['Joined', new Date(user.createdAt).toLocaleString()],
              ['Affiliate', user.affiliateStatus],
              ['Broker', user.affiliateBroker],
            ].map(([k, v]) => (
              <div key={k as string}>
                <dt className="text-xs mb-0.5" style={{ color: '#6e7790' }}>{k}</dt>
                <dd style={{ color: '#eef1fa' }}>{v ?? '—'}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Trades', value: user._count?.trades ?? 0 },
            { label: 'Journal Entries', value: user._count?.journalEntries ?? 0 },
            { label: 'Accounts', value: user.accounts?.length ?? 0 },
          ].map(s => (
            <div key={s.label} className="rounded-lg p-4 border text-center" style={{ background: '#0e1018', borderColor: '#232a44' }}>
              <p className="text-2xl font-bold font-display" style={{ color: '#42E2B8' }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: '#6e7790' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Subscription */}
        <div className="rounded-lg p-5 border" style={{ background: '#0e1018', borderColor: '#232a44' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#eef1fa' }}>Subscription</h3>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm px-3 py-1 rounded-full" style={{ background: 'rgba(66,226,184,0.1)', color: '#42E2B8' }}>
              {user.subscription?.plan ?? 'free'} · {user.subscription?.status ?? 'active'}
            </span>
            {user.subscription?.currentPeriodEnd && (
              <span className="text-xs" style={{ color: '#6e7790' }}>
                Expires: {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {['free', 'pro', 'lifetime'].map(p => (
              <button key={p} onClick={() => update({ plan: p })} disabled={saving}
                className="text-xs px-3 py-1.5 rounded font-medium transition-colors"
                style={{ background: user.subscription?.plan === p ? 'rgba(66,226,184,0.15)' : '#12151f', border: '1px solid #232a44', color: user.subscription?.plan === p ? '#42E2B8' : '#9ba5be' }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Stars */}
        <div className="rounded-lg p-5 border" style={{ background: '#0e1018', borderColor: '#232a44' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#eef1fa' }}>Stars / Badges</h3>
          <div className="flex items-center gap-3">
            <span className="text-2xl">★</span>
            <input type="number" min={0} max={100} value={editStars} onChange={e => setEditStars(Number(e.target.value))}
              className="w-24 px-3 py-1.5 rounded text-sm outline-none"
              style={{ background: '#12151f', border: '1px solid #232a44', color: '#eef1fa' }} />
            <button onClick={() => update({ stars: editStars })} disabled={saving}
              className="px-3 py-1.5 text-sm rounded"
              style={{ background: 'rgba(66,226,184,0.1)', color: '#42E2B8' }}>Save</button>
          </div>
        </div>

        {/* Accounts */}
        {user.accounts && user.accounts.length > 0 && (
          <div className="rounded-lg p-5 border" style={{ background: '#0e1018', borderColor: '#232a44' }}>
            <h3 className="font-semibold mb-4" style={{ color: '#eef1fa' }}>Trading Accounts</h3>
            <div className="space-y-2">
              {user.accounts.map(a => (
                <div key={a.id} className="flex items-center justify-between text-sm px-3 py-2 rounded"
                  style={{ background: '#12151f' }}>
                  <div>
                    <span style={{ color: '#eef1fa' }}>{a.name}</span>
                    {a.broker && <span className="ml-2 text-xs" style={{ color: '#6e7790' }}>{a.broker}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: '#9ba5be' }}>{a.accountType}</span>
                    <span style={{ color: '#42E2B8' }}>${a.currentBalance.toLocaleString()}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: a.isActive ? 'rgba(66,226,184,0.1)' : 'rgba(255,80,80,0.1)', color: a.isActive ? '#42E2B8' : '#ff8080' }}>
                      {a.isActive ? 'active' : 'inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
