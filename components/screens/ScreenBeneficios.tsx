import React, { useEffect, useState } from 'react';
import { DashboardData } from '../../types';
import { formatPct } from '../../utils/formatters';

interface Props { data: DashboardData; }

const CircleGauge: React.FC<{
  pct: number;
  color: string;
  trackColor?: string;
  size?: number;
  strokeWidth?: number;
  children: React.ReactNode;
}> = ({ pct, color, trackColor = '#1e2333', size = 320, strokeWidth = 22, children }) => {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const clampedPct = Math.min(100, Math.max(0, pct));
  const targetDash = (clampedPct / 100) * circumference;

  const [dash, setDash] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setDash(targetDash)));
    return () => cancelAnimationFrame(id);
  }, [targetDash]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        {children}
      </div>
    </div>
  );
};

const formatNumber = (n: number): string =>
  n.toLocaleString('es-AR', { maximumFractionDigits: 0 });

const META_CLIENTES_ANUAL = 1_000_000;

export const ScreenBeneficios: React.FC<Props> = ({ data }) => {
  const { altaClientes, pctNominados, metaPctNominados, diasMes, diaActual } = data;

  const safeAlta    = altaClientes     || 0;
  const safePctNom  = pctNominados     || 0;
  const safeMetaNom = metaPctNominados || 12;

  const pctClientes   = (safeAlta / META_CLIENTES_ANUAL) * 100;
  const diffNominados = safePctNom - safeMetaNom;

  return (
    <div className="w-screen h-screen bg-[#0b0e14] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-10 pt-8 pb-6 border-b border-white/10 shrink-0">
        <p className="text-[#4a7cc7] text-sm font-bold tracking-[0.3em] uppercase mb-1">
          Día {diaActual} de {diasMes}
        </p>
        <h1 className="text-5xl font-black uppercase tracking-wider text-white">Programa de Beneficios</h1>
      </div>

      {/* Main content — centered */}
      <div className="flex-1 min-h-0 flex items-center justify-center gap-28 px-10 pt-8">

        {/* Alta de Clientes */}
        <div className="flex flex-col items-center gap-6">
          <p className="text-[#4a7cc7] text-xl font-black tracking-[0.25em] uppercase">Alta de Clientes Acumulado</p>
          <CircleGauge pct={pctClientes} color="#01B693" size={340} strokeWidth={26}>
            <span className="text-white font-mono font-black text-7xl leading-none">
              {formatNumber(safeAlta)}
            </span>
            <span className="text-gray-300 text-lg font-bold mt-3 tracking-wider uppercase">de 1.000.000</span>
          </CircleGauge>
        </div>

        {/* Divider */}
        <div className="w-px h-80 bg-white/15" />

        {/* Tickets Nominados */}
        <div className="flex flex-col items-center gap-6">
          <p className="text-[#4a7cc7] text-xl font-black tracking-[0.25em] uppercase">% de Tickets Nominados Hoy</p>
          <CircleGauge
            pct={(safePctNom / safeMetaNom) * 100}
            color={diffNominados >= 0 ? '#01B693' : '#C8102E'}
            size={340}
            strokeWidth={26}
          >
            <span
              className="font-mono font-black text-7xl leading-none"
              style={{ color: diffNominados >= 0 ? '#01B693' : '#C8102E' }}
            >
              {formatPct(safePctNom, 1)}%
            </span>
            <span className="text-gray-300 text-lg font-bold mt-3 tracking-wider uppercase">
              meta {safeMetaNom}%
            </span>
          </CircleGauge>
        </div>

      </div>
    </div>
  );
};
