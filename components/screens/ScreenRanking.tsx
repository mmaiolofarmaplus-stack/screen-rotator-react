import React, { useMemo } from 'react';
import { DashboardData, BranchData } from '../../types';
import { formatMillions } from '../../utils/formatters';
import { AnimatedBar } from '../AnimatedBar';
import { AutoScrollList } from '../AutoScrollList';

interface Props { data: DashboardData; }

const BranchRow: React.FC<{ b: BranchData; rank: number; maxNeto: number }> = ({ b, rank, maxNeto }) => {
  const widthPct = maxNeto > 0 ? (b.hoyNeto / maxNeto) * 100 : 0;
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  return (
    <div className="flex flex-col gap-1 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-gray-500 font-bold text-sm w-6 text-right shrink-0">{medal ?? rank}</span>
          <span className="text-white font-bold text-base uppercase tracking-wide truncate">{b.name}</span>
        </div>
        <span className="text-white font-mono font-black text-2xl shrink-0">{formatMillions(b.hoyNeto)}</span>
      </div>
      <div className="ml-8 h-2 bg-white/5 rounded-full overflow-hidden">
        <AnimatedBar pct={widthPct} color="#01B693" delay={rank * 18} />
      </div>
    </div>
  );
};

export const ScreenRanking: React.FC<Props> = ({ data }) => {
  const { sorted, maxNeto } = useMemo(() => {
    const sorted = [...data.branches].sort((a, b) => b.hoyNeto - a.hoyNeto);
    return {
      sorted,
      maxNeto: sorted[0]?.hoyNeto ?? 1,
    };
  }, [data.branches]);

  return (
    <div className="w-screen h-screen bg-[#0b0e14] text-white flex flex-col p-8 overflow-hidden">
      <div className="mb-6 shrink-0 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <p className="text-[#325795] text-xs font-bold tracking-[0.3em] uppercase mb-1">
            Día {data.diaActual} de {data.diasMes} · Hasta las {data.ultimaFranjaHora}hs
          </p>
          <h1 className="text-4xl font-black uppercase tracking-wider">Ranking de Sucursales</h1>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Total Red Hoy</p>
          <p className="text-white font-mono font-black text-3xl">{formatMillions(data.totalNeto)}</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <AutoScrollList
          items={sorted}
          itemHeight={56}
          renderItem={(b, i) => <BranchRow key={b.id} b={b} rank={i + 1} maxNeto={maxNeto} />}
        />
      </div>
    </div>
  );
};
