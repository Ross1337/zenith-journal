'use client';

import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { RBucket } from '@/lib/analytics';

/** Histogram of realized R multiples — the shape of the edge. */
export function RDistribution({ data }: { data: RBucket[] }) {
  return (
    <div className="h-[240px] w-full px-2 pb-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 18, bottom: 4, left: 8 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--z-text-muted)', fontSize: 10.5, fontFamily: 'var(--z-font-mono)' }}
            axisLine={{ stroke: 'var(--z-border-default)' }}
            tickLine={false}
            interval={1}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: 'var(--z-text-muted)', fontSize: 11, fontFamily: 'var(--z-font-mono)' }}
            axisLine={false}
            tickLine={false}
            width={32}
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
            formatter={(value) => [`${value} trades`, 'Count']}
            labelFormatter={(l) => `${l}R bucket`}
          />
          <ReferenceLine x="+0.0" stroke="var(--z-border-strong)" strokeDasharray="3 3" />
          <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={22}>
            {data.map((b) => (
              <Cell
                key={b.label}
                fill={b.from >= 0 ? 'var(--z-profit)' : 'var(--z-loss)'}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
