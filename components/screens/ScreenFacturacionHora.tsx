import React, { useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Legend, Filler, ChartOptions, ScriptableContext,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DashboardData } from '../../types';
import { formatMillions, formatPct } from '../../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

interface Props { data: DashboardData; }

export const ScreenFacturacionHora: React.FC<Props> = ({ data }) => {
  const { hourlyTotalsHoy, hourlyTotalsSemAnt, ultimaFranjaHora, totalNeto, varPctVsSemAnt } = data;

  const startIndex = 7;
  const rawEnd = Math.min(ultimaFranjaHora, 19);
  let endIndex = startIndex;
  for (let h = startIndex; h <= rawEnd; h++) {
    if (hourlyTotalsHoy[h] > 0) endIndex = h;
  }

  const { labels, todaySlice, prevSlice, semAntTotal, peakHour } = useMemo(() => {
    const labels: string[] = [];
    for (let h = startIndex; h <= endIndex; h++) labels.push(`${h}:00`);
    const todaySlice = hourlyTotalsHoy.slice(startIndex, endIndex + 1);
    const prevSlice  = hourlyTotalsSemAnt.slice(startIndex, endIndex + 1);
    const semAntTotal = prevSlice.reduce((a, b) => a + b, 0);
    const peakHour = todaySlice.reduce(
      (best, val, i) => val > (todaySlice[best] ?? 0) ? i : best, 0
    );
    return { labels, todaySlice, prevSlice, semAntTotal, peakHour };
  }, [hourlyTotalsHoy, hourlyTotalsSemAnt, ultimaFranjaHora]);

  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: 'Hoy',
        data: todaySlice,
        borderColor: '#C8102E',
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return 'transparent';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0.05, 'rgba(200, 16, 46, 0.4)');
          gradient.addColorStop(0.95, 'rgba(11, 14, 20, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#C8102E',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        borderWidth: 4,
        spanGaps: false,
      },
      {
        label: 'Semana anterior',
        data: prevSlice,
        borderColor: 'rgba(255,255,255,0.25)',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
        borderDash: [6, 4],
        spanGaps: true,
      },
    ],
  }), [labels, todaySlice, prevSlice]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: { color: '#9ca3af', usePointStyle: true, pointStyle: 'circle', boxWidth: 8, boxHeight: 8, padding: 20, font: { size: 15, weight: 500 as const } },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.9)',
        titleColor: '#fff',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: { label: (ctx) => formatMillions(ctx.raw as number) },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 14, weight: 600 as const } } },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#9ca3af', font: { size: 13 },
          callback: (v: any) => v >= 1000000 ? '$' + (v / 1000000).toFixed(1) + 'M' : v >= 1000 ? '$' + (v / 1000).toFixed(0) + 'k' : '$' + v,
        },
      },
    },
  };

  return (
    <div className="w-screen h-screen bg-[#0b0e14] text-white flex flex-col p-8 overflow-hidden">
      <div className="mb-6 shrink-0 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <p className="text-[#325795] text-sm font-bold tracking-[0.3em] uppercase mb-1">Red total · franja {startIndex}–{endIndex}hs</p>
          <h1 className="text-4xl font-black uppercase tracking-wider">Facturación por Hora</h1>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <p className="text-gray-400 text-sm font-bold tracking-widest">TOTAL HOY</p>
            <p className="text-white font-mono font-black text-3xl">{formatMillions(totalNeto)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm font-bold tracking-widest">VS SEM. ANT.</p>
            <p className={`font-mono font-black text-3xl ${varPctVsSemAnt >= 0 ? 'text-[#01B693]' : 'text-[#C8102E]'}`}>
              {varPctVsSemAnt >= 0 ? '+' : ''}{formatPct(varPctVsSemAnt)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm font-bold tracking-widest">SEM. ANT. (HOY)</p>
            <p className="text-white font-mono font-black text-3xl">{formatMillions(semAntTotal)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm font-bold tracking-widest">HORA PICO</p>
            <p className="text-white font-mono font-black text-3xl">{startIndex + peakHour}:00hs</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
