'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import AdminShell from '@/components/AdminShell';

interface Affiliate {
  id: string;
  email: string | null;
  displayName: string | null;
  affiliateStatus: string;
  affiliateBroker: string | null;
  createdAt: string;
  subscription?: { plan: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f2b544',
  VALIDATED: '#42E2B8',
  NONE: '#6e7790',
};

export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [error, setError] = useState('');

  function load() {
    apiFetch<Affiliate[]>('/admin/affiliates')
      .then(setAffiliates)
      .catch(e => setError(e.message));
  }

  useEffect(() => { load(); }, []);

  async function validate(id: string) {
    if (!confirm('Validate this affiliate and grant Lifetime access?')) return;
    try {
      await apiFetch(`/admin/affiliates/${id}/validate`, { method: 'PATCH' });
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  }

  const pending = affiliates.filter(a => a.affiliateStatus === 'PENDING');
  const validated = affiliates.filter(a => a.affiliateStatus === 'VALIDATED');

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold font-display" style={{ color: '#eef1fa' }}>Affiliates</h2>
          <p className="text-sm" style={{ color: '#6e7790' }}>
            {pending.length} pending · {validated.length} validated
          </p>
        </div>

        {error && <p className="text-sm px-3 py-2 rounded" style={{ background: 'rgba(255,80,80,0.1)', color: '#ff8080' }}>{error}</p>}

        {/* Pending first */}
        {pending.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#f2b544' }}>⏳ Pending validation</h3>
            <div className="space-y-2">
              {pending.map(a => (
                <div key={a.id} className="flex items-center justify-between rounded-lg px-4 py-3 border"
                  style={{ background: '#0e1018', borderColor: '#f2b544', borderLeftWidth: 3 }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#eef1fa' }}>{a.email}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#6e7790' }}>
                      Broker: {a.affiliateBroker ?? 'N/A'} · Joined {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button onClick={() => validate(a.id)}
                    className="text-sm px-3 py-1.5 rounded font-medium"
                    style={{ background: 'linear-gradient(135deg, #42E2B8, #5B8EFF)', color: '#080910' }}>
                    ✓ Validate → Lifetime
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All affiliates table */}
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#232a44' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#0e1018', borderBottom: '1px solid #1e2338' }}>
                {['Email', 'Broker', 'Plan', 'Status', 'Joined'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#6e7790' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {affiliates.map((a, i) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #1e2338', background: i % 2 === 0 ? '#080910' : '#0a0c14' }}>
                  <td className="px-4 py-3" style={{ color: '#eef1fa' }}>{a.email ?? '—'}</td>
                  <td className="px-4 py-3" style={{ color: '#9ba5be' }}>{a.affiliateBroker ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(66,226,184,0.1)', color: '#42E2B8' }}>
                      {a.subscription?.plan ?? 'free'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium" style={{ color: STATUS_COLORS[a.affiliateStatus] ?? '#6e7790' }}>
                      {a.affiliateStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#6e7790' }}>
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {affiliates.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: '#6e7790' }}>No affiliates yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
