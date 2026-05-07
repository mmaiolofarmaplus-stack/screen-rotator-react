import React, { useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Tooltip, ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { HotSaleData } from '../../services/hotSaleService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

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
  limeDark:   '#B8C82A',
  cyan:       '#3EC7F4',
  blue:       '#0053A6',
  cream:      '#FCECD5',
  creamDim:   'rgba(252,236,213,0.65)',
  creamFaint: 'rgba(252,236,213,0.15)',
  gridLine:   'rgba(252,236,213,0.08)',
  tickColor:  'rgba(252,236,213,0.50)',
};

const fmtM = (v: number): string => {
  if (v >= 1e9) return `$${(v/1e9).toLocaleString('es-AR',{minimumFractionDigits:1,maximumFractionDigits:1})}B`;
  if (v >= 1e6) return `$${(v/1e6).toLocaleString('es-AR',{minimumFractionDigits:1,maximumFractionDigits:1})}M`;
  if (v >= 1e3) return `$${(v/1e3).toLocaleString('es-AR',{maximumFractionDigits:0})}K`;
  return `$${new Intl.NumberFormat('es-AR').format(Math.round(v))}`;
};
const fmtN = (v: number) => new Intl.NumberFormat('es-AR').format(v);

export const ScreenHotSale3: React.FC<{ data: HotSaleData }> = ({ data }) => {
  const { daily, products, acum } = data;

  const todayIdx  = daily.length - 1;
  const maxProd   = products[0]?.venta ?? 1;

  const barData = useMemo(() => ({
    labels: daily.map(d => d.short),
    datasets: [{
      data:            daily.map(d => d.venta),
      backgroundColor: daily.map((_, i) =>
        i === todayIdx ? T.orange : `rgba(252,91,49,0.28)`),
      borderColor: daily.map((_, i) =>
        i === todayIdx ? T.orangeDark : 'transparent'),
      borderWidth:  2,
      borderRadius: 8,
      hoverBackgroundColor: daily.map((_, i) =>
        i === todayIdx ? '#FF7A4A' : `rgba(252,91,49,0.45)`),
    }],
  }), [daily, todayIdx]);

  const barOpts: ChartOptions<'bar'> = {
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 700 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0d1428',
        borderColor: T.lime, borderWidth: 1,
        titleColor: T.lime, bodyColor: T.creamDim, padding: 10,
        callbacks: { label: ctx => `Venta: ${fmtM(ctx.raw as number)}` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: T.tickColor, font: { size: 13, weight: 700 } },
      },
      y: {
        grid: { color: T.gridLine },
        ticks: { color: T.tickColor, font: { size: 11 }, callback: v => fmtM(v as number) },
      },
    },
  };

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
          <span style={{ color: T.creamDim, fontSize: 14 }}>Evolución Diaria</span>
          <span style={{ color: T.creamFaint }}>·</span>
          <span style={{ color: 'rgba(252,236,213,0.4)', fontSize: 12 }}>Top Productos · {daily[0]?.fecha ?? '–'} – {daily[daily.length - 1]?.fecha ?? '–'}</span>
        </div>
        <div style={{
          background: `${T.orange}20`, border: `1px solid ${T.orange}44`,
          borderRadius: 10, padding: '5px 14px',
        }}>
          <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 13, color: T.orange }}>
            Total campaña: {fmtM(acum.venta)}
          </span>
        </div>
      </header>

      {/* Main */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 12 }}>

        {/* Left: daily chart */}
        <div style={{
          flex: 55, background: T.surfaceBlue, borderRadius: 16,
          padding: '16px 18px', border: `1px solid ${T.border}`,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ flexShrink: 0, marginBottom: 12 }}>
            <p style={{ fontSize: 10, color: T.creamDim, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Progreso Diario
            </p>
            <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
              Ventas por día
            </p>
          </div>

          {/* Day strip */}
          <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginBottom: 12 }}>
            {daily.map((d, i) => (
              <div key={i} style={{
                flex: 1, textAlign: 'center',
                background: i === todayIdx ? `${T.orange}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${i === todayIdx ? T.orange + '55' : T.borderSub}`,
                borderRadius: 8, padding: '6px 4px',
              }}>
                <p style={{ fontSize: 10, color: i === todayIdx ? T.orange : T.creamDim, fontWeight: 700 }}>{d.short}</p>
                <p style={{
                  fontFamily: "'Manrope',sans-serif", fontSize: 12, fontWeight: 800, lineHeight: 1,
                  color: i === todayIdx ? T.lime : '#fff', marginTop: 2,
                }}>{fmtM(d.venta)}</p>
              </div>
            ))}
          </div>

          {/* Decoration: calendar icon */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <img
              src="/Calendario de notas con detalles vibrantes.png"
              alt=""
              style={{
                position: 'absolute', right: 0, top: 0,
                height: '100%', opacity: 0.06,
                pointerEvents: 'none', objectFit: 'contain',
              }}
            />
            <Bar data={barData} options={barOpts} />
          </div>
        </div>

        {/* Right: top products */}
        <div style={{
          flex: 45, background: T.surfaceDark, borderRadius: 16,
          padding: '16px 18px', border: `1px solid ${T.borderSub}`,
          display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
        }}>
          {/* Deco */}
          <img
            src="/Dispenser y cepillo de colores neón.png"
            alt=""
            style={{
              position: 'absolute', right: -10, bottom: -10,
              height: '45%', opacity: 0.07,
              pointerEvents: 'none', objectFit: 'contain',
            }}
          />

          <div style={{ flexShrink: 0, marginBottom: 14 }}>
            <p style={{ fontSize: 10, color: T.creamDim, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Top Productos
            </p>
            <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>
              Ranking por Venta Neta
            </p>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 9 }}>
            {products.map((prod, i) => {
              const pct = (prod.venta / maxProd) * 100;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <span style={{
                        fontFamily: "'Manrope',sans-serif", fontSize: 15, fontWeight: 900, flexShrink: 0,
                        color: i === 0 ? T.lime : i === 1 ? T.orange : T.creamDim, width: 22,
                      }}>{i + 1}</span>
                      <span style={{
                        fontSize: 12, color: '#fff',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{prod.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexShrink: 0, marginLeft: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: T.creamDim }}>{fmtN(prod.unidades)} u</span>
                      <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 14, fontWeight: 800, color: i === 0 ? T.lime : T.orange }}>
                        {fmtM(prod.venta)}
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 99 }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: i === 0
                        ? `linear-gradient(90deg, ${T.lime}, ${T.limeDark})`
                        : `linear-gradient(90deg, ${T.orange}CC, ${T.orange}77)`,
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
  );
};
