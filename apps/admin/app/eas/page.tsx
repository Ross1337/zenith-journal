'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import AdminShell from '@/components/AdminShell';

interface EA {
  id: string;
  name: string;
  broker: string | null;
  accountType: string;
  currency: string;
  currentBalance: number;
  isActive: boolean;
  createdAt: string;
  user: { id: string; email: string | null; displayName: string | null };
  _count: { trades: number };
}

export default function EAsPage() {
  const [eas, setEas] = useState<EA[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<EA[]>('/admin/eas')
      .then(setEas)
      .catch(e => setError(e.message));
  }, []);

  const active = eas.filter(e => e.isActive).length;

  return (
    <AdminShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold font-display" style={{ color: '#eef1fa' }}>EAs / MT5 Bridges</h2>
          <p className="text-sm" style={{ color: '#6e7790' }}>{active} active · {eas.length} total broker accounts</p>
        </div>

        {error && <p className="text-sm" style={{ color: '#ff8080' }}>{error}</p>}

        <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#232a44' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#0e1018', borderBottom: '1px solid #1e2338' }}>
                {['Account', 'Broker', 'Type', 'Balance', 'Trades', 'User', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#6e7790' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {eas.map((ea, i) => (
                <tr key={ea.id} style={{ borderBottom: '1px solid #1e2338', background: i % 2 === 0 ? '#080910' : '#0a0c14' }}>
                  <td className="px-4 py-3" style={{ color: '#eef1fa' }}>{ea.name}</td>
                  <td className="px-4 py-3" style={{ color: '#9ba5be' }}>{ea.broker ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(91,142,255,0.1)', color: '#5B8EFF' }}>
                      {ea.accountType}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm" style={{ color: '#42E2B8' }}>
                    {ea.currency} {ea.currentBalance.toLocaleString()}
                  </td>
                  <td className="px-4 py-3" style={{ color: '#6e7790' }}>{ea._count.trades}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#9ba5be' }}>{ea.user.email ?? ea.user.id}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: ea.isActive ? 'rgba(66,226,184,0.1)' : 'rgba(255,80,80,0.1)', color: ea.isActive ? '#42E2B8' : '#ff8080' }}>
                      {ea.isActive ? '● active' : '○ inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {eas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: '#6e7790' }}>No broker accounts found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
