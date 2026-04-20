import React, { useMemo } from 'react';
import { DashboardData, BranchData } from '../../types';
import { formatMillions } from '../../utils/formatters';
import { AnimatedBar } from '../AnimatedBar';
import { AutoScrollList } from '../AutoScrollList';

interface Props { data: DashboardData; }

const color = (pct: number) => {
  if (pct >= 100) return '#01B693';
  if (pct >= 80)  return '#f59e0b';
  return '#C8102E';
};

const BranchRow: React.FC<{ b: BranchData; rank: number }> = ({ b, rank }) => {
  const pct   = b.avancePctDiario;
  const c     = color(pct);
  const falta = b.faltaMetaDiaria;
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  return (
    <div className="flex flex-col gap-0.5 py-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-gray-500 font-bold text-xs w-5 text-right shrink-0">{medal ?? rank}</span>
          <span className="text-white font-bold text-xs uppercase tracking-wide truncate">{b.name}</span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-gray-400 text-[10px] font-mono">{formatMillions(b.hoyNeto)} / {formatMillions(b.metaDiaria)}</span>
          <span className="font-mono font-black text-xs w-14 text-right" style={{ color: c }}>
            {pct.toFixed(1)}%
          </span>
          <span className="text-[10px] font-mono w-20 text-right" style={{ color: falta <= 0 ? '#01B693' : '#C8102E' }}>
            {falta <= 0 ? `+${formatMillions(Math.abs(falta))}` : `-${formatMillions(falta)}`}
          </span>
        </div>
      </div>
      <div className="ml-7 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <AnimatedBar pct={Math.min(pct, 100)} color={c} delay={rank * 18} />
      </div>
    </div>
  );
};

export const ScreenMetaDiaria: React.FC<Props> = ({ data }) => {
  const { sorted, sobre, bajo } = useMemo(() => {
    const withMeta = data.branches.filter(b => b.metaDiaria > 0);
    const sorted   = [...withMeta].sort((a, b) => b.avancePctDiario - a.avancePctDiario);
    return {
      sorted,
      sobre: sorted.filter(b => b.avancePctDiario >= 100).length,
      bajo:  sorted.filter(b => b.avancePctDiario < 100).length,
    };
  }, [data.branches]);

  const avanceRed = data.totalMetaDiaria > 0
    ? (data.totalNeto / data.totalMetaDiaria) * 100
    : 0;

  return (
    <div className="w-screen h-screen bg-[#0b0e14] text-white flex flex-col p-8 overflow-hidden">
      <div className="mb-6 shrink-0 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <p className="text-[#325795] text-xs font-bold tracking-[0.3em] uppercase mb-1">
            Día {data.diaActual} de {data.diasMes} · Hasta las {data.ultimaFranjaHora}hs
          </p>
          <h1 className="text-4xl font-black uppercase tracking-wider">Meta Diaria</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-gray-500 text-xs font-bold tracking-widest">AVANCE RED</p>
            <p className="font-mono font-black text-2xl" style={{ color: color(avanceRed) }}>
              {avanceRed.toFixed(1)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs font-bold tracking-widest">HOY RED</p>
            <p className="text-white font-mono font-black text-2xl">{formatMillions(data.totalNeto)}</p>
          </div>
          <div className="text-center px-3 py-1 rounded-lg bg-[#01B693]/10">
            <p className="font-mono font-black text-2xl text-[#01B693]">{sobre}</p>
            <p className="text-gray-500 text-[10px] font-bold">SOBRE META</p>
          </div>
          <div className="text-center px-3 py-1 rounded-lg bg-[#C8102E]/10">
            <p className="font-mono font-black text-2xl text-[#C8102E]">{bajo}</p>
            <p className="text-gray-500 text-[10px] font-bold">BAJO META</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <AutoScrollList
          items={sorted}
          itemHeight={44}
          renderItem={(b, i) => <BranchRow key={b.id} b={b} rank={i + 1} />}
        />
      </div>
    </div>
  );
};
