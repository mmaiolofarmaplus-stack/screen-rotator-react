import React, { useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Tooltip, Legend, ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { DashboardData } from '../../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

interface Props { data: DashboardData; }

export const ScreenTicketsHora: React.FC<Props> = ({ data }) => {
  const { hourlyTicketsTotalsHoy, ultimaFranjaHora } = data;

  const startIndex = 9;
  const endIndex = Math.min(ultimaFranjaHora, 19);

  const { labels, ticketsHoy, ticketsSemAnt, semAntTotal, hoyTotal, varPct, peakIdx } = useMemo(() => {
    const labels: string[] = [];
    for (let h = startIndex; h <= endIndex; h++) labels.push(`${h}:00`);
    const ticketsHoy = hourlyTicketsTotalsHoy.slice(startIndex, endIndex + 1);
    const ticketsSemAnt = data.branches.reduce((totals, b) => {
      b.hourlyTicketsSemAnt.slice(startIndex, endIndex + 1).forEach((v, i) => {
        totals[i] = (totals[i] ?? 0) + v;
      });
      return totals;
    }, Array(endIndex - startIndex + 1).fill(0));
    const semAntTotal = ticketsSemAnt.reduce((a: number, b: number) => a + b, 0);
    const hoyTotal = ticketsHoy.reduce((a, b) => a + b, 0);
    const varPct = semAntTotal > 0 ? ((hoyTotal - semAntTotal) / semAntTotal) * 100 : 0;
    const peakIdx = ticketsHoy.reduce((best, val, i) => val > (ticketsHoy[best] ?? 0) ? i : best, 0);
    return { labels, ticketsHoy, ticketsSemAnt, semAntTotal, hoyTotal, varPct, peakIdx };
  }, [hourlyTicketsTotalsHoy, data.branches, ultimaFranjaHora]);

  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: 'Hoy',
        data: ticketsHoy,
        backgroundColor: 'rgba(50, 87, 149, 0.85)',
        borderColor: '#325795',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Semana anterior',
        data: ticketsSemAnt,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }), [labels, ticketsHoy, ticketsSemAnt]);

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: { color: '#9ca3af', usePointStyle: true, pointStyle: 'circle', boxWidth: 8, boxHeight: 8, padding: 20, font: { size: 13, weight: 500 as const } },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.9)',
        titleColor: '#fff',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: { label: (ctx) => `${ctx.dataset.label}: ${Math.round(ctx.raw as number)} tickets` },
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#9ca3af', font: { size: 12, weight: 600 as const } } },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#9ca3af', font: { size: 11 }, callback: (v: any) => Math.round(v) },
      },
    },
  };

  return (
    <div className="w-screen h-screen bg-[#0b0e14] text-white flex flex-col p-8 overflow-hidden">
      <div className="mb-6 shrink-0 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <p className="text-[#325795] text-xs font-bold tracking-[0.3em] uppercase mb-1">Red total · franja {startIndex}–{endIndex}hs</p>
          <h1 className="text-4xl font-black uppercase tracking-wider">Tickets por Hora</h1>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <p className="text-gray-500 text-xs font-bold tracking-widest">TICKETS HOY</p>
            <p className="text-white font-mono font-black text-2xl">{hoyTotal.toLocaleString('es-AR')}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs font-bold tracking-widest">VS SEM. ANT.</p>
            <p className={`font-mono font-black text-2xl ${varPct >= 0 ? 'text-[#01B693]' : 'text-[#C8102E]'}`}>
              {varPct >= 0 ? '+' : ''}{varPct.toFixed(1)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs font-bold tracking-widest">SEM. ANT.</p>
            <p className="text-white font-mono font-black text-2xl">{semAntTotal.toLocaleString('es-AR')}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs font-bold tracking-widest">HORA PICO</p>
            <p className="text-white font-mono font-black text-2xl">{startIndex + peakIdx}:00hs</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};
