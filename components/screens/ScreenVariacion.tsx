import React, { useMemo } from 'react';
import { DashboardData, BranchData } from '../../types';
import { formatPct } from '../../utils/formatters';
import { AnimatedBar } from '../AnimatedBar';
import { AutoScrollList } from '../AutoScrollList';

interface Props { data: DashboardData; }

export const ScreenVariacion: React.FC<Props> = ({ data }) => {
  const { positive, negative, maxAbs } = useMemo(() => {
    const withVar = data.branches
      .filter(b => b.hoyNeto > 0 && b.semAntNeto > 0)
      .sort((a, b) => b.varPctVsSemAnt - a.varPctVsSemAnt);
    return {
      positive: withVar.filter(b => b.varPctVsSemAnt >= 0),
      negative: [...withVar.filter(b => b.varPctVsSemAnt < 0)].reverse(),
      maxAbs: Math.max(...withVar.map(b => Math.abs(b.varPctVsSemAnt)), 1),
    };
  }, [data.branches]);

  const Row: React.FC<{ b: BranchData; color: string }> = ({ b, color }) => (
    <div className="flex flex-col gap-1 py-1.5">
      <div className="flex justify-between items-center">
        <span className="text-white font-bold text-base uppercase tracking-wide truncate mr-3">{b.name}</span>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className="font-mono font-black text-base px-3 py-0.5 rounded"
            style={{ color, background: color + '44' }}
          >
            {b.varPctVsSemAnt >= 0 ? '+' : ''}{formatPct(b.varPctVsSemAnt)}%
          </span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <AnimatedBar pct={(Math.abs(b.varPctVsSemAnt) / maxAbs) * 100} color={color} />
      </div>
    </div>
  );

  const redTotal = data.branches.reduce((s, b) => s + b.semAntNeto, 0);
  const varRed = redTotal > 0 ? ((data.totalNeto - redTotal) / redTotal) * 100 : 0;

  return (
    <div className="w-screen h-screen bg-[#0b0e14] text-white flex flex-col p-8 overflow-hidden">
      <div className="mb-6 shrink-0 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <p className="text-[#325795] text-sm font-bold tracking-[0.3em] uppercase mb-1">Mismo tramo horario · hasta {data.ultimaFranjaHora}hs</p>
          <h1 className="text-4xl font-black uppercase tracking-wider">Variación vs Semana Anterior</h1>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <p className="text-gray-400 text-sm font-bold tracking-widest">RED TOTAL</p>
            <p className={`font-mono font-black text-3xl ${varRed >= 0 ? 'text-[#01B693]' : 'text-[#C8102E]'}`}>
              {varRed >= 0 ? '+' : ''}{formatPct(varRed)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm font-bold tracking-widest">MEJORAN</p>
            <p className="text-[#01B693] font-mono font-black text-3xl">{positive.length}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm font-bold tracking-widest">BAJAN</p>
            <p className="text-[#C8102E] font-mono font-black text-3xl">{negative.length}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-x-10 overflow-hidden">
        <div className="flex flex-col overflow-hidden pr-2">
          <p className="text-[#01B693] text-sm font-bold tracking-widest uppercase mb-3 shrink-0">↑ Mejores</p>
          <div className="flex-1 min-h-0 overflow-hidden">
            <AutoScrollList
              items={positive}
              itemHeight={52}
              renderItem={(b) => <Row key={b.id} b={b} color="#01B693" />}
            />
          </div>
        </div>
        <div className="flex flex-col overflow-hidden pl-2 border-l border-white/5">
          <p className="text-[#C8102E] text-sm font-bold tracking-widest uppercase mb-3 shrink-0">↓ Peores</p>
          <div className="flex-1 min-h-0 overflow-hidden">
            <AutoScrollList
              items={negative}
              itemHeight={52}
              renderItem={(b) => <Row key={b.id} b={b} color="#C8102E" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
