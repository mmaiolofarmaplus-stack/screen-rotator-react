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
  surfaceBlue:'rgba(0, 53, 166, 0.28)',
  surfaceDark:'rgba(255,255,255,0.04)',
  border:     'rgba(252, 91, 49, 0.22)',
  borderBlue: 'rgba(0, 83, 166, 0.5)',
  borderSub:  'rgba(255,255,255,0.07)',
  orange:     '#FC5B31',
  orangeDark: '#D94820',
  lime:       '#DDED59',
  cyan:       '#3EC7F4',
  blue:       '#0053A6',
  cream:      '#FCECD5',
  creamDim:   'rgba(252,236,213,0.65)',
  creamFaint: 'rgba(252,236,213,0.15)',
  gridLine:   'rgba(252,236,213,0.08)',
  tickColor:  'rgba(252,236,213,0.50)',
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

export const ScreenHotSale2: React.FC<{ data: HotSaleData }> = ({ data }) => {
  const { hourlyHoy, hourlyAyer, hourlyLabels, lastSlotIdx, canales, depositos } = data;

  const startSlot = 14; // 7:00
  const visibleLabels = hourlyLabels.slice(startSlot);
  const visHoy   = hourlyHoy.slice(startSlot).map(v => v ?? 0);
  const visAyer  = hourlyAyer.slice(startSlot).map(v => v ?? null);

  const lineData = useMemo(() => ({
    labels: visibleLabels,
    datasets: [
      {
        label: 'Hoy',
        data: visHoy,
        borderColor: T.orange,
        backgroundColor: (ctx: ScriptableContext<'line'>) => {
          const { chart } = ctx;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return `${T.orange}22`;
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
        label: 'Ayer',
        data: visAyer,
        borderColor: 'rgba(252,236,213,0.30)',
        backgroundColor: 'transparent',
        fill: false, tension: 0.42, borderWidth: 2,
        borderDash: [7, 5],
        pointRadius: 0, spanGaps: true,
      },
    ],
  }), [visHoy, visAyer, visibleLabels]);

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
        padding: 10,
        callbacks: { label: ctx => `${ctx.dataset.label}: ${fmtM(ctx.raw as number)}` },
      },
    },
    scales: {
      x: {
        grid: { color: T.gridLine },
        ticks: { color: T.tickColor, font: { size: 11 }, maxRotation: 0, maxTicksLimit: 14 },
      },
      y: {
        grid: { color: T.gridLine },
        ticks: { color: T.tickColor, font: { size: 11 }, callback: v => fmtM(v as number) },
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
        background: 'rgba(0, 16, 50, 0.7)', borderRadius: 14, padding: '10px 18px',
        border: `1px solid ${T.borderBlue}`, borderBottom: `2px solid ${T.lime}`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="/logo_hotsale.png" alt="Hot Sale 2026" style={{ height: 34, objectFit: 'contain' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.lime, borderRadius: 99, padding: '3px 10px 3px 7px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.blue, display: 'inline-block' }} />
            <span style={{ color: T.blue, fontSize: 10, fontWeight: 900, letterSpacing: '0.12em' }}>LIVE</span>
          </div>
          <span style={{ color: T.creamDim, fontSize: 14 }}>Facturación por Hora</span>
          <span style={{ color: T.creamFaint }}>·</span>
          <span style={{ color: 'rgba(252,236,213,0.4)', fontSize: 12 }}>Mix de Canales · Depósitos</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {[
            { color: T.orange, label: 'Hoy', dashed: false },
            { color: 'rgba(252,236,213,0.35)', label: 'Ayer', dashed: true },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {l.dashed
                ? <svg width="22" height="3"><line x1="0" y1="1.5" x2="22" y2="1.5" stroke={l.color} strokeWidth="2" strokeDasharray="5 4" /></svg>
                : <span style={{ width: 22, height: 3, background: l.color, display: 'inline-block', borderRadius: 2 }} />
              }
              <span style={{ color: T.creamDim, fontSize: 12 }}>{l.label}</span>
            </div>
          ))}
          <div style={{
            background: `${T.orange}22`, border: `1px solid ${T.orange}44`,
            borderRadius: 8, padding: '4px 12px',
          }}>
            <span style={{ color: T.orange, fontSize: 11, fontWeight: 700 }}>{lastLabel} activo</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 12 }}>

        {/* Left: hourly chart */}
        <div style={{
          flex: 62, background: T.surfaceBlue, borderRadius: 16,
          padding: '16px 18px', border: `1px solid ${T.border}`,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ flexShrink: 0, marginBottom: 12 }}>
            <p style={{ fontSize: 10, color: T.creamDim, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Facturación Horaria
            </p>
            <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
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
            padding: '14px 16px', border: `1px solid ${T.border}`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <p style={{ fontSize: 10, color: T.creamDim, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, flexShrink: 0 }}>
              Canales · Mix Acumulado
            </p>
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {canales.slice(0, 5).map((c, i) => {
                const pct = totalCanal > 0 ? (c.venta / totalCanal) * 100 : 0;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: CANAL_COLORS[i], flexShrink: 0, display: 'inline-block', boxShadow: `0 0 6px ${CANAL_COLORS[i]}88` }} />
                        <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{c.short}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontSize: 12, color: T.creamDim, fontFamily: 'monospace' }}>{fmtM(c.venta)}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: CANAL_COLORS[i] }}>{fmtPct(pct)}</span>
                      </div>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.10)', borderRadius: 99 }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: CANAL_COLORS[i],
                        borderRadius: 99,
                        boxShadow: `0 0 8px ${CANAL_COLORS[i]}66`,
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
            padding: '14px 16px', border: `1px solid ${T.borderSub}`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <p style={{ fontSize: 10, color: T.creamDim, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, flexShrink: 0 }}>
              Depósitos · Fulfilment
            </p>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {depositos.slice(0, 3).map((d, i) => {
                const pct = totalDep > 0 ? (d.venta / totalDep) * 100 : 0;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{d.name}</span>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontSize: 11, color: T.creamDim }}>{fmtM(d.venta)}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: DEP_COLORS[i] }}>{fmtPct(pct)}</span>
                      </div>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.10)', borderRadius: 99 }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: `linear-gradient(90deg, ${DEP_COLORS[i]}, ${DEP_COLORS[i]}BB)`,
                        borderRadius: 99, transition: 'width 1.2s ease',
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
