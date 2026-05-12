import React, { useMemo } from 'react';
import { DashboardData, BranchData } from '../../types';
import { formatMillions, formatPct } from '../../utils/formatters';
import { AnimatedBar } from '../AnimatedBar';
import { AutoScrollList } from '../AutoScrollList';

interface Props { data: DashboardData; }

const DAY_START = 7;
const DAY_END   = 19;
const DAY_HOURS = DAY_END - DAY_START;

const rowColor = (pct: number) =>
  pct >= 100 ? '#01B693' : pct >= 80 ? '#f59e0b' : '#f59e0b';

type BranchProjection = BranchData & { projected: number; projectedPct: number };

const COLS = '2.5rem 1fr 280px 140px 240px';

const BranchRow: React.FC<{ b: BranchProjection; rank: number }> = ({ b, rank }) => {
  const c    = rowColor(b.projectedPct);
  const diff = b.projected - b.metaDiaria;
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : String(rank);

  return (
    <div className="grid items-center gap-x-6 py-2 border-b border-white/5"
         style={{ gridTemplateColumns: COLS }}>
      <span className="text-gray-500 font-bold text-base text-right">{medal}</span>
      <div className="flex flex-col gap-1.5 min-w-0">
        <span className="text-white font-bold text-lg uppercase tracking-wide truncate">{b.name}</span>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <AnimatedBar pct={Math.min(b.projectedPct, 100)} color={c} delay={rank * 15} />
        </div>
      </div>
      <div className="text-right">
        <div className="text-white font-mono font-bold text-xl leading-tight">{formatMillions(b.projected)}</div>
        <div className="text-gray-400 font-mono text-base leading-tight">{formatMillions(b.metaDiaria)}</div>
      </div>
      <span className="font-mono font-black text-3xl text-right" style={{ color: c }}>
        {formatPct(b.projectedPct)}%
      </span>
      <span className="font-mono font-black text-2xl text-right" style={{ color: diff >= 0 ? '#01B693' : '#f59e0b' }}>
        {diff >= 0 ? `+${formatMillions(diff)}` : `-${formatMillions(Math.abs(diff))}`}
      </span>
    </div>
  );
};

export const ScreenProyeccionDia: React.FC<Props> = ({ data }) => {
  const { ultimaFranjaHora, totalNeto, totalMetaDiaria } = data;

  const completedHours = Math.max(0, ultimaFranjaHora - DAY_START);
  const factor         = completedHours > 0 ? DAY_HOURS / completedHours : 1;

  const { projectedRed, pctVsMeta, sobre, bajo, sorted } = useMemo(() => {
    const projectedRed = totalNeto * factor;
    const pctVsMeta    = totalMetaDiaria > 0 ? (projectedRed / totalMetaDiaria) * 100 : 0;

    const withMeta = data.branches
      .filter(b => b.metaDiaria > 0 && b.hoyNeto > 0)
      .map((b): BranchProjection => {
        const projected    = b.hoyNeto * factor;
        const projectedPct = (projected / b.metaDiaria) * 100;
        return { ...b, projected, projectedPct };
      })
      .sort((a, b) => b.projectedPct - a.projectedPct);

    return {
      projectedRed,
      pctVsMeta,
      sobre: withMeta.filter(b => b.projectedPct >= 100).length,
      bajo:  withMeta.filter(b => b.projectedPct < 100).length,
      sorted: withMeta,
    };
  }, [data.branches, totalNeto, totalMetaDiaria, factor]);

  return (
    <div className="w-screen h-screen bg-[#0b0e14] text-white flex flex-col p-8 overflow-hidden">
      <div className="mb-4 shrink-0 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <p className="text-[#325795] text-sm font-bold tracking-[0.3em] uppercase mb-1">
            Al ritmo actual · proyección a las {DAY_END}hs
          </p>
          <h1 className="text-4xl font-black uppercase tracking-wider">Proyección Fin del Día</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-gray-400 text-sm font-bold tracking-widest uppercase">Proyección Red</p>
            <p className="text-white font-mono font-black text-3xl">{formatMillions(projectedRed)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm font-bold tracking-widest uppercase">% vs Meta</p>
            <p className="font-mono font-black text-3xl" style={{ color: rowColor(pctVsMeta) }}>
              {formatPct(pctVsMeta)}%
            </p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-[#01B693]/10 border border-[#01B693]/20">
            <p className="font-mono font-black text-3xl text-[#01B693]">{sobre}</p>
            <p className="text-gray-400 text-xs font-bold tracking-wider uppercase mt-0.5">Llegan</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20">
            <p className="font-mono font-black text-3xl text-[#f59e0b]">{bajo}</p>
            <p className="text-gray-400 text-xs font-bold tracking-wider uppercase mt-0.5">No llegan</p>
          </div>
        </div>
      </div>

      {completedHours < 1 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 font-mono text-xl font-bold uppercase tracking-widest">
            Sin datos suficientes — esperando inicio de jornada
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-x-6 mb-1 shrink-0" style={{ gridTemplateColumns: COLS }}>
            <span />
            <span className="text-gray-500 text-xs font-bold tracking-widest uppercase">Sucursal</span>
            <span className="text-gray-500 text-xs font-bold tracking-widest uppercase text-right">Proyección / Meta</span>
            <span className="text-gray-500 text-xs font-bold tracking-widest uppercase text-right">% Meta</span>
            <span className="text-gray-500 text-xs font-bold tracking-widest uppercase text-right">Diferencia</span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <AutoScrollList
              items={sorted}
              itemHeight={62}
              renderItem={(b, i) => <BranchRow key={b.id} b={b as BranchProjection} rank={i + 1} />}
            />
          </div>
        </>
      )}
    </div>
  );
};
