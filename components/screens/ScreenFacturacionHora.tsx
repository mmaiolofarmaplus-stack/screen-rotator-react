import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { DashboardData } from '../../types';
import { formatMillions, formatPct } from '../../utils/formatters';

interface Props { data: DashboardData; }

const formatYAxis = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(0)}M`
  : v >= 1_000   ? `$${(v / 1_000).toFixed(0)}k`
  : v === 0      ? '$0' : `$${v}`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(0,0,0,0.92)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 16px' }}>
      <p style={{ color: '#9ca3af', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => p.value !== null && (
        <p key={p.dataKey} style={{ color: p.color, fontSize: 15, fontWeight: 800 }}>
          {p.name}: {formatMillions(p.value)}
        </p>
      ))}
    </div>
  );
};

export const ScreenFacturacionHora: React.FC<Props> = ({ data }) => {
  const { hourlyTotalsHoy, hourlyTotalsSemAnt, ultimaFranjaHora, totalNeto, varPctVsSemAnt } = data;

  const startIndex = 7;
  const hasHourlyData = ultimaFranjaHora > 0 && hourlyTotalsHoy.some(v => v > 0);

  const rawEnd = Math.min(ultimaFranjaHora, 19);
  let endIndex = startIndex;
  for (let h = startIndex; h <= rawEnd; h++) {
    if (hourlyTotalsHoy[h] > 0) endIndex = h;
  }

  const { chartData, semAntTotal, peakHour } = useMemo(() => {
    const chartData = [];
    for (let h = startIndex; h <= endIndex; h++) {
      const hoy  = hourlyTotalsHoy[h] > 0 ? hourlyTotalsHoy[h] : null;
      const prev = hourlyTotalsSemAnt[h] > 0 ? hourlyTotalsSemAnt[h] : null;
      chartData.push({ time: `${h}:00`, hoy, prev });
    }
    const prevSlice   = hourlyTotalsSemAnt.slice(startIndex, endIndex + 1);
    const semAntTotal = prevSlice.reduce((a, b) => a + b, 0);
    const todaySlice  = hourlyTotalsHoy.slice(startIndex, endIndex + 1);
    const peakHour    = startIndex + todaySlice.reduce(
      (best, val, i) => val > (todaySlice[best] ?? 0) ? i : best, 0
    );
    return { chartData, semAntTotal, peakHour };
  }, [hourlyTotalsHoy, hourlyTotalsSemAnt, endIndex]);

  return (
    <div className="w-screen h-screen bg-[#0b0e14] text-white flex flex-col p-8 overflow-hidden">
      <div className="mb-6 shrink-0 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <p className="text-[#325795] text-sm font-bold tracking-[0.3em] uppercase mb-1">
            Red total · franja {startIndex}–{endIndex}hs
          </p>
          <h1 className="text-4xl font-black uppercase tracking-wider">Facturación por Hora</h1>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <p className="text-gray-400 text-sm font-bold tracking-widest">TOTAL HOY</p>
            <p className="text-white font-mono font-black text-3xl">{formatMillions(totalNeto)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm font-bold tracking-widest">VS SEM. ANT.</p>
            <p className={`font-mono font-black text-3xl ${varPctVsSemAnt >= 0 ? 'text-[#01B693]' : 'text-[#f59e0b]'}`}>
              {varPctVsSemAnt >= 0 ? '+' : ''}{formatPct(varPctVsSemAnt)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm font-bold tracking-widest">SEM. ANT. (HOY)</p>
            <p className="text-white font-mono font-black text-3xl">{formatMillions(semAntTotal)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm font-bold tracking-widest">HORA PICO</p>
            <p className="text-white font-mono font-black text-3xl">{peakHour}:00hs</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        {hasHourlyData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 24, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradHoy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#C8102E" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#0b0e14" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="transparent"
                tick={{ fill: '#9ca3af', fontSize: 14, fontWeight: 600 }}
                axisLine={false} tickLine={false} dy={10}
              />
              <YAxis
                stroke="transparent"
                tick={{ fill: '#9ca3af', fontSize: 13 }}
                tickFormatter={formatYAxis}
                axisLine={false} tickLine={false}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                x={`${endIndex}:00`}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={1.5}
              />
              <Area
                type="monotone" dataKey="prev" name="Sem. ant."
                stroke="rgba(255,255,255,0.25)" strokeWidth={2} strokeDasharray="6 4"
                fill="transparent" connectNulls={false}
                dot={false} activeDot={{ r: 4, fill: '#fff', stroke: '#fff' }}
              />
              <Area
                type="monotone" dataKey="hoy" name="Hoy"
                stroke="#f59e0b" strokeWidth={4}
                fill="url(#gradHoy)" fillOpacity={1}
                connectNulls={false}
                dot={false} activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500 text-2xl font-semibold tracking-widest uppercase">Esperando datos del día…</p>
          </div>
        )}
      </div>
    </div>
  );
};
