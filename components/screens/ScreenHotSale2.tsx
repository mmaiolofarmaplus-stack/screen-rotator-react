import React, { useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Tooltip, Filler, ScriptableContext, ChartOptions,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { CANALES, DEPOSITOS, HOURLY_TODAY, HOURLY_YEST } from './hotSaleData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Filler);

const T = {
  bg:          '#F7F8FA',
  surface:     '#FFFFFF',
  orange:      '#FF6B00',
  orangeLight: '#FF8C33',
  orangeDark:  '#D95A00',
  blue:        '#003DA5',
  blueLight:   '#1A5BBF',
  gray200:     '#E4E7EC',
  gray400:     '#98A2B3',
  gray600:     '#475467',
  gray900:     '#101828',
  success:     '#12B76A',
  successBg:   '#ECFDF3',
};

const CANAL_COLORS = [T.orange, T.blue, T.orangeLight, T.blueLight, T.gray400];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}h`);

function fmtM(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toLocaleString('es-AR', { maximumFractionDigits: 0 })}K`;
  return `$${new Intl.NumberFormat('es-AR').format(Math.round(v))}`;
}

export const ScreenHotSale2: React.FC = () => {
  const totalCanal = CANALES.reduce((s, c) => s + c.venta, 0);
  const totalDep   = DEPOSITOS.reduce((s, d) => s + d.venta, 0);

  // Hourly line chart
  const hourlyData = useMemo(() => ({
    labels: HOURS,
    datasets: [
      {
        label: 'Hoy (JUE 07)',
        data: HOURLY_TODAY,
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
        pointRadius: 4, pointBackgroundColor: T.orange, pointBorderColor: T.surface, pointBorderWidth: 2,
        spanGaps: false,
      },
      {
        label: 'Ayer (MIÉ 06)',
        data: HOURLY_YEST,
        borderColor: T.gray400,
        backgroundColor: 'transparent',
        fill: false, tension: 0.42, borderWidth: 2,
        borderDash: [7, 5],
        pointRadius: 0, spanGaps: true,
      },
    ],
  }), []);

  const hourlyOpts: ChartOptions<'line'> = {
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 500 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: T.surface, borderColor: T.gray200, borderWidth: 1,
        titleColor: T.gray900, bodyColor: T.gray600, padding: 10,
        callbacks: { label: ctx => `${ctx.dataset.label}: ${fmtM(ctx.raw as number)}` },
      },
    },
    scales: {
      x: {
        grid: { color: T.gray200 },
        ticks: { color: T.gray400, font: { size: 10 }, maxRotation: 0, maxTicksLimit: 12 },
      },
      y: {
        grid: { color: T.gray200 },
        ticks: { color: T.gray400, font: { size: 11 }, callback: v => fmtM(v as number) },
      },
    },
  };

  // Doughnut canal
  const donutData = useMemo(() => ({
    labels: CANALES.map(c => c.name),
    datasets: [{
      data: CANALES.map(c => c.venta),
      backgroundColor: CANAL_COLORS,
      borderColor: T.surface,
      borderWidth: 3,
      hoverOffset: 6,
    }],
  }), []);

  const donutOpts: ChartOptions<'doughnut'> = {
    responsive: true, maintainAspectRatio: false,
    cutout: '68%', animation: { duration: 600 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: T.surface, borderColor: T.gray200, borderWidth: 1,
        titleColor: T.gray900, bodyColor: T.gray600, padding: 10,
        callbacks: {
          label: ctx => `${ctx.label}: ${fmtM(ctx.raw as number)} (${((ctx.raw as number / totalCanal) * 100).toFixed(1)}%)`,
        },
      },
    },
  };

  return (
    <div style={{
      width: '100vw', height: '100vh', background: T.bg, overflow: 'hidden',
      display: 'flex', flexDirection: 'column', padding: '18px 24px', gap: 14,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: T.surface, borderRadius: 14, padding: '10px 20px',
        boxShadow: '0 1px 6px rgba(16,24,40,0.06)', flexShrink: 0,
        border: `1px solid ${T.gray200}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            background: `linear-gradient(135deg, ${T.orange} 0%, ${T.orangeDark} 100%)`,
            borderRadius: 10, padding: '5px 14px',
          }}>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: 13, color: '#fff', letterSpacing: 2 }}>HOT SALE 2026</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: T.successBg, borderRadius: 999, padding: '3px 10px', border: `1px solid ${T.success}40` }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.success, display: 'inline-block', boxShadow: `0 0 7px ${T.success}` }} />
            <span style={{ color: T.success, fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>LIVE</span>
          </div>
          <span style={{ color: T.gray400 }}>·</span>
          <span style={{ fontFamily: "'Manrope', sans-serif", color: T.gray900, fontSize: 18, fontWeight: 800 }}>Facturación por Hora</span>
          <span style={{ color: T.gray400 }}>·</span>
          <span style={{ color: T.gray600, fontSize: 13 }}>Mix de Canales · Acumulado 01–07 Mayo</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* legend */}
          {[
            { color: T.orange, label: 'Hoy (JUE)', dashed: false },
            { color: T.gray400, label: 'Ayer (MIÉ)', dashed: true },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {l.dashed
                ? <svg width="22" height="3"><line x1="0" y1="1.5" x2="22" y2="1.5" stroke={l.color} strokeWidth="2" strokeDasharray="5 4" /></svg>
                : <span style={{ width: 22, height: 3, background: l.color, display: 'inline-block', borderRadius: 2 }} />
              }
              <span style={{ color: T.gray600, fontSize: 12 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* Main area */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 14 }}>

        {/* Left: hourly chart — 2/3 */}
        <div style={{
          flex: 2, background: T.surface, borderRadius: 16,
          padding: '16px 20px', boxShadow: '0 2px 8px rgba(16,24,40,0.06)',
          border: `1px solid ${T.gray200}`, display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0, marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 11, color: T.gray400, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Facturación Horaria</p>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 700, color: T.gray900, marginTop: 2 }}>JUE 07/05 vs MIÉ 06/05</p>
            </div>
            <div style={{
              background: `${T.orange}18`, border: `1px solid ${T.orange}44`,
              borderRadius: 8, padding: '4px 12px',
            }}>
              <span style={{ color: T.orangeDark, fontSize: 11, fontWeight: 700 }}>02:59hs activo</span>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <Line data={hourlyData} options={hourlyOpts} />
          </div>
        </div>

        {/* Right: canal doughnut + depósitos — 1/3 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>

          {/* Canales doughnut */}
          <div style={{
            flex: 1, background: T.surface, borderRadius: 16,
            padding: '16px 18px', boxShadow: '0 2px 8px rgba(16,24,40,0.06)',
            border: `1px solid ${T.gray200}`, display: 'flex', flexDirection: 'column',
          }}>
            <p style={{ fontSize: 11, color: T.gray400, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0, marginBottom: 8 }}>
              Canales · Mix Acumulado
            </p>

            {/* Donut */}
            <div style={{ position: 'relative', height: 130, flexShrink: 0 }}>
              <Doughnut data={donutData} options={donutOpts} />
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none',
              }}>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, fontWeight: 800, color: T.orange, lineHeight: 1 }}>{fmtM(totalCanal)}</p>
                <p style={{ fontSize: 9, color: T.gray400, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>total</p>
              </div>
            </div>

            {/* Canal bars */}
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {CANALES.map((c, i) => {
                const pct = (c.venta / totalCanal) * 100;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: CANAL_COLORS[i], flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontSize: 11, color: T.gray600 }}>{c.short}</span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: CANAL_COLORS[i], fontFamily: 'monospace' }}>{pct.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 4, background: T.gray200, borderRadius: 999 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: CANAL_COLORS[i], borderRadius: 999, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Depósitos */}
          <div style={{
            background: T.surface, borderRadius: 16, padding: '16px 18px',
            boxShadow: '0 2px 8px rgba(16,24,40,0.06)', border: `1px solid ${T.gray200}`,
            flexShrink: 0,
          }}>
            <p style={{ fontSize: 11, color: T.gray400, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Depósitos · Fulfilment
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DEPOSITOS.map((d, i) => {
                const pct = (d.venta / totalDep) * 100;
                const colors = [T.blue, T.orange, T.blueLight];
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: T.gray600, fontWeight: 600 }}>{d.name}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: 11, color: T.gray400 }}>{fmtM(d.venta)}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: colors[i] }}>{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div style={{ height: 6, background: T.gray200, borderRadius: 999 }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: `linear-gradient(90deg, ${colors[i]}, ${colors[i]}BB)`,
                        borderRadius: 999, transition: 'width 1.2s ease',
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
