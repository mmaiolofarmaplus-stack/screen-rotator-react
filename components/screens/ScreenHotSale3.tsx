import React, { useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Tooltip, ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { DAILY, TOP_PRODUCTS, TODAY_IDX } from './hotSaleData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const T = {
  bg:          '#F7F8FA',
  surface:     '#FFFFFF',
  orange:      '#FF6B00',
  orangeLight: '#FF8C33',
  orangeDark:  '#D95A00',
  orangePale:  '#FFF0E0',
  blue:        '#003DA5',
  gray200:     '#E4E7EC',
  gray400:     '#98A2B3',
  gray600:     '#475467',
  gray900:     '#101828',
  success:     '#12B76A',
  successBg:   '#ECFDF3',
};

const totalAcum = DAILY.reduce((s, d) => s + d.venta, 0);

function fmtM(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toLocaleString('es-AR', { maximumFractionDigits: 0 })}K`;
  return `$${new Intl.NumberFormat('es-AR').format(Math.round(v))}`;
}
function fmtN(v: number): string { return new Intl.NumberFormat('es-AR').format(v); }

export const ScreenHotSale3: React.FC = () => {
  const maxProd = TOP_PRODUCTS[0].venta;

  const barData = useMemo(() => ({
    labels: DAILY.map(d => d.short),
    datasets: [{
      data: DAILY.map(d => d.venta),
      backgroundColor: DAILY.map((_, i) => i === TODAY_IDX ? T.orange : `${T.orange}44`),
      borderColor:     DAILY.map((_, i) => i === TODAY_IDX ? T.orangeDark : 'transparent'),
      borderWidth: 2,
      borderRadius: 8,
      hoverBackgroundColor: DAILY.map((_, i) => i === TODAY_IDX ? T.orangeLight : `${T.orange}66`),
    }],
  }), []);

  const barOpts: ChartOptions<'bar'> = {
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 700 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: T.surface, borderColor: T.gray200, borderWidth: 1,
        titleColor: T.gray900, bodyColor: T.gray600, padding: 10,
        callbacks: { label: ctx => `Venta: ${fmtM(ctx.raw as number)}` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: T.gray900, font: { size: 14, weight: 700 } },
      },
      y: {
        grid: { color: T.gray200 },
        ticks: { color: T.gray400, font: { size: 11 }, callback: v => fmtM(v as number) },
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
          <span style={{ fontFamily: "'Manrope', sans-serif", color: T.gray900, fontSize: 18, fontWeight: 800 }}>Evolución Diaria</span>
          <span style={{ color: T.gray400 }}>·</span>
          <span style={{ color: T.gray600, fontSize: 13 }}>Top Productos · Acumulado 01–07 Mayo</span>
        </div>
        <div style={{
          background: `${T.orange}18`, border: `1px solid ${T.orange}44`,
          borderRadius: 10, padding: '6px 16px',
        }}>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 14, color: T.orangeDark }}>
            Total campaña: {fmtM(totalAcum)}
          </span>
        </div>
      </header>

      {/* Main area */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 14 }}>

        {/* Left: daily bar chart */}
        <div style={{
          flex: 55, background: T.surface, borderRadius: 16,
          padding: '18px 20px', boxShadow: '0 2px 8px rgba(16,24,40,0.06)',
          border: `1px solid ${T.gray200}`, display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ flexShrink: 0, marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: T.gray400, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Progreso Diario</p>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 700, color: T.gray900, marginTop: 2 }}>
              Ventas por día · Mayo 2026
            </p>
          </div>

          {/* Day totals mini-strip */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginBottom: 14 }}>
            {DAILY.map((d, i) => (
              <div key={i} style={{
                flex: 1, textAlign: 'center',
                background: i === TODAY_IDX ? `${T.orange}18` : T.bg,
                border: `1px solid ${i === TODAY_IDX ? T.orange + '55' : T.gray200}`,
                borderRadius: 8, padding: '6px 4px',
              }}>
                <p style={{ fontSize: 10, color: i === TODAY_IDX ? T.orangeDark : T.gray400, fontWeight: 700 }}>{d.short}</p>
                <p style={{
                  fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 800, lineHeight: 1,
                  color: i === TODAY_IDX ? T.orange : T.gray900, marginTop: 2,
                }}>{fmtM(d.venta)}</p>
              </div>
            ))}
          </div>

          <div style={{ flex: 1, minHeight: 0 }}>
            <Bar data={barData} options={barOpts} />
          </div>
        </div>

        {/* Right: top products */}
        <div style={{
          flex: 45, background: T.surface, borderRadius: 16,
          padding: '18px 20px', boxShadow: '0 2px 8px rgba(16,24,40,0.06)',
          border: `1px solid ${T.gray200}`, display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ flexShrink: 0, marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: T.gray400, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Top Productos</p>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 700, color: T.gray900, marginTop: 2 }}>
              Ranking por Venta Neta
            </p>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TOP_PRODUCTS.map((prod, i) => {
              const pct = (prod.venta / maxProd) * 100;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <span style={{
                        fontFamily: "'Manrope', sans-serif", fontSize: 14, fontWeight: 800, flexShrink: 0,
                        color: i === 0 ? T.orange : T.gray400, width: 20,
                      }}>{i + 1}</span>
                      <span style={{
                        fontSize: 12, color: T.gray600,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{prod.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexShrink: 0, marginLeft: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: T.gray400 }}>{fmtN(prod.unidades)} u</span>
                      <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 14, fontWeight: 800, color: T.orange }}>{fmtM(prod.venta)}</span>
                    </div>
                  </div>
                  <div style={{ height: 5, background: T.gray200, borderRadius: 999 }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: i === 0
                        ? `linear-gradient(90deg, ${T.orange}, ${T.orangeLight})`
                        : `linear-gradient(90deg, ${T.orange}88, ${T.orange}55)`,
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
  );
};
