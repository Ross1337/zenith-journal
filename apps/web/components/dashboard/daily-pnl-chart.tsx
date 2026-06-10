'use client';

import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fmtCurrency, fmtDate, fmtPnl } from '@/lib/format';

export interface DailyBar {
  t: number;
  pnl: number;
}

export function DailyPnlChart({ data }: { data: DailyBar[] }) {
  return (
    <div className="h-[280px] w-full px-2 pb-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 18, bottom: 4, left: 8 }}>
          <XAxis
            dataKey="t"
            tickFormatter={(t: number) => fmtDate(new Date(t))}
            tick={{ fill: 'var(--z-text-muted)', fontSize: 11, fontFamily: 'var(--z-font-mono)' }}
            axisLine={{ stroke: 'var(--z-border-default)' }}
            tickLine={false}
            minTickGap={48}
          />
          <YAxis
            tickFormatter={(v: number) => fmtCurrency(v, true)}
            tick={{ fill: 'var(--z-text-muted)', fontSize: 11, fontFamily: 'var(--z-font-mono)' }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip
            cursor={{ fill: 'var(--z-surface-hover)' }}
            contentStyle={{
              background: 'var(--z-surface-overlay)',
              border: '1px solid var(--z-border-default)',
              borderRadius: 10,
              boxShadow: 'var(--z-shadow-overlay)',
              fontFamily: 'var(--z-font-mono)',
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--z-text-muted)' }}
            labelFormatter={(t) => fmtDate(new Date(Number(t)))}
            formatter={(value) => [fmtPnl(Number(value)), 'Net P&L']}
          />
          <ReferenceLine y={0} stroke="var(--z-border-strong)" />
          <Bar dataKey="pnl" radius={[3, 3, 0, 0]} maxBarSize={18}>
            {data.map((d) => (
              <Cell key={d.t} fill={d.pnl >= 0 ? 'var(--z-profit)' : 'var(--z-loss)'} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
