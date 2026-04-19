import React from 'react';
import { COLORS } from '../constants';
import { AnimatedNumber } from './AnimatedNumber';

interface KpiCardProps {
  title: string;
  value: string;
  numericValue?: number;
  format?: (val: number) => string;
  color?: string; // Hex color for accent
  percentage?: number; // For progress bar
  subtitle?: React.ReactNode;
}

const KpiCardInner: React.FC<KpiCardProps> = ({ title, value, numericValue, format, color = COLORS.BLUE, percentage, subtitle }) => {
  // Logic to adjust font size based on string length to prevent overflow
  // Optimized for 4K legibility
  const getFontSize = (str: string) => {
    if (str.length > 15) return 'text-xl md:text-2xl 2xl:text-3xl'; 
    if (str.length > 10) return 'text-2xl md:text-3xl 2xl:text-4xl'; 
    return 'text-2xl md:text-3xl 2xl:text-4xl'; // Keep it consistent for smaller strings too
  };

  return (
    <div className="flex flex-col justify-between p-2 2xl:p-3 rounded-xl relative overflow-hidden backdrop-blur-xl transition-all group" 
         style={{ 
             background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', 
             border: '1px solid rgba(255,255,255,0.08)',
         }}>
      
      {/* Accent Line on top */}
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: color, opacity: 0.8 }}></div>
      
      {/* Background Glow */}
      <div className="absolute -right-10 -bottom-10 w-16 h-16 rounded-full blur-[50px] opacity-20 transition-opacity duration-700 group-hover:opacity-40"
           style={{ backgroundColor: color }}></div>

      <p className="text-gray-400 text-[9px] 2xl:text-[10px] uppercase font-bold mb-0.5 tracking-widest opacity-80">{title}</p>
      
      <div className="relative z-10 w-full mt-0.5 flex-1 flex flex-col justify-center">
        <h2 className={`${getFontSize(value)} font-black text-white tracking-tighter transition-all duration-300 truncate drop-shadow-2xl`}>
            {numericValue !== undefined ? (
                <AnimatedNumber value={numericValue} format={format} />
            ) : (
                value
            )}
        </h2>
        {subtitle && <div className="mt-1">{subtitle}</div>}
      </div>

      {/* Progress Bar for Meta Card */}
      {percentage !== undefined ? (
        <div className="w-full bg-gray-700/30 h-1 mt-2 rounded-full overflow-hidden shrink-0">
             <div className="h-full transition-all duration-1000 shadow-[0_0_10px_currentColor]" 
                  style={{ width: `${Math.min(percentage * 100, 100)}%`, backgroundColor: color, color: color }}>
            </div>
        </div>
      ) : (
        <div className="w-full h-1 mt-2 shrink-0"></div>
      )}
    </div>
  );
};

export const KpiCard = React.memo(KpiCardInner);