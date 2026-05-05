import React, { useMemo } from 'react';
import { DashboardData, BranchData } from '../../types';
import { AutoScrollList } from '../AutoScrollList';

interface Props { data: DashboardData; }

export const ScreenAlertas: React.FC<Props> = ({ data }) => {
  const { critical, warning, ok } = useMemo(() => {
    const sorted = [...data.branches].sort((a, b) => b.inactiveMinutes - a.inactiveMinutes);
    return {
      critical: sorted.filter(b => b.inactiveMinutes > 120),
      warning:  sorted.filter(b => b.inactiveMinutes > 60 && b.inactiveMinutes <= 120),
      ok:       sorted.filter(b => b.inactiveMinutes <= 60),
    };
  }, [data.branches]);

  const fmt = (mins: number) => {
    if (mins <= 0) return 'Activa';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const BranchRow: React.FC<{ b: BranchData; accent: string; pulse?: boolean }> = ({ b, accent, pulse }) => (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/3 border border-white/5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-2.5 h-2.5 shrink-0">
          {pulse && <div className="absolute inset-0 rounded-full animate-ping opacity-60" style={{ backgroundColor: accent }} />}
          <div className="absolute inset-0 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}` }} />
        </div>
        <span className="text-white font-bold text-base uppercase tracking-wide truncate">{b.name}</span>
      </div>
      <div className="flex items-center gap-6 shrink-0">
        <span className="text-gray-400 text-sm font-mono">último: {b.ultimaHoraTicket || 'sin datos'}</span>
        <span className="font-mono font-bold text-base px-2.5 py-0.5 rounded" style={{ color: accent, background: accent + '33' }}>
          {fmt(b.inactiveMinutes)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="w-screen h-screen bg-[#0b0e14] text-white flex flex-col p-8 overflow-hidden">
      <div className="mb-6 shrink-0 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <p className="text-[#C8102E] text-sm font-bold tracking-[0.3em] uppercase mb-1">Sin ticket en la última hora</p>
          <h1 className="text-4xl font-black uppercase tracking-wider">Alertas de Inactividad</h1>
        </div>
        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-[#C8102E] font-mono font-black text-3xl">{critical.length}</p>
            <p className="text-gray-400 text-sm font-bold tracking-widest">+2hs</p>
          </div>
          <div className="text-center">
            <p className="text-[#f59e0b] font-mono font-black text-3xl">{warning.length}</p>
            <p className="text-gray-400 text-sm font-bold tracking-widest">1-2hs</p>
          </div>
          <div className="text-center">
            <p className="text-[#01B693] font-mono font-black text-3xl">{ok.length}</p>
            <p className="text-gray-400 text-sm font-bold tracking-widest">OK</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-x-8 overflow-hidden">
        <div className="flex flex-col overflow-hidden pr-2 gap-3">
          {critical.length > 0 && (
            <div>
              <p className="text-[#C8102E] text-sm font-bold tracking-widest uppercase mb-2">Crítico (+2hs)</p>
              <div className="flex flex-col gap-1.5">
                {critical.map(b => <BranchRow key={b.id} b={b} accent="#C8102E" pulse />)}
              </div>
            </div>
          )}
          {warning.length > 0 && (
            <div>
              <p className="text-[#f59e0b] text-sm font-bold tracking-widest uppercase mb-2">Advertencia (1-2hs)</p>
              <div className="flex flex-col gap-1.5">
                {warning.map(b => <BranchRow key={b.id} b={b} accent="#f59e0b" />)}
              </div>
            </div>
          )}
          {critical.length === 0 && warning.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-5xl mb-4">✅</p>
              <p className="text-[#01B693] font-bold text-xl">Sin alertas críticas</p>
              <p className="text-gray-400 text-base mt-1">Todas las sucursales operando con normalidad</p>
            </div>
          )}
        </div>

        <div className="flex flex-col overflow-hidden pl-2 border-l border-white/5">
          <p className="text-[#01B693] text-sm font-bold tracking-widest uppercase mb-2 shrink-0">Activas (&lt;1hs)</p>
          <div className="flex-1 min-h-0 overflow-hidden">
            <AutoScrollList
              items={ok}
              itemHeight={52}
              renderItem={(b) => <BranchRow key={b.id} b={b} accent="#01B693" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
