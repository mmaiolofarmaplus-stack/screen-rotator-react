import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { HotSaleData } from '../../services/hotSaleService';

ChartJS.register(ArcElement, Tooltip, Legend);

const T = {
  bg:          '#09091e',
  card:        'rgba(255,255,255,0.06)',
  cardBlue:    'rgba(0,53,166,0.40)',
  border:      'rgba(252,91,49,0.30)',
  borderSub:   'rgba(255,255,255,0.10)',
  borderBlue:  'rgba(0,83,166,0.55)',
  orange:      '#FC5B31',
  lime:        '#DDED59',
  cyan:        '#3EC7F4',
  blue:        '#0053A6',
  purple:      '#9B66FF',
  gold:        '#F5A623',
  creamDim:    'rgba(252,236,213,0.75)',
  creamFaint:  'rgba(252,236,213,0.22)',
  track:       'rgba(255,255,255,0.10)',
};

const CANAL_COLORS  = [T.orange, T.blue, '#FF8C33', T.cyan, T.lime, T.purple];
const DEP_COLORS    = ['#0053A6', T.orange, T.cyan, T.lime];

const fmtM = (v: number): string => {
  if (v >= 1e9) return `$${(v/1e9).toLocaleString('es-AR',{minimumFractionDigits:1,maximumFractionDigits:1})}B`;
  if (v >= 1e6) return `$${(v/1e6).toLocaleString('es-AR',{minimumFractionDigits:1,maximumFractionDigits:1})}M`;
  if (v >= 1e3) return `$${(v/1e3).toLocaleString('es-AR',{maximumFractionDigits:0})}K`;
  return `$${new Intl.NumberFormat('es-AR').format(Math.round(v))}`;
};
const fmtPct = (v: number) => v.toLocaleString('es-AR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%';

const donutOpts = (label: string): any => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  animation: { duration: 1100, easing: 'easeInOutQuart' },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0d1428',
      borderColor: T.lime,
      borderWidth: 1,
      titleColor: T.lime,
      bodyColor: T.creamDim,
      padding: 10,
      callbacks: { label: (ctx: any) => ` ${ctx.label}: ${fmtM(ctx.raw)} (${fmtPct((ctx.parsed / ctx.dataset.data.reduce((a: number, b: number) => a + b, 0)) * 100)})` },
    },
  },
});

const DonutCard: React.FC<{
  title: string; items: { name: string; short: string; venta: number }[];
  colors: string[]; total: number;
}> = ({ title, items, colors, total }) => {
  const data = {
    labels: items.map(x => x.name),
    datasets: [{
      data: items.map(x => x.venta),
      backgroundColor: colors.slice(0, items.length),
      borderColor: T.bg,
      borderWidth: 3,
      hoverBorderWidth: 4,
    }],
  };

  return (
    <div style={{
      flex: 1, background: T.cardBlue, borderRadius: 20,
      border: `1px solid ${T.border}`,
      padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: 12,
      boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
    }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.creamDim }}>
        {title}
      </p>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 20, alignItems: 'center' }}>
        {/* Donut */}
        <div style={{ flex: '0 0 auto', width: '42%', height: '100%', position: 'relative' }}>
          <Doughnut data={data} options={donutOpts(title)} />
          {/* Center total */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{ fontSize: 11, color: T.creamFaint, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{fmtM(total)}</span>
          </div>
        </div>
        {/* Legend */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item, i) => {
            const pct = total > 0 ? (item.venta / total) * 100 : 0;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: colors[i], flexShrink: 0, boxShadow: `0 0 6px ${colors[i]}99` }} />
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 600, flex: 1 }}>{item.short}</span>
                <span style={{ fontSize: 13, color: T.creamDim, fontFamily: 'monospace' }}>{fmtM(item.venta)}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: colors[i], minWidth: 52, textAlign: 'right' }}>{fmtPct(pct)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const BarList: React.FC<{
  title: string; items: { name: string; short: string; venta: number }[];
  colors: string[]; total: number;
}> = ({ title, items, colors, total }) => (
  <div style={{
    flex: 1, background: T.card, borderRadius: 16,
    border: `1px solid ${T.borderSub}`,
    padding: '16px 20px',
    display: 'flex', flexDirection: 'column', gap: 0,
  }}>
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.creamFaint, marginBottom: 14 }}>
      {title}
    </p>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((item, i) => {
        const pct = total > 0 ? (item.venta / total) * 100 : 0;
        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: colors[i], flexShrink: 0, boxShadow: `0 0 8px ${colors[i]}88` }} />
                <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{item.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
                <span style={{ fontSize: 15, color: T.creamDim, fontFamily: 'monospace' }}>{fmtM(item.venta)}</span>
                <span style={{ fontSize: 17, fontWeight: 700, color: colors[i], minWidth: 52, textAlign: 'right' }}>{fmtPct(pct)}</span>
              </div>
            </div>
            <div style={{ height: 7, background: T.track, borderRadius: 99 }}>
              <div style={{
                width: `${pct}%`, height: '100%', borderRadius: 99,
                background: colors[i],
                boxShadow: `0 0 10px ${colors[i]}66`,
                transition: 'width 1.2s ease',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export const ScreenHotSale2: React.FC<{ data: HotSaleData }> = ({ data }) => {
  const { canales, depositos, lastUpdated } = data;

  const totalCanal = canales.reduce((s, c) => s + c.venta, 0);
  const totalDep   = depositos.reduce((s, d) => s + d.venta, 0);

  const topCanales  = canales.slice(0, 5);
  const topDepositos = depositos.slice(0, 4);

  return (
    <div style={{
      width: '100vw', height: '100vh', background: T.bg, overflow: 'hidden',
      display: 'flex', flexDirection: 'column', padding: '14px 20px', gap: 12,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,16,50,0.85)', borderRadius: 14, padding: '10px 20px',
        border: `1px solid ${T.borderBlue}`, borderBottom: `3px solid ${T.lime}`,
        flexShrink: 0, position: 'relative',
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ background: `${T.orange}22`, border: `1px solid ${T.orange}44`, borderRadius: 8, padding: '5px 14px' }}>
            <span style={{ color: T.orange, fontSize: 14, fontWeight: 700 }}>Mix de Canales</span>
          </div>
          <div style={{ background: `${T.blue}33`, border: `1px solid ${T.blue}55`, borderRadius: 8, padding: '5px 14px' }}>
            <span style={{ color: T.cyan, fontSize: 14, fontWeight: 700 }}>Depósitos</span>
          </div>
        </div>

        <img src="/logo_hotsale.png" alt="Hot Sale 2026" style={{ height: 70, objectFit: 'contain', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }} />

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <p style={{ color: T.creamDim, fontSize: 15, fontWeight: 600 }}>
            Actualizado: {lastUpdated.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Donuts row */}
        <div style={{ flex: 55, minHeight: 0, display: 'flex', gap: 12 }}>
          <DonutCard title="Canales · Mix Acumulado" items={topCanales} colors={CANAL_COLORS} total={totalCanal} />
          <DonutCard title="Depósitos · Fulfilment" items={topDepositos} colors={DEP_COLORS} total={totalDep} />
        </div>

        {/* Bars row */}
        <div style={{ flex: 45, minHeight: 0, display: 'flex', gap: 12 }}>
          <BarList title="Canales" items={topCanales} colors={CANAL_COLORS} total={totalCanal} />
          <BarList title="Depósitos" items={topDepositos} colors={DEP_COLORS} total={totalDep} />
        </div>
      </div>
    </div>
  );
};
