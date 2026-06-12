'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import AdminShell from '@/components/AdminShell';

interface Stats {
  totalUsers: number;
  totalTrades: number;
  totalAccounts: number;
  subscriptions: { free: number; pro: number; lifetime: number };
  affiliatesActive: number;
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="rounded-lg p-5 border" style={{ background: '#0e1018', borderColor: '#232a44' }}>
      <p className="text-xs font-medium mb-1" style={{ color: '#6e7790' }}>{label}</p>
      <p className="text-2xl font-bold font-display" style={{ color: accent ?? '#eef1fa' }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: '#6e7790' }}>{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<Stats>('/admin/stats')
      .then(setStats)
      .catch(e => setError(e.message));
  }, []);

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold font-display mb-1" style={{ color: '#eef1fa' }}>Overview</h2>
          <p className="text-sm" style={{ color: '#6e7790' }}>Platform statistics at a glance</p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-md text-sm" style={{ background: 'rgba(255,80,80,0.1)', color: '#ff8080' }}>
            {error}
          </div>
        )}

        {!stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg p-5 border animate-pulse" style={{ background: '#0e1018', borderColor: '#232a44', height: 90 }} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Users" value={stats.totalUsers} accent="#42E2B8" />
              <StatCard label="Total Trades" value={stats.totalTrades} />
              <StatCard label="Accounts" value={stats.totalAccounts} />
              <StatCard label="Affiliates Active" value={stats.affiliatesActive} accent="#5B8EFF" />
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#9ba5be' }}>Subscriptions (active)</h3>
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Free" value={stats.subscriptions.free} sub="active accounts" />
                <StatCard label="Pro" value={stats.subscriptions.pro} sub="active accounts" accent="#42E2B8" />
                <StatCard label="Lifetime" value={stats.subscriptions.lifetime} sub="active accounts" accent="#5B8EFF" />
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
