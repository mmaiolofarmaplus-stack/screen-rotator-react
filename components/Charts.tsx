import React from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Filler 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { COLORS } from '../constants';

const HOURS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
import { formatMillions } from '../utils/formatters';
import { BranchData } from '../types';
import { AnimatedNumber } from './AnimatedNumber';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const commonOptions: ChartOptions<any> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)', 
      titleColor: '#fff',
      bodyColor: '#e5e7eb',
      borderColor: 'rgba(255,255,255,0.2)',
      borderWidth: 1,
      padding: 10,
      displayColors: false,
      titleFont: { size: 13 },
      bodyFont: { size: 13 }
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#9CA3AF', font: { size: 10, weight: '600' } } 
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.05)' }, 
      ticks: { 
        color: '#9CA3AF',
        font: { size: 9 },
        callback: (value: any) => {
             if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M';
             if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'k';
             return '$' + value;
        }
      }
    }
  }
};

interface BranchBarChartProps {
  branches: BranchData[];
}

export const BranchBarChart: React.FC<BranchBarChartProps> = ({ branches }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const isHoveredRef = React.useRef(false);

  // Filter out branches with 0 sales
  const activeBranches = branches.filter(branch => branch.hoyNeto > 0);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationFrameId: number;
    let scrollPos = el.scrollTop;
    const scrollSpeed = 0.4; // Smooth scrolling speed

    const scroll = () => {
      if (!el) return;
      
      // Only scroll if the original list (half of the duplicated list) is taller than the container
      if (el.scrollHeight / 2 > el.clientHeight) {
        if (!isHoveredRef.current) {
          scrollPos += scrollSpeed;
          
          // Seamless loop: reset to 0 when we've scrolled exactly one full original list height
          if (scrollPos >= el.scrollHeight / 2) {
            scrollPos = 0;
          }
          
          el.scrollTop = scrollPos;
        }
      }
      
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [activeBranches]);

  if (activeBranches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
        <span className="text-4xl grayscale opacity-50">📊</span>
        <p className="font-medium text-sm md:text-base">Aún no hay ventas registradas.</p>
      </div>
    );
  }

  // Calculate total sales to determine the share percentage
  const totalSalesAll = activeBranches.reduce((sum, branch) => sum + branch.hoyNeto, 0);

  const maxSales = activeBranches.length > 0 ? activeBranches[0].hoyNeto : 0;

  // --- ON FIRE LOGIC ---
  // Find the last active hour index across ALL active branches
  let globalLastActiveIndex = -1;
  activeBranches.forEach(branch => {
      for (let i = branch.hourlySales.length - 1; i >= 0; i--) {
          if (branch.hourlySales[i] > 0) {
              globalLastActiveIndex = Math.max(globalLastActiveIndex, i);
              break;
          }
      }
  });
  
  // Find the max sales in that specific hour
  let maxSalesInLastHour = 0;
  if (globalLastActiveIndex >= 0) {
      activeBranches.forEach(branch => {
          if (branch.hourlySales[globalLastActiveIndex] > maxSalesInLastHour) {
              maxSalesInLastHour = branch.hourlySales[globalLastActiveIndex];
          }
      });
  }

  // Duplicate the list for seamless infinite scrolling
  const displayBranches = [...activeBranches, ...activeBranches];

  return (
    <div 
      ref={scrollRef}
      onMouseEnter={() => isHoveredRef.current = true}
      onMouseLeave={() => isHoveredRef.current = false}
      className="flex flex-col gap-2 2xl:gap-3 h-full overflow-y-auto pr-2 custom-scrollbar pb-2 relative"
    >
       <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
       `}</style>

       {displayBranches.map((branch, idx) => {
          const uniqueKey = `${branch.name}-${idx}`;
          const widthPercentage = maxSales > 0 ? (branch.hoyNeto / maxSales) * 100 : 0;
          const sharePercentage = totalSalesAll > 0 ? (branch.hoyNeto / totalSalesAll) * 100 : 0;
          const rank = (idx % activeBranches.length) + 1;
          
          const isOnFire = globalLastActiveIndex >= 0 && 
                           branch.hourlySales[globalLastActiveIndex] === maxSalesInLastHour && 
                           maxSalesInLastHour > 0;

          return (
            <motion.div 
                layout 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                key={uniqueKey} 
                className="flex flex-col w-full group shrink-0"
            >
                {/* Text Info Row */}
                <div className="flex justify-between items-end mb-1 px-1">
                    
                    {/* Left: Rank & Name & Trend */}
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                         <span className="text-gray-500 font-bold text-base md:text-lg w-6 text-center shrink-0 flex items-center justify-center">
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                         </span>
                         <div className="flex items-center gap-2 min-w-0">
                             <span className={`font-bold text-sm md:text-base 2xl:text-lg uppercase tracking-wider truncate drop-shadow-md transition-colors duration-500
                                 ${isOnFire ? 'text-orange-400' : 'text-white'}
                             `}>
                                 {branch.name}
                                 {isOnFire && <span className="ml-2 animate-pulse" title="¡Racha más alta en la última hora!">🔥</span>}
                             </span>
                         </div>
                    </div>

                    {/* Right: Value & Percentage */}
                    <div className="flex items-end gap-3 text-right shrink-0">
                        <span className="text-white font-bold text-sm md:text-base 2xl:text-lg font-mono tracking-tight drop-shadow-md">
                            <AnimatedNumber value={branch.hoyNeto} format={formatMillions} />
                        </span>
                        <span className="text-gray-500 text-xs 2xl:text-sm font-bold w-10 mb-0.5">
                            <AnimatedNumber value={sharePercentage} format={(val) => `${val.toFixed(1)}%`} />
                        </span>
                    </div>
                </div>
                
                {/* Progress Bar Row */}
                <div className={`w-full h-2 2xl:h-3 bg-[#1e293b]/60 rounded-full overflow-hidden relative shadow-inner border transition-colors duration-500
                    ${isOnFire ? 'border-[#01B693]/50 shadow-[0_0_10px_rgba(1,182,147,0.3)]' : 'border-white/5'}
                `}>
                     <motion.div 
                        layout
                        className="h-full rounded-full relative flex items-center justify-end"
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercentage}%` }}
                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                        style={{ 
                            background: `linear-gradient(90deg, #0f766e 0%, #01B693 100%)`
                        }}
                     >
                        <div className="h-full w-2 bg-white/40 blur-[2px] rounded-full mr-[-1px]"></div>
                     </motion.div>
                </div>
            </motion.div>
          );
       })}
    </div>
  );
};

interface EvolutionLineChartProps {
  hourlyTotals: number[];
  hourlyTotalsPrevWeek: number[];
  currentFranja?: number;
}

export const EvolutionLineChart: React.FC<EvolutionLineChartProps> = ({ hourlyTotals, hourlyTotalsPrevWeek, currentFranja }) => {
  const argTime = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}));
  const currentHour = currentFranja ?? argTime.getHours();

  const startIndex = 9;
  const endIndex = 19;

  const processedData = hourlyTotals.slice(startIndex, endIndex + 1).map((val, index) => {
      const realIndex = index + startIndex;
      if (realIndex > currentHour) return null;
      return val;
  });

  const prevWeekData = hourlyTotalsPrevWeek.slice(startIndex, endIndex + 1);

  // Prepend 09:00 to the labels to match our new startIndex
  const chartLabels = ['09:00', ...HOURS];

  const data = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Hoy',
        data: processedData,
        borderColor: COLORS.RED,
        backgroundColor: 'rgba(200, 16, 46, 0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: COLORS.RED,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        borderWidth: 3,
        hoverRadius: 8,
        spanGaps: false
      },
      {
        label: 'Semana Anterior',
        data: prevWeekData,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointBackgroundColor: 'transparent',
        pointBorderColor: 'rgba(255, 255, 255, 0.3)',
        pointBorderWidth: 2,
        borderWidth: 2,
        borderDash: [5, 5],
        spanGaps: true
      }
    ],
  };

  const options: ChartOptions<'line'> = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#9CA3AF',
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
          padding: 20,
          font: { size: 12, weight: '500' }
        }
      }
    },
    scales: {
        ...commonOptions.scales,
        x: {
            ...commonOptions.scales?.x,
            grid: { display: true, color: 'rgba(255,255,255,0.03)' }
        }
    }
  };

  return <Line data={data} options={options} />;
};