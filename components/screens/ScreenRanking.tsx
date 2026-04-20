import React, { useMemo } from 'react';
import { DashboardData, BranchData } from '../../types';
import { formatMillions } from '../../utils/formatters';
import { AnimatedBar } from '../AnimatedBar';
import { AutoScrollList } from '../AutoScrollList';

interface Props { data: DashboardData; }

const SEMAFORO_COLOR: Record<string, string> = {
  'VERDE SOBRE META 3':    '#01B693',
  'AMARILLO SOBRE META 2': '#f59e0b',
  'NARANJA SOBRE META 1':  '#f97316',
  'NARANJA CERCA META 1':  '#fb923c',
  'ROJO DEBAJO META 1':    '#C8102E',
  'SIN OBJETIVO':          '#6b7280',
};

const SEMAFORO_LABEL: Record<string, string> = {
  'VERDE SOBRE META 3':    'M3',
  'AMARILLO SOBRE META 2': 'M2',
  'NARANJA SOBRE META 1':  'M1',
  'NARANJA CERCA META 1':  '~M1',
  'ROJO DEBAJO META 1':    'BAJO',
  'SIN OBJETIVO':          '—',
};

const BranchRow: React.FC<{ b: BranchData; rank: number; maxNeto: number }> = ({ b, rank, maxNeto }) => {
  const color = SEMAFORO_COLOR[b.semaforo] ?? '#6b7280';
  const widthPct = maxNeto > 0 ? (b.acumNeto / maxNeto) * 100 : 0;
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  return (
    <div className="flex flex-col gap-0.5 py-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-gray-500 font-bold text-xs w-5 text-right shrink-0">{medal ?? rank}</span>
          <span
            className="text-[10px] font-black px-1.5 py-0.5 rounded shrink-0"
            style={{ color, background: color + '22' }}
          >
            {SEMAFORO_LABEL[b.semaforo] ?? '—'}
          </span>
          <span className="text-white font-bold text-xs uppercase tracking-wide truncate">{b.name}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-gray-400 text-[10px] font-mono">{b.avancePctM3.toFixed(0)}% M3</span>
          <span className="text-white font-mono font-black text-xs">{formatMillions(b.acumNeto)}</span>
        </div>
      </div>
      <div className="ml-7 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <AnimatedBar pct={widthPct} color={color} delay={rank * 18} />
      </div>
    </div>
  );
};

export const ScreenRanking: React.FC<Props> = ({ data }) => {
  const { sorted, half, maxNeto, countByMeta } = useMemo(() => {
    const sorted = [...data.branches].sort((a, b) => b.acumNeto - a.acumNeto);
    return {
      sorted,
      half: Math.ceil(sorted.length / 2),
      maxNeto: sorted[0]?.acumNeto ?? 1,
      countByMeta: {
        m3:   data.branches.filter(b => b.semaforo === 'VERDE SOBRE META 3').length,
        m2:   data.branches.filter(b => b.semaforo === 'AMARILLO SOBRE META 2').length,
        m1:   data.branches.filter(b => b.semaforo === 'NARANJA SOBRE META 1').length,
        bajo: data.branches.filter(b => b.semaforo === 'ROJO DEBAJO META 1' || b.semaforo === 'NARANJA CERCA META 1').length,
      },
    };
  }, [data.branches]);

  return (
    <div className="w-screen h-screen bg-[#0b0e14] text-white flex flex-col p-8 overflow-hidden">
      <div className="mb-6 shrink-0 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <p className="text-[#325795] text-xs font-bold tracking-[0.3em] uppercase mb-1">Acumulado del mes · Día {data.diaActual}/{data.diasMes}</p>
          <h1 className="text-4xl font-black uppercase tracking-wider">Ranking de Sucursales</h1>
        </div>
        <div className="flex gap-4">
          <div className="text-right mr-4">
            <p className="text-gray-500 text-xs font-bold tracking-widest">ACUM. RED</p>
            <p className="text-white font-mono font-black text-2xl">{formatMillions(data.totalAcumNeto)}</p>
          </div>
          {([
            { count: countByMeta.m3,   color: '#01B693', label: 'META 3' },
            { count: countByMeta.m2,   color: '#f59e0b', label: 'META 2' },
            { count: countByMeta.m1,   color: '#f97316', label: 'META 1' },
            { count: countByMeta.bajo, color: '#C8102E', label: 'BAJO'   },
          ] as { count: number; color: string; label: string }[]).map(({ count, color, label }) => (
            <div key={label} className="text-center px-3 py-1 rounded-lg" style={{ background: color + '22' }}>
              <p className="font-mono font-black text-2xl" style={{ color }}>{count}</p>
              <p className="text-gray-500 text-[10px] font-bold">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-x-10 overflow-hidden">
        <div className="h-full overflow-hidden pr-2">
          <AutoScrollList
            items={sorted.slice(0, half)}
            itemHeight={44}
            renderItem={(b, i) => <BranchRow key={b.id} b={b} rank={i + 1} maxNeto={maxNeto} />}
          />
        </div>
        <div className="h-full overflow-hidden pl-2 border-l border-white/5">
          <AutoScrollList
            items={sorted.slice(half)}
            itemHeight={44}
            renderItem={(b, i) => <BranchRow key={b.id} b={b} rank={half + i + 1} maxNeto={maxNeto} />}
          />
        </div>
      </div>
    </div>
  );
};
