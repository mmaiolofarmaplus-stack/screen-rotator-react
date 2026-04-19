import React from 'react';
import { BranchData } from '../types';
import { formatCurrency } from '../utils/formatters';

interface TopBranchCardProps {
  branch: BranchData | undefined;
  totalSales: number;
}

export const TopBranchCard: React.FC<TopBranchCardProps> = ({ branch, totalSales }) => {
  if (!branch || branch.hoyNeto === 0) {
    return (
      <div className="flex flex-col justify-center items-center p-6 rounded-2xl relative overflow-hidden backdrop-blur-2xl border border-white/10 bg-[#121620] h-full min-h-[160px]">
         <span className="text-3xl mb-2 grayscale opacity-50">🏆</span>
         <p className="text-gray-500 text-sm font-medium text-center">Esperando a la primera sucursal...</p>
      </div>
    );
  }

  const percentage = totalSales > 0
    ? ((branch.hoyNeto / totalSales) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="flex flex-col justify-center p-2 2xl:p-3 rounded-xl relative overflow-hidden backdrop-blur-2xl border border-white/10 bg-[#121620]">
        
        {/* Subtle Gradient Glow for "Winner" feel */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#325795]/20 rounded-full blur-[40px]"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#325795] to-[#01B693]"></div>

        <div className="relative z-10">
            <p className="text-gray-400 text-[9px] 2xl:text-[10px] uppercase font-bold mb-1 tracking-widest flex items-center gap-1.5">
                <span className="text-[#FFD700]">★</span> Top Sucursal
            </p>

            <h2 className="text-xl md:text-2xl 2xl:text-3xl font-black text-white uppercase tracking-tight truncate mb-1.5 drop-shadow-lg">
                {branch.name}
            </h2>

            <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-white/5">
                <span className="text-gray-300 text-sm 2xl:text-base font-mono font-medium">
                    {formatCurrency(branch.hoyNeto)}
                </span>
                <span className="text-[#01B693] text-[10px] 2xl:text-xs font-bold bg-[#01B693]/10 px-2 py-0.5 rounded-full border border-[#01B693]/20">
                    {percentage}%
                </span>
            </div>
        </div>
    </div>
  );
};