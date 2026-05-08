import React, { useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Filler, ScriptableContext, ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { HotSaleData } from '../../services/hotSaleService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const T = {
  bg:         '#09091e',
  surfaceBlue:'rgba(0, 53, 166, 0.55)',
  surfaceDark:'rgba(255,255,255,0.09)',
  border:     'rgba(252, 91, 49, 0.35)',
  borderBlue: 'rgba(0, 83, 166, 0.6)',
  borderSub:  'rgba(255,255,255,0.12)',
  orange:     '#FC5B31',
  orangeDark: '#D94820',
  lime:       '#DDED59',
  cyan:       '#3EC7F4',
  blue:       '#0053A6',
  cream:      '#FCECD5',
  creamDim:   'rgba(252,236,213,0.75)',
  creamFaint: 'rgba(252,236,213,0.20)',
  gridLine:   'rgba(252,236,213,0.10)',
  tickColor:  'rgba(252,236,213,0.60)',
};

const CANAL_COLORS = [T.orange, T.blue, '#FF8C33', T.cyan, T.lime];
const DEP_COLORS   = ['#0053A6', T.orange, T.cyan];

const fmtM = (v: number): string => {
  if (v >= 1e9) return `$${(v/1e9).toLocaleString('es-AR',{minimumFractionDigits:1,maximumFractionDigits:1})}B`;
  if (v >= 1e6) return `$${(v/1e6).toLocaleString('es-AR',{minimumFractionDigits:1,maximumFractionDigits:1})}M`;
  if (v >= 1e3) return `$${(v/1e3).toLocaleString('es-AR',{maximumFractionDigits:0})}K`;
  return `$${new Intl.NumberFormat('es-AR').format(Math.round(v))}`;
};
const fmtPct = (v: number) => v.toLocaleString('es-AR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%';

const CAMPAIGN_DAYS = 8;

const cumsum = (arr: (number | null)[]): (number | null)[] => {
  let acc = 0;
  return arr.map(v => { if (v === null) return null; acc += v; return acc; });
};

export const ScreenHotSale2: React.FC<{ data: HotSaleData }> = ({ data }) => {
  const { hourlyHoy, hourlyAyer, hourlyLabels, lastSlotIdx, canales, depositos, meta } = data;

  const slots = hourlyLabels.length; // 24 or 48
  const startSlot = slots === 48 ? 14 : 7; // 7:00
  const visibleLabels = hourlyLabels.slice(startSlot);

  // Accumulated values
  const cumHoy  = cumsum(hourlyHoy);
  const cumAyer = cumsum(hourlyAyer);
  const visHoy  = cumHoy.slice(startSlot).map(v => v ?? 0);
  const visAyer = cumAyer.slice(startSlot).map(v => v ?? null);

  // Target intraday: linear from 0 to dailyMeta across all slots
  const dailyMeta = meta.venta / CAMPAIGN_DAYS;
  const visTarget = visibleLabels.map((_, i) => dailyMeta * (startSlot + i + 1) / slots);

  const lineData = useMemo(() => ({
    labels: visibleLabels,
    datasets: [
      {
        label: 'Hoy (acum.)',
        data: visHoy,
        borderColor: T.orange,
        backgroundColor: (ctx: ScriptableContext<'line'>) => {
          const { chart } = ctx;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return `${T.orange}33`;
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, `${T.orange}55`);
          g.addColorStop(1, `${T.orange}00`);
          return g;
        },
        fill: true, tension: 0.42, borderWidth: 3,
        pointRadius: 4, pointBackgroundColor: T.orange,
        pointBorderColor: T.bg, pointBorderWidth: 2, spanGaps: false,
      },
      {
        label: 'Target intraday',
        data: visTarget,
        borderColor: T.lime,
        backgroundColor: 'transparent',
        fill: false, tension: 0, borderWidth: 2,
        borderDash: [8, 5],
        pointRadius: 0, spanGaps: true,
      },
      {
        label: 'Ayer (acum.)',
        data: visAyer,
        borderColor: 'rgba(252,236,213,0.35)',
        backgroundColor: 'transparent',
        fill: false, tension: 0.42, borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0, spanGaps: true,
      },
    ],
  }), [visHoy, visAyer, visTarget, visibleLabels]);

  const lineOpts: ChartOptions<'line'> = {
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 600 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0d1428',
        borderColor: T.lime,
        borderWidth: 1,
        titleColor: T.lime,
        bodyColor: T.creamDim,
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: { label: ctx => `${ctx.dataset.label}: ${fmtM(ctx.raw as number)}` },
      },
    },
    scales: {
      x: {
        grid: { color: T.gridLine },
        ticks: { color: T.tickColor, font: { size: 14, weight: 'bold' }, maxRotation: 0, maxTicksLimit: 14 },
      },
      y: {
        grid: { color: T.gridLine },
        ticks: { color: T.tickColor, font: { size: 13 }, callback: v => fmtM(v as number) },
      },
    },
  };

  const totalCanal = canales.reduce((s, c) => s + c.venta, 0);
  const totalDep   = depositos.reduce((s, d) => s + d.venta, 0);

  const lastLabel = hourlyLabels[lastSlotIdx] ?? '–';

  return (
    <div style={{
      width: '100vw', height: '100vh', background: T.bg, overflow: 'hidden',
      display: 'flex', flexDirection: 'column', padding: '14px 20px', gap: 12,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0, 16, 50, 0.80)', borderRadius: 14, padding: '10px 20px',
        border: `1px solid ${T.borderBlue}`, borderBottom: `3px solid ${T.lime}`,
        flexShrink: 0, position: 'relative',
      }}>
        {/* Chart legend */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 18 }}>
          {([
            { color: T.orange,                    label: 'Hoy (acum.)', dashed: false },
            { color: T.lime,                      label: 'Target intraday', dashed: true },
            { color: 'rgba(252,236,213,0.40)',    label: 'Ayer (acum.)', dashed: true },
          ] as { color: string; label: string; dashed: boolean }[]).map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {l.dashed
                ? <svg width="24" height="3"><line x1="0" y1="1.5" x2="24" y2="1.5" stroke={l.color} strokeWidth="2.5" strokeDasharray="6 4" /></svg>
                : <span style={{ width: 24, height: 3, background: l.color, display: 'inline-block', borderRadius: 2 }} />}
              <span style={{ color: T.creamDim, fontSize: 14, fontWeight: 600 }}>{l.label}</span>
            </div>
          ))}
          <div style={{ background: `${T.orange}28`, border: `1px solid ${T.orange}55`, borderRadius: 8, padding: '4px 12px' }}>
            <span style={{ color: T.orange, fontSize: 13, fontWeight: 700 }}>{lastLabel} activo</span>
          </div>
        </div>

        {/* Centered logo */}
        <img src="/logo_hotsale.png" alt="Hot Sale 2026" style={{ height: 70, objectFit: 'contain', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }} />

        {/* Title right */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <p style={{ color: T.creamDim, fontSize: 18, fontWeight: 600 }}>
            Venta acumulada por hora
          </p>
        </div>
      </header>

      {/* Main */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 12 }}>

        {/* Left: hourly chart */}
        <div style={{
          flex: 62, background: T.surfaceBlue, borderRadius: 16,
          padding: '18px 20px', border: `1px solid ${T.border}`,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ flexShrink: 0, marginBottom: 14 }}>
            <p style={{ fontSize: 14, color: T.creamDim, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Facturación Horaria
            </p>
            <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 4 }}>
              Hoy vs Ayer · desde 07:00
            </p>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <Line data={lineData} options={lineOpts} />
          </div>
        </div>

        {/* Right */}
        <div style={{ flex: 38, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>

          {/* Canales */}
          <div style={{
            flex: 55, background: T.surfaceBlue, borderRadius: 16,
            padding: '16px 18px', border: `1px solid ${T.border}`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <p style={{ fontSize: 14, color: T.creamDim, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14, flexShrink: 0 }}>
              Canales · Mix Acumulado
            </p>
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 11 }}>
              {canales.slice(0, 5).map((c, i) => {
                const pct = totalCanal > 0 ? (c.venta / totalCanal) * 100 : 0;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: CANAL_COLORS[i], flexShrink: 0, display: 'inline-block', boxShadow: `0 0 8px ${CANAL_COLORS[i]}99` }} />
                        <span style={{ fontSize: 17, color: '#fff', fontWeight: 600 }}>{c.short}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <span style={{ fontSize: 16, color: T.creamDim, fontFamily: 'monospace' }}>{fmtM(c.venta)}</span>
                        <span style={{ fontSize: 17, fontWeight: 700, color: CANAL_COLORS[i] }}>{fmtPct(pct)}</span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.12)', borderRadius: 99 }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: CANAL_COLORS[i],
                        borderRadius: 99,
                        boxShadow: `0 0 10px ${CANAL_COLORS[i]}77`,
                        transition: 'width 1s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Depósitos */}
          <div style={{
            flex: 45, background: T.surfaceDark, borderRadius: 16,
            padding: '16px 18px', border: `1px solid ${T.borderSub}`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <p style={{ fontSize: 14, color: T.creamDim, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14, flexShrink: 0 }}>
              Depósitos · Fulfilment
            </p>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {depositos.slice(0, 3).map((d, i) => {
                const pct = totalDep > 0 ? (d.venta / totalDep) * 100 : 0;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 17, color: '#fff', fontWeight: 600 }}>{d.name}</span>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <span style={{ fontSize: 16, color: T.creamDim }}>{fmtM(d.venta)}</span>
                        <span style={{ fontSize: 17, fontWeight: 700, color: DEP_COLORS[i] }}>{fmtPct(pct)}</span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.12)', borderRadius: 99 }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: `linear-gradient(90deg, ${DEP_COLORS[i]}, ${DEP_COLORS[i]}BB)`,
                        borderRadius: 99, transition: 'width 1.2s ease',
                        boxShadow: `0 0 8px ${DEP_COLORS[i]}66`,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
