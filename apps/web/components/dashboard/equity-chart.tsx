'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fmtCurrency, fmtDate } from '@/lib/format';

export interface EquitySeriesPoint {
  t: number;
  equity: number;
}

export function EquityChart({ data, baseline }: { data: EquitySeriesPoint[]; baseline: number }) {
  return (
    <div className="h-[280px] w-full px-2 pb-3">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 16, right: 18, bottom: 4, left: 8 }}>
          <defs>
            <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F2B544" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#F2B544" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--z-border-subtle)" strokeDasharray="2 6" vertical={false} />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
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
            domain={['auto', 'auto']}
          />
          <Tooltip
            cursor={{ stroke: 'var(--z-border-strong)', strokeDasharray: '3 3' }}
            contentStyle={{
              background: 'var(--z-surface-overlay)',
              border: '1px solid var(--z-border-default)',
              borderRadius: 10,
              boxShadow: 'var(--z-shadow-overlay)',
              fontFamily: 'var(--z-font-mono)',
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--z-text-muted)' }}
            itemStyle={{ color: 'var(--z-gold)' }}
            labelFormatter={(t) => fmtDate(new Date(Number(t)))}
            formatter={(value) => [fmtCurrency(Number(value)), 'Equity']}
          />
          {/* Starting-balance reference */}
          <Area
            type="monotone"
            dataKey={() => baseline}
            stroke="var(--z-border-strong)"
            strokeDasharray="4 4"
            fill="none"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
            legendType="none"
            tooltipType="none"
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke="var(--z-gold)"
            strokeWidth={1.8}
            fill="url(#equityFill)"
            dot={false}
            activeDot={{ r: 3.5, fill: 'var(--z-gold)', stroke: 'var(--z-surface-raised)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
