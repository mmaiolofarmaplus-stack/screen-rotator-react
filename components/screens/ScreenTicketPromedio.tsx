import React, { useMemo } from 'react';
import { DashboardData, BranchData } from '../../types';
import { formatMillions, formatPct } from '../../utils/formatters';
import { AnimatedBar } from '../AnimatedBar';
import { AutoScrollList } from '../AutoScrollList';

interface Props { data: DashboardData; }

const BranchRow: React.FC<{ b: BranchData; rank: number; maxTicket: number }> = ({ b, rank, maxTicket }) => {
  const ticketHoy    = b.hoyTickets > 0 ? b.hoyNeto / b.hoyTickets : 0;
  const ticketSemAnt = b.semAntTickets > 0 ? b.semAntNeto / b.semAntTickets : 0;
  const varPct       = ticketSemAnt > 0 ? ((ticketHoy - ticketSemAnt) / ticketSemAnt) * 100 : 0;
  const widthPct     = maxTicket > 0 ? (ticketHoy / maxTicket) * 100 : 0;
  const medal        = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  return (
    <div className="flex flex-col gap-1.5 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-gray-500 font-bold text-base w-7 text-right shrink-0">{medal ?? rank}</span>
          <span className="text-white font-bold text-lg uppercase tracking-wide truncate">{b.name}</span>
        </div>
        <div className="flex items-center gap-8 shrink-0">
          {ticketSemAnt > 0 && (
            <div className="text-right">
              <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Sem. Ant.</p>
              <p className={`font-mono font-bold text-base ${varPct >= 0 ? 'text-[#01B693]' : 'text-[#f59e0b]'}`}>
                {varPct >= 0 ? '↑' : '↓'} {formatMillions(ticketSemAnt)}
              </p>
            </div>
          )}
          <span className="text-white font-mono font-black text-3xl">{formatMillions(ticketHoy)}</span>
        </div>
      </div>
      <div className="ml-10 h-2 bg-white/5 rounded-full overflow-hidden">
        <AnimatedBar pct={widthPct} color="#325795" delay={rank * 18} />
      </div>
    </div>
  );
};

export const ScreenTicketPromedio: React.FC<Props> = ({ data }) => {
  const { sorted, maxTicket, redTicketHoy, redTicketSemAnt, redVarPct } = useMemo(() => {
    const withTickets = data.branches.filter(b => b.hoyTickets > 0);
    const sorted = [...withTickets].sort((a, b) =>
      (b.hoyNeto / b.hoyTickets) - (a.hoyNeto / a.hoyTickets)
    );
    const maxTicket      = sorted.length > 0 ? sorted[0].hoyNeto / sorted[0].hoyTickets : 1;
    const redTicketHoy   = data.totalTickets > 0 ? data.totalNeto / data.totalTickets : 0;
    const semAntTickets  = data.branches.reduce((s, b) => s + b.semAntTickets, 0);
    const semAntNeto     = data.branches.reduce((s, b) => s + b.semAntNeto, 0);
    const redTicketSemAnt = semAntTickets > 0 ? semAntNeto / semAntTickets : 0;
    const redVarPct      = redTicketSemAnt > 0 ? ((redTicketHoy - redTicketSemAnt) / redTicketSemAnt) * 100 : 0;
    return { sorted, maxTicket, redTicketHoy, redTicketSemAnt, redVarPct };
  }, [data.branches, data.totalNeto, data.totalTickets]);

  return (
    <div className="w-screen h-screen bg-[#0b0e14] text-white flex flex-col p-8 overflow-hidden">
      <div className="mb-6 shrink-0 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <p className="text-[#325795] text-sm font-bold tracking-[0.3em] uppercase mb-1">
            Red total · hasta las {data.ultimaFranjaHora}hs
          </p>
          <h1 className="text-4xl font-black uppercase tracking-wider">Ticket Promedio</h1>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <p className="text-gray-400 text-sm font-bold tracking-widest uppercase">Promedio Red Hoy</p>
            <p className="text-white font-mono font-black text-3xl">{formatMillions(redTicketHoy)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm font-bold tracking-widest uppercase">VS Sem. Ant.</p>
            <p className={`font-mono font-black text-3xl ${redVarPct >= 0 ? 'text-[#01B693]' : 'text-[#f59e0b]'}`}>
              {redVarPct >= 0 ? '+' : ''}{formatPct(redVarPct)}%
            </p>
          </div>
          {redTicketSemAnt > 0 && (
            <div className="text-right">
              <p className="text-gray-400 text-sm font-bold tracking-widest uppercase">Sem. Ant.</p>
              <p className="text-white font-mono font-black text-3xl">{formatMillions(redTicketSemAnt)}</p>
            </div>
          )}
          <div className="text-right">
            <p className="text-gray-400 text-sm font-bold tracking-widest uppercase">Total Tickets</p>
            <p className="text-white font-mono font-black text-3xl">{data.totalTickets.toLocaleString('es-AR')}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <AutoScrollList
          items={sorted}
          itemHeight={60}
          renderItem={(b, i) => <BranchRow key={b.id} b={b} rank={i + 1} maxTicket={maxTicket} />}
        />
      </div>
    </div>
  );
};
