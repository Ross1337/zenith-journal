'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import AdminShell from '@/components/AdminShell';

interface UserStar {
  id: string;
  email: string | null;
  displayName: string | null;
  stars: number;
  subscription?: { plan: string } | null;
}

interface UsersResponse {
  users: UserStar[];
  total: number;
}

export default function StarsPage() {
  const [users, setUsers] = useState<UserStar[]>([]);
  const [editing, setEditing] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    apiFetch<UsersResponse>('/admin/users?limit=100')
      .then(r => setUsers(r.users))
      .catch(e => setError(e.message));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function saveStars(id: string) {
    const stars = editing[id];
    if (stars === undefined) return;
    setSaving(id);
    try {
      await apiFetch(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ stars }) });
      load();
      setEditing(e => { const n = { ...e }; delete n[id]; return n; });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(null);
    }
  }

  const sorted = [...users].sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));

  return (
    <AdminShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold font-display" style={{ color: '#eef1fa' }}>Stars & Badges</h2>
          <p className="text-sm" style={{ color: '#6e7790' }}>Assign recognition stars to users</p>
        </div>

        {error && <p className="text-sm px-3 py-2 rounded" style={{ background: 'rgba(255,80,80,0.1)', color: '#ff8080' }}>{error}</p>}

        <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#232a44' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#0e1018', borderBottom: '1px solid #1e2338' }}>
                {['Rank', 'User', 'Plan', 'Stars', 'Edit'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#6e7790' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #1e2338', background: i < 3 ? 'rgba(66,226,184,0.03)' : (i % 2 === 0 ? '#080910' : '#0a0c14') }}>
                  <td className="px-4 py-3 text-lg">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span style={{ color: '#4f5870' }}>#{i + 1}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ color: '#eef1fa' }}>{u.displayName ?? u.email ?? u.id}</p>
                    <p className="text-xs" style={{ color: '#6e7790' }}>{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(66,226,184,0.1)', color: '#42E2B8' }}>
                      {u.subscription?.plan ?? 'free'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold font-display" style={{ color: '#f2b544' }}>
                      {'★'.repeat(Math.min(u.stars ?? 0, 5))} {u.stars ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input type="number" min={0} max={100}
                        value={editing[u.id] ?? u.stars ?? 0}
                        onChange={e => setEditing(prev => ({ ...prev, [u.id]: Number(e.target.value) }))}
                        className="w-16 px-2 py-1 rounded text-sm outline-none"
                        style={{ background: '#12151f', border: '1px solid #232a44', color: '#eef1fa' }} />
                      <button onClick={() => saveStars(u.id)} disabled={saving === u.id || editing[u.id] === undefined}
                        className="text-xs px-2 py-1 rounded transition-opacity"
                        style={{ background: 'rgba(66,226,184,0.1)', color: '#42E2B8', opacity: saving === u.id ? 0.5 : 1 }}>
                        {saving === u.id ? '…' : 'Save'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
