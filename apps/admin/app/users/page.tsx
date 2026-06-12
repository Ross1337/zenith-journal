'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import AdminShell from '@/components/AdminShell';
import Link from 'next/link';

interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  role: string;
  affiliateStatus: string;
  stars: number;
  createdAt: string;
  subscription?: { plan: string; status: string } | null;
  _count?: { trades: number; accounts: number };
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

const PLAN_COLORS: Record<string, string> = {
  free: '#6e7790',
  pro: '#42E2B8',
  lifetime: '#5B8EFF',
};

export default function UsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (search) params.set('search', search);
    if (plan) params.set('plan', plan);
    apiFetch<UsersResponse>(`/admin/users?${params}`)
      .then(setData)
      .catch(e => setError(e.message));
  }, [page, search, plan]);

  useEffect(() => { load(); }, [load]);

  async function changePlan(id: string, newPlan: string) {
    await apiFetch(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ plan: newPlan }) });
    load();
  }

  async function deleteUser(id: string, email: string | null) {
    if (!confirm(`Delete user ${email ?? id}? This is irreversible.`)) return;
    await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <AdminShell>
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-display" style={{ color: '#eef1fa' }}>Users</h2>
            <p className="text-sm" style={{ color: '#6e7790' }}>{data?.total ?? '—'} total</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <input
            type="search"
            placeholder="Search email or name…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-md text-sm outline-none"
            style={{ background: '#0e1018', border: '1px solid #232a44', color: '#eef1fa', width: 260 }}
          />
          <select
            value={plan}
            onChange={e => { setPlan(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-md text-sm outline-none"
            style={{ background: '#0e1018', border: '1px solid #232a44', color: '#eef1fa' }}
          >
            <option value="">All plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="lifetime">Lifetime</option>
          </select>
        </div>

        {error && <p className="text-sm" style={{ color: '#ff8080' }}>{error}</p>}

        {/* Table */}
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#232a44' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#0e1018', borderBottom: '1px solid #1e2338' }}>
                {['Email', 'Name', 'Plan', 'Trades', 'Joined', 'Role', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#6e7790' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #1e2338', background: i % 2 === 0 ? '#080910' : '#0a0c14' }}>
                  <td className="px-4 py-3" style={{ color: '#eef1fa' }}>{u.email ?? '—'}</td>
                  <td className="px-4 py-3" style={{ color: '#9ba5be' }}>{u.displayName ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${PLAN_COLORS[u.subscription?.plan ?? 'free']}20`, color: PLAN_COLORS[u.subscription?.plan ?? 'free'] }}>
                      {u.subscription?.plan ?? 'free'}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: '#6e7790' }}>{u._count?.trades ?? 0}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#6e7790' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: u.role === 'ADMIN' ? '#42E2B8' : '#6e7790' }}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/users/${u.id}`} className="text-xs px-2 py-1 rounded"
                        style={{ background: 'rgba(91,142,255,0.1)', color: '#5B8EFF' }}>View</Link>
                      <select
                        defaultValue=""
                        onChange={e => { if (e.target.value) changePlan(u.id, e.target.value); e.target.value = ''; }}
                        className="text-xs px-2 py-1 rounded outline-none"
                        style={{ background: '#12151f', border: '1px solid #232a44', color: '#9ba5be' }}
                      >
                        <option value="" disabled>Plan…</option>
                        <option value="free">→ Free</option>
                        <option value="pro">→ Pro</option>
                        <option value="lifetime">→ Lifetime</option>
                      </select>
                      <button onClick={() => deleteUser(u.id, u.email)} className="text-xs px-2 py-1 rounded"
                        style={{ background: 'rgba(255,80,80,0.1)', color: '#ff8080' }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total > data.limit && (
          <div className="flex items-center gap-3 justify-end">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 text-sm rounded" style={{ background: '#0e1018', border: '1px solid #232a44', color: '#9ba5be' }}>
              ← Prev
            </button>
            <span className="text-xs" style={{ color: '#6e7790' }}>Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page * data.limit >= data.total}
              className="px-3 py-1 text-sm rounded" style={{ background: '#0e1018', border: '1px solid #232a44', color: '#9ba5be' }}>
              Next →
            </button>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
