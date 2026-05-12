import React, { useMemo } from 'react';
import { DashboardData, BranchData } from '../../types';
import { formatMillions, formatPct } from '../../utils/formatters';
import { AnimatedBar } from '../AnimatedBar';
import { AutoScrollList } from '../AutoScrollList';

interface Props { data: DashboardData; }

const rowColor = (pct: number) =>
  pct >= 100 ? '#01B693' : pct >= 80 ? '#f59e0b' : '#f59e0b';

const COLS = '2.5rem 1fr 280px 140px 240px';

const BranchRow: React.FC<{ b: BranchData; rank: number; diasMes: number }> = ({ b, rank, diasMes }) => {
  const metaMensual = b.metaDiaria * diasMes;
  const pct   = metaMensual > 0 ? (b.acumNeto / metaMensual) * 100 : 0;
  const c     = rowColor(pct);
  const diff  = b.acumNeto - metaMensual;
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : String(rank);

  return (
    <div className="grid items-center gap-x-6 py-2 border-b border-white/5"
         style={{ gridTemplateColumns: COLS }}>
      <span className="text-gray-500 font-bold text-base text-right">{medal}</span>
      <div className="flex flex-col gap-1.5 min-w-0">
        <span className="text-white font-bold text-lg uppercase tracking-wide truncate">{b.name}</span>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <AnimatedBar pct={Math.min(pct, 100)} color={c} delay={rank * 15} />
        </div>
      </div>
      <div className="text-right">
        <div className="text-white font-mono font-bold text-xl leading-tight">{formatMillions(b.acumNeto)}</div>
        <div className="text-gray-400 font-mono text-base leading-tight">{formatMillions(metaMensual)}</div>
      </div>
      <span className="font-mono font-black text-3xl text-right" style={{ color: c }}>
        {formatPct(pct)}%
      </span>
      <span className="font-mono font-black text-2xl text-right" style={{ color: diff >= 0 ? '#01B693' : '#f59e0b' }}>
        {diff >= 0 ? `+${formatMillions(diff)}` : `-${formatMillions(Math.abs(diff))}`}
      </span>
    </div>
  );
};

export const ScreenAcumMes: React.FC<Props> = ({ data }) => {
  const { sorted, sobre, bajo, totalMeta } = useMemo(() => {
    const withMeta = data.branches.filter(b => b.metaDiaria > 0);
    const sorted   = [...withMeta].sort((a, b) => {
      const mA = a.metaDiaria * data.diasMes;
      const mB = b.metaDiaria * data.diasMes;
      return (mB > 0 ? b.acumNeto / mB : 0) - (mA > 0 ? a.acumNeto / mA : 0);
    });
    const totalMeta = sorted.reduce((s, b) => s + b.metaDiaria * data.diasMes, 0);
    return {
      sorted,
      sobre: sorted.filter(b => b.acumNeto >= b.metaDiaria * data.diasMes).length,
      bajo:  sorted.filter(b => b.acumNeto <  b.metaDiaria * data.diasMes).length,
      totalMeta,
    };
  }, [data.branches, data.diasMes]);

  const avanceRed = totalMeta > 0 ? (data.totalAcumNeto / totalMeta) * 100 : 0;
  const pctMes    = data.diasMes > 0 ? (data.diaActual / data.diasMes) * 100 : 0;

  return (
    <div className="w-screen h-screen bg-[#0b0e14] text-white flex flex-col p-8 overflow-hidden">
      <div className="mb-4 shrink-0 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <p className="text-[#325795] text-sm font-bold tracking-[0.3em] uppercase mb-1">
            Día {data.diaActual} de {data.diasMes} · {formatPct(pctMes, 0)}% del mes transcurrido
          </p>
          <h1 className="text-4xl font-black uppercase tracking-wider">Acumulado del Mes</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-gray-400 text-sm font-bold tracking-widest uppercase">Avance Red</p>
            <p className="font-mono font-black text-3xl" style={{ color: rowColor(avanceRed) }}>
              {formatPct(avanceRed)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm font-bold tracking-widest uppercase">Acum. Red</p>
            <p className="text-white font-mono font-black text-3xl">{formatMillions(data.totalAcumNeto)}</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-[#01B693]/10 border border-[#01B693]/20">
            <p className="font-mono font-black text-3xl text-[#01B693]">{sobre}</p>
            <p className="text-gray-400 text-xs font-bold tracking-wider uppercase mt-0.5">Sobre Meta</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20">
            <p className="font-mono font-black text-3xl text-[#f59e0b]">{bajo}</p>
            <p className="text-gray-400 text-xs font-bold tracking-wider uppercase mt-0.5">Bajo Meta</p>
          </div>
        </div>
      </div>

      <div className="grid gap-x-6 mb-1 shrink-0" style={{ gridTemplateColumns: COLS }}>
        <span />
        <span className="text-gray-500 text-xs font-bold tracking-widest uppercase">Sucursal</span>
        <span className="text-gray-500 text-xs font-bold tracking-widest uppercase text-right">Acum / Meta Mes</span>
        <span className="text-gray-500 text-xs font-bold tracking-widest uppercase text-right">Avance</span>
        <span className="text-gray-500 text-xs font-bold tracking-widest uppercase text-right">Diferencia</span>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <AutoScrollList
          items={sorted}
          itemHeight={62}
          renderItem={(b, i) => <BranchRow key={b.id} b={b} rank={i + 1} diasMes={data.diasMes} />}
        />
      </div>
    </div>
  );
};
