import React, { useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Tooltip, ChartOptions, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { HotSaleData } from '../../services/hotSaleService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

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
  limeDark:   '#B8C82A',
  cyan:       '#3EC7F4',
  blue:       '#0053A6',
  cream:      '#FCECD5',
  creamDim:   'rgba(252,236,213,0.75)',
  creamFaint: 'rgba(252,236,213,0.20)',
  gridLine:   'rgba(252,236,213,0.10)',
  tickColor:  'rgba(252,236,213,0.60)',
};

const HS_START_MS = new Date('2026-05-11').getTime();
const HS_END_MS   = new Date('2026-05-18').getTime();

const isHSDay = (fecha: string): boolean => {
  const p = fecha.split('/');
  if (p.length < 2) return false;
  const t = new Date(+(p[2] || 2026), +p[1] - 1, +p[0]).getTime();
  return t >= HS_START_MS && t <= HS_END_MS;
};

const fmtM = (v: number): string => {
  if (v >= 1e9) return `$${(v/1e9).toLocaleString('es-AR',{minimumFractionDigits:1,maximumFractionDigits:1})}B`;
  if (v >= 1e6) return `$${(v/1e6).toLocaleString('es-AR',{minimumFractionDigits:1,maximumFractionDigits:1})}M`;
  if (v >= 1e3) return `$${(v/1e3).toLocaleString('es-AR',{maximumFractionDigits:0})}K`;
  return `$${new Intl.NumberFormat('es-AR').format(Math.round(v))}`;
};
const fmtN = (v: number) => new Intl.NumberFormat('es-AR').format(v);

export const ScreenHotSale3: React.FC<{ data: HotSaleData }> = ({ data }) => {
  const { daily, products, acum, meta } = data;

  const todayIdx     = daily.length - 1;
  const maxProd      = products[0]?.venta ?? 1;
  const dailyTarget  = meta.venta > 0 ? meta.venta / 8 : 0;

  const barData = useMemo(() => ({
    labels: daily.map(d => d.short),
    datasets: [
      {
        label: 'Real',
        data: daily.map(d => d.venta),
        backgroundColor: daily.map(d =>
          isHSDay(d.fecha) ? T.orange : 'rgba(252,236,213,0.18)'
        ),
        borderColor: daily.map(d =>
          isHSDay(d.fecha) ? T.orangeDark : 'transparent'
        ),
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.45,
      },
      {
        label: 'Objetivo',
        data: daily.map(d => isHSDay(d.fecha) ? dailyTarget : null),
        backgroundColor: daily.map(d =>
          isHSDay(d.fecha) ? 'rgba(0, 83, 166, 0.50)' : 'transparent'
        ),
        borderColor: daily.map(d =>
          isHSDay(d.fecha) ? 'rgba(0, 83, 166, 0.85)' : 'transparent'
        ),
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.45,
      },
    ],
  }), [daily, todayIdx, dailyTarget]);

  const barOpts: ChartOptions<'bar'> = {
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 700 },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: T.tickColor,
          font: { size: 13, weight: 'bold' },
          boxWidth: 12,
          boxHeight: 12,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#0d1428',
        borderColor: T.lime, borderWidth: 1,
        titleColor: T.lime, bodyColor: T.creamDim, padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: { label: ctx => `${ctx.dataset.label}: ${fmtM(ctx.raw as number)}` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: T.tickColor, font: { size: 15, weight: 'bold' } },
      },
      y: {
        grid: { color: T.gridLine },
        ticks: { color: T.tickColor, font: { size: 13 }, callback: v => fmtM(v as number) },
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
        background: 'rgba(0, 16, 50, 0.80)', borderRadius: 14, padding: '10px 20px',
        border: `1px solid ${T.borderBlue}`, borderBottom: `3px solid ${T.lime}`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/logo_hotsale.png" alt="Hot Sale 2026" style={{ height: 54, objectFit: 'contain' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: T.lime, borderRadius: 99, padding: '4px 12px 4px 9px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.blue, display: 'inline-block' }} />
            <span style={{ color: T.blue, fontSize: 13, fontWeight: 900, letterSpacing: '0.12em' }}>LIVE</span>
          </div>
          <span style={{ color: T.creamDim, fontSize: 20, fontWeight: 500 }}>Evolución Diaria</span>
          <span style={{ color: T.creamFaint, fontSize: 18 }}>·</span>
          <span style={{ color: 'rgba(252,236,213,0.5)', fontSize: 15 }}>
            Top Productos · {daily[0]?.fecha ?? '–'} – {daily[daily.length - 1]?.fecha ?? '–'}
          </span>
        </div>
        <div style={{
          background: `${T.orange}28`, border: `1px solid ${T.orange}55`,
          borderRadius: 10, padding: '6px 16px',
        }}>
          <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 18, color: T.orange }}>
            Total campaña: {fmtM(acum.venta)}
          </span>
        </div>
      </header>

      {/* Main */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 12 }}>

        {/* Left: daily chart */}
        <div style={{
          flex: 55, background: T.surfaceBlue, borderRadius: 16,
          padding: '18px 20px', border: `1px solid ${T.border}`,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ flexShrink: 0, marginBottom: 14 }}>
            <p style={{ fontSize: 14, color: T.creamDim, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Progreso Diario
            </p>
            <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 4 }}>
              Ventas por día · Real vs Objetivo
            </p>
          </div>

          {/* Day strip */}
          <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginBottom: 12 }}>
            {daily.map((d, i) => (
              <div key={i} style={{
                flex: 1, textAlign: 'center',
                background: i === todayIdx
                  ? `${T.orange}28`
                  : isHSDay(d.fecha)
                    ? 'rgba(0,53,166,0.25)'
                    : 'rgba(255,255,255,0.05)',
                border: `1px solid ${i === todayIdx ? T.orange + '66' : isHSDay(d.fecha) ? T.blue + '55' : T.borderSub}`,
                borderRadius: 8, padding: '6px 4px',
              }}>
                <p style={{ fontSize: 15, color: i === todayIdx ? T.orange : isHSDay(d.fecha) ? T.creamDim : 'rgba(252,236,213,0.40)', fontWeight: 700 }}>
                  {d.short}
                </p>
                <p style={{
                  fontFamily: "'Manrope',sans-serif", fontSize: 14, fontWeight: 800, lineHeight: 1,
                  color: i === todayIdx ? T.lime : isHSDay(d.fecha) ? '#fff' : 'rgba(252,236,213,0.40)',
                  marginTop: 3,
                }}>{fmtM(d.venta)}</p>
              </div>
            ))}
          </div>

          {/* Hot Sale badge */}
          <div style={{
            flexShrink: 0, marginBottom: 10,
            background: `${T.orange}18`, border: `1px dashed ${T.orange}55`,
            borderRadius: 6, padding: '4px 12px', alignSelf: 'flex-start',
          }}>
            <span style={{ color: T.orange, fontSize: 13, fontWeight: 700 }}>
              🔥 Hot Sale: 11 al 18 de mayo
            </span>
          </div>

          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <img
              src="/Calendario de notas con detalles vibrantes.png"
              alt=""
              style={{
                position: 'absolute', right: 0, top: 0,
                height: '100%', opacity: 0.05,
                pointerEvents: 'none', objectFit: 'contain',
              }}
            />
            <Bar data={barData} options={barOpts} />
          </div>
        </div>

        {/* Right: top products */}
        <div style={{
          flex: 45, background: T.surfaceDark, borderRadius: 16,
          padding: '18px 20px', border: `1px solid ${T.borderSub}`,
          display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
        }}>
          <img
            src="/Dispenser y cepillo de colores neón.png"
            alt=""
            style={{
              position: 'absolute', right: -10, bottom: -10,
              height: '45%', opacity: 0.06,
              pointerEvents: 'none', objectFit: 'contain',
            }}
          />

          <div style={{ flexShrink: 0, marginBottom: 16 }}>
            <p style={{ fontSize: 14, color: T.creamDim, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Top Productos
            </p>
            <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 4 }}>
              Ranking por Venta Neta
            </p>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 11 }}>
            {products.map((prod, i) => {
              const pct = (prod.venta / maxProd) * 100;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <span style={{
                        fontFamily: "'Manrope',sans-serif", fontSize: 22, fontWeight: 900, flexShrink: 0,
                        color: i === 0 ? T.lime : i === 1 ? T.orange : T.creamDim, width: 26,
                      }}>{i + 1}</span>
                      <span style={{
                        fontSize: 17, color: '#fff',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{prod.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 14, flexShrink: 0, marginLeft: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 15, color: T.creamDim }}>{fmtN(prod.unidades)} u</span>
                      <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 20, fontWeight: 800, color: i === 0 ? T.lime : T.orange }}>
                        {fmtM(prod.venta)}
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.10)', borderRadius: 99 }}>
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
