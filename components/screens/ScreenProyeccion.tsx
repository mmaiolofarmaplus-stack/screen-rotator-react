import React, { useMemo } from 'react';
import { DashboardData, BranchData } from '../../types';
import { formatMillions } from '../../utils/formatters';
import { AnimatedBar } from '../AnimatedBar';
import { AutoScrollList } from '../AutoScrollList';

interface Props { data: DashboardData; }

const META_COLOR: Record<string, string> = {
  'META 3':      '#01B693',
  'META 2':      '#f59e0b',
  'META 1':      '#f97316',
  'SIN META':    '#C8102E',
  'SIN OBJETIVO':'#6b7280',
};

const Row: React.FC<{ b: BranchData }> = ({ b }) => {
  const color = META_COLOR[b.metaProyectada] ?? '#6b7280';
  // Normalize by each branch's own meta3 — M3 line is always at 100%
  const ref = b.meta3Pesos > 0 ? b.meta3Pesos : Math.max(b.proyeccionNeto, b.acumNeto, 1);
  const acumPct = Math.min((b.acumNeto / ref) * 100, 100);
  const proyPct = Math.min((b.proyeccionNeto / ref) * 100, 100);
  const m1Pct   = b.meta3Pesos > 0 ? (b.meta1Pesos / ref) * 100 : 0;
  const m2Pct   = b.meta3Pesos > 0 ? (b.meta2Pesos / ref) * 100 : 0;
  const m3Pct   = b.meta3Pesos > 0 ? 100 : 0;

  return (
    <div className="flex flex-col gap-0.5 py-1">
      <div className="flex items-center justify-between">
        <span className="text-white font-bold text-xs uppercase tracking-wide truncate mr-3">{b.name}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-gray-500 text-[10px] font-mono">{formatMillions(b.acumNeto)}</span>
          <span
            className="text-[10px] font-black px-1.5 py-0.5 rounded"
            style={{ color, background: color + '22' }}
          >
            {b.metaProyectada}
          </span>
          <span className="text-white font-mono font-black text-xs">{formatMillions(b.proyeccionNeto)}</span>
        </div>
      </div>
      <div className="relative h-2 bg-white/5 rounded-full overflow-visible">
        {/* Acumulado actual */}
        <AnimatedBar pct={Math.min(acumPct, 100)} color="#325795" className="absolute top-0 left-0" />
        {/* Proyección (adicional al acumulado) */}
        {proyPct > acumPct && (
          <div className="absolute top-0 h-full" style={{ left: `${Math.min(acumPct, 100)}%`, right: 0 }}>
            <AnimatedBar
              pct={Math.min(((proyPct - acumPct) / (100 - Math.min(acumPct, 100))) * 100, 100)}
              color={color}
              className="opacity-40"
              delay={300}
            />
          </div>
        )}
        {/* Líneas de meta */}
        {[m1Pct, m2Pct, m3Pct].filter(p => p > 0 && p <= 100).map((p, i) => (
          <div
            key={i}
            className="absolute top-[-2px] bottom-[-2px] w-[2px] rounded-full"
            style={{ left: `${p}%`, backgroundColor: ['#f97316', '#f59e0b', '#01B693'][i] }}
          />
        ))}
      </div>
    </div>
  );
};

export const ScreenProyeccion: React.FC<Props> = ({ data }) => {
  const { sorted, half, countProyeccion } = useMemo(() => {
    const sorted = [...data.branches]
      .filter(b => b.acumNeto > 0)
      .sort((a, b) => b.proyeccionNeto - a.proyeccionNeto);
    return {
      sorted,
      half: Math.ceil(sorted.length / 2),
      countProyeccion: {
        m3:   sorted.filter(b => b.metaProyectada === 'META 3').length,
        m2:   sorted.filter(b => b.metaProyectada === 'META 2').length,
        m1:   sorted.filter(b => b.metaProyectada === 'META 1').length,
        sinM: sorted.filter(b => b.metaProyectada === 'SIN META').length,
      },
    };
  }, [data.branches]);

  return (
    <div className="w-screen h-screen bg-[#0b0e14] text-white flex flex-col p-8 overflow-hidden">
      <div className="mb-6 shrink-0 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <p className="text-[#325795] text-xs font-bold tracking-[0.3em] uppercase mb-1">A fin de mes · {data.diasRestantes} días restantes</p>
          <h1 className="text-4xl font-black uppercase tracking-wider">Proyección</h1>
        </div>
        <div className="flex gap-6 items-end">
          <div className="text-right">
            <p className="text-gray-500 text-xs font-bold tracking-widest">PROYECCIÓN RED</p>
            <p className="text-white font-mono font-black text-2xl">{formatMillions(data.proyeccionTotal)}</p>
          </div>
          {([
            { count: countProyeccion.m3,   color: '#01B693', label: 'META 3' },
            { count: countProyeccion.m2,   color: '#f59e0b', label: 'META 2' },
            { count: countProyeccion.m1,   color: '#f97316', label: 'META 1' },
            { count: countProyeccion.sinM, color: '#C8102E', label: 'SIN META' },
          ] as { count: number; color: string; label: string }[]).map(({ count, color, label }) => (
            <div key={label} className="text-center px-2 py-1 rounded-lg" style={{ background: color + '22' }}>
              <p className="font-mono font-black text-xl" style={{ color }}>{count}</p>
              <p className="text-gray-500 text-[10px] font-bold">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 mb-3">
        <div className="flex gap-4 text-[10px] text-gray-500 font-bold mb-3">
          <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-[#325795] rounded inline-block" />Acumulado</span>
          <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-white/30 rounded inline-block" />Proyección</span>
          <span className="flex items-center gap-1"><span className="w-0.5 h-3 bg-[#f97316] rounded inline-block" />M1</span>
          <span className="flex items-center gap-1"><span className="w-0.5 h-3 bg-[#f59e0b] rounded inline-block" />M2</span>
          <span className="flex items-center gap-1"><span className="w-0.5 h-3 bg-[#01B693] rounded inline-block" />M3</span>
        </div>

        <div className="grid grid-cols-2 gap-x-10 h-[calc(100%-2rem)] overflow-hidden">
          <div className="overflow-hidden pr-2">
            <AutoScrollList
              items={sorted.slice(0, half)}
              itemHeight={44}
              renderItem={(b) => <Row key={b.id} b={b} />}
            />
          </div>
          <div className="overflow-hidden pl-2 border-l border-white/5">
            <AutoScrollList
              items={sorted.slice(half)}
              itemHeight={44}
              renderItem={(b) => <Row key={b.id} b={b} />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
