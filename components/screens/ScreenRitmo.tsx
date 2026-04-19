import React, { useMemo } from 'react';
import { DashboardData, BranchData } from '../../types';
import { formatMillions } from '../../utils/formatters';
import { AnimatedBar } from '../AnimatedBar';

interface Props { data: DashboardData; }

const SEMAFORO_COLOR: Record<string, string> = {
  'VERDE SOBRE META 3':    '#01B693',
  'AMARILLO SOBRE META 2': '#f59e0b',
  'NARANJA SOBRE META 1':  '#f97316',
  'NARANJA CERCA META 1':  '#fb923c',
  'ROJO DEBAJO META 1':    '#C8102E',
  'SIN OBJETIVO':          '#6b7280',
};

const Row: React.FC<{ b: BranchData; maxRitmo: number }> = ({ b, maxRitmo }) => {
  const color = SEMAFORO_COLOR[b.semaforo] ?? '#6b7280';
  const realPct  = maxRitmo > 0 ? (b.ritmoReal / maxRitmo) * 100 : 0;
  const necM1Pct = maxRitmo > 0 ? (b.ritmoNecesarioM1 / maxRitmo) * 100 : 0;
  const necM2Pct = maxRitmo > 0 ? (b.ritmoNecesarioM2 / maxRitmo) * 100 : 0;
  const necM3Pct = maxRitmo > 0 ? (b.ritmoNecesarioM3 / maxRitmo) * 100 : 0;
  const ratio = b.ritmoNecesarioM1 > 0 ? b.ritmoReal / b.ritmoNecesarioM1 : 0;
  const ratioLabel = ratio >= 1 ? `+${((ratio - 1) * 100).toFixed(0)}%` : `-${((1 - ratio) * 100).toFixed(0)}%`;

  return (
    <div className="flex flex-col gap-0.5 py-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-white font-bold text-xs uppercase tracking-wide truncate">{b.name}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-[10px] font-bold ${ratio >= 1 ? 'text-[#01B693]' : 'text-[#C8102E]'}`}>{ratioLabel}</span>
          <span className="text-gray-400 text-[10px] font-mono">Real: {formatMillions(b.ritmoReal)}</span>
          <span className="text-gray-600 text-[10px] font-mono">Nec: {formatMillions(b.ritmoNecesarioM1)}</span>
        </div>
      </div>
      <div className="relative h-2 bg-white/5 rounded-full overflow-visible ml-4">
        {/* Ritmo real */}
        <AnimatedBar pct={Math.min(realPct, 100)} color={color} className="absolute top-0 left-0" />
        {/* Líneas de ritmo necesario M1/M2/M3 */}
        {necM1Pct > 0 && necM1Pct <= 100 && (
          <div className="absolute top-[-3px] bottom-[-3px] w-[2px] rounded-full bg-[#f97316]" style={{ left: `${necM1Pct}%` }} />
        )}
        {necM2Pct > 0 && necM2Pct <= 100 && necM2Pct !== necM1Pct && (
          <div className="absolute top-[-3px] bottom-[-3px] w-[2px] rounded-full bg-[#f59e0b]" style={{ left: `${necM2Pct}%` }} />
        )}
        {necM3Pct > 0 && necM3Pct <= 100 && necM3Pct !== necM2Pct && (
          <div className="absolute top-[-3px] bottom-[-3px] w-[2px] rounded-full bg-[#01B693]" style={{ left: `${necM3Pct}%` }} />
        )}
      </div>
    </div>
  );
};

export const ScreenRitmo: React.FC<Props> = ({ data }) => {
  const { sorted, half, maxRitmo, arriba, totalActive, ritmoRed } = useMemo(() => {
    const active = data.branches.filter(b => b.ritmoReal > 0);
    const sorted = [...active].sort((a, b) => {
      const ra = a.ritmoNecesarioM1 > 0 ? a.ritmoReal / a.ritmoNecesarioM1 : 0;
      const rb = b.ritmoNecesarioM1 > 0 ? b.ritmoReal / b.ritmoNecesarioM1 : 0;
      return rb - ra;
    });
    return {
      sorted,
      half: Math.ceil(sorted.length / 2),
      maxRitmo: Math.max(...active.map(b => Math.max(b.ritmoReal, b.ritmoNecesarioM3, b.ritmoNecesarioM1)), 1),
      arriba: active.filter(b => b.ritmoReal >= b.ritmoNecesarioM1).length,
      totalActive: active.length,
      ritmoRed: data.branches.reduce((s, b) => s + b.ritmoReal, 0),
    };
  }, [data.branches]);

  return (
    <div className="w-screen h-screen bg-[#0b0e14] text-white flex flex-col p-8 overflow-hidden">
      <div className="mb-6 shrink-0 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <p className="text-[#325795] text-xs font-bold tracking-[0.3em] uppercase mb-1">Real vs necesario · {data.diasRestantes} días restantes</p>
          <h1 className="text-4xl font-black uppercase tracking-wider">Ritmo Diario</h1>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <p className="text-gray-500 text-xs font-bold tracking-widest">RITMO RED</p>
            <p className="text-white font-mono font-black text-2xl">{formatMillions(ritmoRed)}/día</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs font-bold tracking-widest">SOBRE META 1</p>
            <p className="text-[#01B693] font-mono font-black text-2xl">{arriba}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs font-bold tracking-widest">BAJO META 1</p>
            <p className="text-[#C8102E] font-mono font-black text-2xl">{totalActive - arriba}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 text-[10px] text-gray-500 font-bold mb-3 shrink-0">
        <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded inline-block bg-[#01B693]" />Ritmo real</span>
        <span className="flex items-center gap-1"><span className="w-0.5 h-3 rounded inline-block bg-[#f97316]" />Nec. M1</span>
        <span className="flex items-center gap-1"><span className="w-0.5 h-3 rounded inline-block bg-[#f59e0b]" />Nec. M2</span>
        <span className="flex items-center gap-1"><span className="w-0.5 h-3 rounded inline-block bg-[#01B693]" />Nec. M3</span>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-x-10 overflow-hidden">
        <div className="flex flex-col overflow-y-auto custom-scrollbar pr-2 gap-0.5">
          {sorted.slice(0, half).map(b => <Row key={b.id} b={b} maxRitmo={maxRitmo} />)}
        </div>
        <div className="flex flex-col overflow-y-auto custom-scrollbar pl-2 border-l border-white/5 gap-0.5">
          {sorted.slice(half).map(b => <Row key={b.id} b={b} maxRitmo={maxRitmo} />)}
        </div>
      </div>
    </div>
  );
};
