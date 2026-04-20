import React, { useMemo } from 'react';
import { DashboardData, BranchData } from '../../types';
import { formatMillions } from '../../utils/formatters';
import { AnimatedBar } from '../AnimatedBar';
import { AutoScrollList } from '../AutoScrollList';

interface Props { data: DashboardData; }

const rowColor = (pct: number) => {
  if (pct >= 100) return '#01B693';
  if (pct >= 80)  return '#f59e0b';
  return '#C8102E';
};

const COLS = '2.5rem 1fr 280px 140px 240px';

const BranchRow: React.FC<{ b: BranchData; rank: number }> = ({ b, rank }) => {
  const pct   = b.avancePctDiario;
  const c     = rowColor(pct);
  const falta = b.faltaMetaDiaria;
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : String(rank);

  return (
    <div className="grid items-center gap-x-6 py-2 border-b border-white/5"
         style={{ gridTemplateColumns: COLS }}>

      {/* Rank */}
      <span className="text-gray-500 font-bold text-base text-right">{medal}</span>

      {/* Nombre + barra */}
      <div className="flex flex-col gap-1.5 min-w-0">
        <span className="text-white font-bold text-base uppercase tracking-wide truncate">{b.name}</span>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <AnimatedBar pct={Math.min(pct, 100)} color={c} delay={rank * 15} />
        </div>
      </div>

      {/* Hoy / Meta */}
      <div className="text-right">
        <div className="text-white font-mono font-bold text-lg leading-tight">{formatMillions(b.hoyNeto)}</div>
        <div className="text-gray-500 font-mono text-sm leading-tight">{formatMillions(b.metaDiaria)}</div>
      </div>

      {/* % avance */}
      <span className="font-mono font-black text-2xl text-right" style={{ color: c }}>
        {pct.toFixed(1)}%
      </span>

      {/* Falta / sobra */}
      <span className="font-mono font-black text-xl text-right" style={{ color: falta <= 0 ? '#01B693' : '#C8102E' }}>
        {falta <= 0 ? `+${formatMillions(Math.abs(falta))}` : `-${formatMillions(falta)}`}
      </span>
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
      {/* Header */}
      <div className="mb-4 shrink-0 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <p className="text-[#325795] text-xs font-bold tracking-[0.3em] uppercase mb-1">
            Día {data.diaActual} de {data.diasMes} · Hasta las {data.ultimaFranjaHora}hs
          </p>
          <h1 className="text-4xl font-black uppercase tracking-wider">Meta Diaria</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Avance Red</p>
            <p className="font-mono font-black text-3xl" style={{ color: rowColor(avanceRed) }}>
              {avanceRed.toFixed(1)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Hoy Red</p>
            <p className="text-white font-mono font-black text-3xl">{formatMillions(data.totalNeto)}</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-[#01B693]/10 border border-[#01B693]/20">
            <p className="font-mono font-black text-3xl text-[#01B693]">{sobre}</p>
            <p className="text-gray-400 text-[11px] font-bold tracking-wider uppercase mt-0.5">Sobre Meta</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-[#C8102E]/10 border border-[#C8102E]/20">
            <p className="font-mono font-black text-3xl text-[#C8102E]">{bajo}</p>
            <p className="text-gray-400 text-[11px] font-bold tracking-wider uppercase mt-0.5">Bajo Meta</p>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid gap-x-6 mb-1 shrink-0" style={{ gridTemplateColumns: COLS }}>
        <span />
        <span className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">Sucursal</span>
        <span className="text-gray-500 text-[10px] font-bold tracking-widest uppercase text-right">Hoy / Meta</span>
        <span className="text-gray-500 text-[10px] font-bold tracking-widest uppercase text-right">Avance</span>
        <span className="text-gray-500 text-[10px] font-bold tracking-widest uppercase text-right">Diferencia</span>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AutoScrollList
          items={sorted}
          itemHeight={58}
          renderItem={(b, i) => <BranchRow key={b.id} b={b} rank={i + 1} />}
        />
      </div>
    </div>
  );
};
