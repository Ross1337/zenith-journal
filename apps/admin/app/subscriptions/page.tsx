'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import AdminShell from '@/components/AdminShell';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string | null; displayName: string | null };
}

interface SubsResponse {
  subscriptions: Subscription[];
  total: number;
  page: number;
  limit: number;
}

const PLAN_COLORS: Record<string, string> = {
  free: '#6e7790',
  pro: '#42E2B8',
  lifetime: '#5B8EFF',
};

const STATUS_COLORS: Record<string, string> = {
  active: '#42E2B8',
  trialing: '#f2b544',
  past_due: '#ff8080',
  canceled: '#6e7790',
  incomplete: '#9b59b6',
};

export default function SubscriptionsPage() {
  const [data, setData] = useState<SubsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    apiFetch<SubsResponse>(`/admin/subscriptions?page=${page}&limit=50`)
      .then(setData)
      .catch(e => setError(e.message));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const planSummary = data?.subscriptions.reduce((acc, s) => {
    acc[s.plan] = (acc[s.plan] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AdminShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold font-display" style={{ color: '#eef1fa' }}>Subscriptions</h2>
          <p className="text-sm" style={{ color: '#6e7790' }}>{data?.total ?? '—'} total subscriptions</p>
        </div>

        {error && <p className="text-sm px-3 py-2 rounded" style={{ background: 'rgba(255,80,80,0.1)', color: '#ff8080' }}>{error}</p>}

        {/* Plan summary cards */}
        {planSummary && (
          <div className="grid grid-cols-3 gap-4">
            {['free', 'pro', 'lifetime'].map(plan => (
              <div key={plan} className="rounded-lg p-4 border" style={{ background: '#0e1018', borderColor: '#232a44' }}>
                <p className="text-xs font-medium mb-1" style={{ color: '#6e7790' }}>{plan.toUpperCase()}</p>
                <p className="text-2xl font-bold font-display" style={{ color: PLAN_COLORS[plan] }}>
                  {planSummary[plan] ?? 0}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#232a44' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#0e1018', borderBottom: '1px solid #1e2338' }}>
                {['User', 'Plan', 'Status', 'Period End', 'Cancel?', 'Created'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#6e7790' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.subscriptions.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #1e2338', background: i % 2 === 0 ? '#080910' : '#0a0c14' }}>
                  <td className="px-4 py-3">
                    <p style={{ color: '#eef1fa' }}>{s.user.email ?? s.user.id}</p>
                    <p className="text-xs" style={{ color: '#6e7790' }}>{s.user.displayName ?? ''}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${PLAN_COLORS[s.plan]}20`, color: PLAN_COLORS[s.plan] }}>
                      {s.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium" style={{ color: STATUS_COLORS[s.status] ?? '#6e7790' }}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#9ba5be' }}>
                    {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {s.cancelAtPeriodEnd
                      ? <span className="text-xs" style={{ color: '#ff8080' }}>Yes</span>
                      : <span className="text-xs" style={{ color: '#6e7790' }}>No</span>}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#6e7790' }}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {data?.subscriptions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: '#6e7790' }}>No subscriptions found</td>
                </tr>
              )}
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
