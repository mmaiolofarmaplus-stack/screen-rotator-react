import React from 'react';
import { BranchData, DashboardData } from '../types';
import { formatCurrency, formatPercentage, formatNumber } from '../utils/formatters';

export const KpiBar: React.FC<{ data: DashboardData }> = ({ data }) => {
  const progress = data.dailyTarget > 0 ? (data.totalSales / data.dailyTarget) * 100 : 0;
  const faltan = Math.max(data.dailyTarget - data.totalSales, 0);
  const ticketPromedio = data.totalOrders > 0 ? data.totalSales / data.totalOrders : 0;
  
  const totalMix = data.totalCobertura + data.totalCliente;
  const cobPct = totalMix > 0 ? (data.totalCobertura / totalMix) * 100 : 0;
  const cliPct = totalMix > 0 ? (data.totalCliente / totalMix) * 100 : 0;

  let progressColor = '#ef4444'; // red
  if (progress >= 100) progressColor = '#10b981'; // green
  else if (progress >= 80) progressColor = '#eab308'; // yellow

  return (
    <div className="h-[100px] shrink-0 flex gap-4">
      {/* 1. Facturación Total */}
      <div className="flex-1 bg-[#121620] rounded-xl border border-white/10 p-4 flex flex-col relative overflow-hidden justify-between">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#3b82f6]"></div>
        <span className="text-gray-400 text-[10px] 2xl:text-xs font-bold tracking-widest uppercase">Facturación Total • Hoy</span>
        <span className="text-white text-3xl 2xl:text-4xl font-black tracking-tighter">{formatCurrency(data.totalSales)}</span>
        <div className="w-full">
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-1">
            <div className="h-full bg-[#3b82f6]" style={{ width: `${Math.min(progress, 100)}%` }}></div>
          </div>
          <span className="text-gray-500 text-[10px] 2xl:text-xs">Obj: {formatCurrency(data.dailyTarget)}</span>
        </div>
      </div>

      {/* 2. % Cumplimiento */}
      <div className="flex-1 bg-[#121620] rounded-xl border border-white/10 p-4 flex flex-col relative overflow-hidden justify-between">
        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: progressColor }}></div>
        <span className="text-gray-400 text-[10px] 2xl:text-xs font-bold tracking-widest uppercase">% Cumplimiento Objetivo</span>
        <span className="text-3xl 2xl:text-4xl font-black tracking-tighter" style={{ color: progressColor }}>{formatPercentage(progress)}</span>
        <div className="w-full">
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-1">
            <div className="h-full" style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: progressColor }}></div>
          </div>
          <span className="text-gray-400 text-[10px] 2xl:text-xs">Faltan <span className="font-bold text-white">{formatCurrency(faltan)}</span></span>
        </div>
      </div>

      {/* 3. Tickets Totales */}
      <div className="flex-1 bg-[#121620] rounded-xl border border-white/10 p-4 flex flex-col relative overflow-hidden justify-between">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#eab308]"></div>
        <span className="text-gray-400 text-[10px] 2xl:text-xs font-bold tracking-widest uppercase">Tickets • Hoy</span>
        <span className="text-white text-3xl 2xl:text-4xl font-black tracking-tighter">{formatNumber(data.totalOrders)}</span>
        <span className="text-gray-500 text-[10px] 2xl:text-xs">Prom. cadena</span>
      </div>

      {/* 4. Ticket Promedio */}
      <div className="flex-1 bg-[#121620] rounded-xl border border-white/10 p-4 flex flex-col relative overflow-hidden justify-between">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#06b6d4]"></div>
        <span className="text-gray-400 text-[10px] 2xl:text-xs font-bold tracking-widest uppercase">Ticket Promedio</span>
        <span className="text-white text-3xl 2xl:text-4xl font-black tracking-tighter">{formatCurrency(ticketPromedio)}</span>
        <span className="text-gray-500 text-[10px] 2xl:text-xs">por transacción</span>
      </div>

      {/* 5. Mix Cobertura */}
      <div className="flex-1 bg-[#121620] rounded-xl border border-white/10 p-4 flex flex-col relative overflow-hidden justify-between">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#ef4444]"></div>
        <span className="text-gray-400 text-[10px] 2xl:text-xs font-bold tracking-widest uppercase">Mix Cobertura / Mostrador</span>
        <span className="text-white text-2xl 2xl:text-3xl font-black tracking-tighter">{formatPercentage(cobPct)} / {formatPercentage(cliPct)}</span>
        <span className="text-gray-500 text-[10px] 2xl:text-xs">Obra social vs. cliente directo</span>
      </div>
    </div>
  );
};

export const BranchRankingList: React.FC<{ branches: BranchData[] }> = ({ branches }) => {
  const activeBranches = branches.filter(b => b.todaySales > 0);
  
  return (
    <div className="flex flex-col">
      {activeBranches.map((branch, index) => {
        let colorClass = 'text-red-500';
        let bgClass = 'bg-red-500';
        if (branch.progressPercentage >= 100) {
          colorClass = 'text-[#10b981]';
          bgClass = 'bg-[#10b981]';
        } else if (branch.progressPercentage >= 80) {
          colorClass = 'text-[#eab308]';
          bgClass = 'bg-[#eab308]';
        }

        return (
          <div key={branch.id} className="flex flex-col py-3 px-4 border-b border-white/5 hover:bg-white/5 transition-colors">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-3">
                <span className="text-yellow-500 font-bold w-5 text-right text-sm 2xl:text-base">{index + 1}</span>
                <span className="text-white font-bold text-sm 2xl:text-base tracking-wider uppercase">{branch.name}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-white font-bold text-sm 2xl:text-base">{formatCurrency(branch.todaySales)}</span>
                <span className={`text-xs 2xl:text-sm font-bold ${colorClass}`}>{formatPercentage(branch.progressPercentage)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pl-8">
              <div className="w-3/5 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full ${bgClass}`} style={{ width: `${Math.min(branch.progressPercentage, 100)}%` }}></div>
              </div>
              {branch.inactiveMinutes > 30 && (
                <span className="text-red-500 text-[10px] 2xl:text-xs font-bold flex items-center gap-1 animate-pulse">
                  ⚠️ SIN ACTIVIDAD
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Top3Widget: React.FC<{ branches: BranchData[] }> = ({ branches }) => {
  const top3 = [...branches].sort((a, b) => b.todaySales - a.todaySales).slice(0, 3);
  
  return (
    <div className="flex-1 bg-[#121620] rounded-xl border border-white/10 p-4 flex flex-col">
      <span className="text-gray-400 text-xs 2xl:text-sm font-bold tracking-widest mb-4 flex items-center gap-2">
        <span className="text-yellow-600 text-base">🏅</span> TOP 3 SUCURSALES • HOY
      </span>
      <div className="flex flex-col gap-3 flex-1 justify-center">
        {top3.map((branch, i) => (
          <div key={branch.id} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-xl 2xl:text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
              <span className="text-white font-bold text-sm 2xl:text-base uppercase">{branch.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[#10b981] font-bold text-sm 2xl:text-base">{formatCurrency(branch.todaySales)}</span>
              <span className="text-[#10b981] text-xs 2xl:text-sm w-12 text-right">{formatPercentage(branch.progressPercentage)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AlertsWidget: React.FC<{ branches: BranchData[] }> = ({ branches }) => {
  const inactive = branches.filter(b => b.inactiveMinutes > 30 && b.todaySales > 0).sort((a, b) => b.inactiveMinutes - a.inactiveMinutes);
  
  return (
    <div className="flex-1 bg-[#121620] rounded-xl border border-white/10 p-4 flex flex-col">
      <span className="text-gray-400 text-xs 2xl:text-sm font-bold tracking-widest mb-3 flex items-center gap-2">
        <span className="text-yellow-600 text-base">⚠️</span> ALERTAS • SIN ACTIVIDAD +30MIN
      </span>
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2.5">
        {inactive.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm 2xl:text-base">Sin alertas</div>
        ) : (
          inactive.map(branch => (
            <div key={branch.id} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                <span className="text-red-500 font-bold text-xs 2xl:text-sm uppercase">{branch.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-xs 2xl:text-sm font-mono">{branch.lastTicketTime}</span>
                <span className="text-red-500 font-bold text-xs 2xl:text-sm w-12 text-right">{branch.inactiveMinutes}min</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const MixWidget: React.FC<{ cobertura: number, cliente: number }> = ({ cobertura, cliente }) => {
  const total = cobertura + cliente;
  const cobPct = total > 0 ? (cobertura / total) * 100 : 0;
  const cliPct = total > 0 ? (cliente / total) * 100 : 0;

  return (
    <div className="flex-1 bg-[#121620] rounded-xl border border-white/10 p-4 flex flex-col">
      <span className="text-gray-400 text-xs 2xl:text-sm font-bold tracking-widest mb-4">MIX COBERTURA • CADENA</span>
      <div className="flex flex-col gap-5 justify-center flex-1">
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xs 2xl:text-sm w-20">Obra Social</span>
          <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#3b82f6]" style={{ width: `${cobPct}%` }}></div>
          </div>
          <span className="text-[#3b82f6] font-bold text-sm 2xl:text-base w-12 text-right">{formatPercentage(cobPct)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xs 2xl:text-sm w-20">Mostrador</span>
          <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#10b981]" style={{ width: `${cliPct}%` }}></div>
          </div>
          <span className="text-[#10b981] font-bold text-sm 2xl:text-base w-12 text-right">{formatPercentage(cliPct)}</span>
        </div>
      </div>
    </div>
  );
};
