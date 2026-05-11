import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { HotSaleData } from '../../services/hotSaleService';

ChartJS.register(ArcElement, Tooltip);

const T = {
  bg:          '#09091e',
  cardBlue:    'rgba(0,53,166,0.50)',
  cardDark:    'rgba(14,20,48,0.85)',
  border:      'rgba(252,91,49,0.35)',
  borderBlue:  'rgba(0,83,166,0.60)',
  borderSub:   'rgba(255,255,255,0.10)',
  orange:      '#FC5B31',
  orangeDark:  '#D94820',
  lime:        '#DDED59',
  cyan:        '#3EC7F4',
  blue:        '#0053A6',
  cream:       '#FCECD5',
  creamDim:    'rgba(252,236,213,0.75)',
  creamFaint:  'rgba(252,236,213,0.22)',
  track:       'rgba(255,255,255,0.14)',
};

const CANAL_COLORS = [T.orange, T.blue, '#FF8C33', T.cyan, T.lime];
const DEP_COLORS   = ['#0053A6', T.orange, T.cyan, T.lime];

const fmtFull = (v: number) =>
  '$ ' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(v));

const fmtPct = (v: number) =>
  v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';

const fmtNum = (v: number) =>
  new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(v));

const makeDonutData = (items: { name: string; venta: number }[], colors: string[]) => ({
  labels: items.map(x => x.name),
  datasets: [{
    data: items.map(x => x.venta),
    backgroundColor: colors.slice(0, items.length),
    borderColor: T.bg,
    borderWidth: 4,
    hoverBorderWidth: 6,
    hoverBorderColor: T.bg,
  }],
});

const makeDonutOpts = (total: number): any => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  animation: { animateRotate: true, animateScale: false, duration: 1400, easing: 'easeInOutQuart' },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0d1428',
      borderColor: T.lime,
      borderWidth: 1,
      titleColor: T.lime,
      bodyColor: T.creamDim,
      padding: 16,
      titleFont: { size: 15, weight: 'bold' },
      bodyFont: { size: 15 },
      callbacks: {
        label: (ctx: any) => {
          const pct = total > 0 ? (ctx.raw / total) * 100 : 0;
          return `  ${fmtFull(ctx.raw)}  ·  ${fmtPct(pct)}`;
        },
      },
    },
  },
});

/* ── Donut card ─────────────────────────────────────────────── */
const DonutCard: React.FC<{
  title: string;
  items: { name: string; short: string; venta: number }[];
  colors: string[];
  total: number;
  totalTickets: number;
  totalUnidades: number;
  pattern: string;
  deco?: string;
  animKey: number;
}> = ({ title, items, colors, total, totalTickets, totalUnidades, pattern, deco, animKey }) => (
  <div style={{
    flex: 1, background: T.cardBlue, borderRadius: 22,
    border: `1.5px solid ${T.border}`,
    padding: '22px 28px',
    display: 'flex', flexDirection: 'column',
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
  }}>
    <div style={{ position: 'absolute', inset: 0, opacity: 0.07, backgroundImage: `url(${pattern})`, backgroundSize: '70px 70px', pointerEvents: 'none' }} />
    {deco && <img src={deco} alt="" style={{ position: 'absolute', right: -8, bottom: -8, height: '48%', opacity: 0.10, pointerEvents: 'none', objectFit: 'contain', transform: 'rotate(-8deg)' }} />}

    <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: T.creamDim, marginBottom: 16, flexShrink: 0, position: 'relative' }}>
      {title}
    </p>

    <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 24, alignItems: 'center', position: 'relative' }}>
      {/* Donut */}
      <div style={{ flex: '0 0 52%', height: '100%', position: 'relative' }}>
        <div key={animKey} style={{ width: '100%', height: '100%' }}>
          <Doughnut data={makeDonutData(items, colors)} options={makeDonutOpts(total)} />
        </div>
        {/* Center label */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', gap: 3 }}>
          <span style={{ fontSize: 13, color: T.creamFaint, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Ventas</span>
          <span style={{ fontSize: 'clamp(14px,1.4vw,20px)', fontWeight: 900, color: '#fff', lineHeight: 1.2, textAlign: 'center', padding: '0 6%' }}>{fmtFull(total)}</span>
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 'clamp(11px,1.0vw,15px)', fontWeight: 700, color: T.cyan, background: `${T.cyan}18`, borderRadius: 99, padding: '3px 9px', whiteSpace: 'nowrap' }}>
              {fmtNum(totalTickets)} tkt
            </span>
            <span style={{ fontSize: 'clamp(11px,1.0vw,15px)', fontWeight: 700, color: T.lime, background: `${T.lime}18`, borderRadius: 99, padding: '3px 9px', whiteSpace: 'nowrap' }}>
              {fmtNum(totalUnidades)} uds
            </span>
          </div>
        </div>
      </div>

      {/* % legend */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'clamp(10px,1.5vh,20px)' }}>
        {items.map((item, i) => {
          const pct = total > 0 ? (item.venta / total) * 100 : 0;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: colors[i], flexShrink: 0, boxShadow: `0 0 10px ${colors[i]}BB` }} />
              <span style={{ fontSize: 'clamp(16px,1.7vw,22px)', fontWeight: 600, color: '#fff', flex: 1 }}>{item.name}</span>
              <span style={{ fontSize: 'clamp(20px,2.2vw,30px)', fontWeight: 900, color: colors[i], fontFamily: "'Manrope',sans-serif" }}>{fmtPct(pct)}</span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

/* ── Bar list ────────────────────────────────────────────────── */
const BarList: React.FC<{
  title: string;
  items: { name: string; venta: number }[];
  colors: string[];
  total: number;
  pattern: string;
}> = ({ title, items, colors, total, pattern }) => (
  <div style={{
    flex: 1, background: T.cardDark, borderRadius: 18,
    border: `1px solid ${T.borderSub}`,
    padding: '20px 28px',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 4px 20px rgba(0,0,0,0.30)',
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: `url(${pattern})`, backgroundSize: '70px 70px', pointerEvents: 'none' }} />
    <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: T.creamFaint, marginBottom: 18, flexShrink: 0, position: 'relative' }}>
      {title}
    </p>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', position: 'relative' }}>
      {items.map((item, i) => {
        const pct = total > 0 ? (item.venta / total) * 100 : 0;
        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: colors[i], flexShrink: 0, boxShadow: `0 0 8px ${colors[i]}99` }} />
                <span style={{ fontSize: 'clamp(17px,1.8vw,25px)', fontWeight: 600, color: '#fff' }}>{item.name}</span>
              </div>
              <span style={{ fontSize: 'clamp(19px,2.0vw,28px)', fontWeight: 800, color: T.cream, fontFamily: "'Manrope',monospace", letterSpacing: '-0.01em' }}>
                {fmtFull(item.venta)}
              </span>
            </div>
            <div style={{ height: 11, background: T.track, borderRadius: 99 }}>
              <div style={{
                width: `${pct}%`, height: '100%', borderRadius: 99,
                background: colors[i],
                boxShadow: `0 0 12px ${colors[i]}66`,
                transition: 'width 1.3s ease',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/* ── Main screen ────────────────────────────────────────────── */
export const ScreenHotSale2: React.FC<{ data: HotSaleData }> = ({ data }) => {
  const { canales, depositos, lastUpdated } = data;

  const [animKey, setAnimKey] = useState(0);
  useEffect(() => { setAnimKey(k => k + 1); }, [lastUpdated]);

  const [logoPulse, setLogoPulse] = useState(false);
  useEffect(() => {
    const id = setInterval(() => { setLogoPulse(true); setTimeout(() => setLogoPulse(false), 600); }, 2200);
    return () => clearInterval(id);
  }, []);

  const totalCanal    = canales.reduce((s, c) => s + c.venta,    0);
  const totalCanalTkt = canales.reduce((s, c) => s + c.tickets,  0);
  const totalCanalUds = canales.reduce((s, c) => s + c.unidades, 0);
  const totalDep      = depositos.reduce((s, d) => s + d.venta,    0);
  const totalDepTkt   = depositos.reduce((s, d) => s + d.tickets,  0);
  const totalDepUds   = depositos.reduce((s, d) => s + d.unidades, 0);
  const topC = canales.slice(0, 5);
  const topD = depositos.slice(0, 4);

  return (
    <div style={{
      width: '100vw', height: '100vh', background: T.bg, overflow: 'hidden',
      display: 'flex', flexDirection: 'column', padding: '14px 20px', gap: 12,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Header */}
      <header style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,16,50,0.90)', borderRadius: 16, padding: '10px 22px',
        border: `1px solid ${T.borderBlue}`, borderBottom: `3px solid ${T.lime}`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'url(/pattern-crosses-blue.png)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div style={{ background: `${T.orange}22`, border: `1px solid ${T.orange}55`, borderRadius: 10, padding: '6px 16px' }}>
            <span style={{ color: T.orange, fontSize: 16, fontWeight: 800, letterSpacing: '0.06em' }}>MIX DE CANALES</span>
          </div>
          <div style={{ background: `${T.blue}44`, border: `1px solid ${T.cyan}44`, borderRadius: 10, padding: '6px 16px' }}>
            <span style={{ color: T.cyan, fontSize: 16, fontWeight: 800, letterSpacing: '0.06em' }}>DEPÓSITOS</span>
          </div>
        </div>

        {/* Pulse logo */}
        <div style={{
          position: 'absolute', left: '50%',
          transform: `translateX(-50%) scale(${logoPulse ? 1.12 : 1.0})`,
          transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <img src="/logo_hotsale.png" alt="Hot Sale 2026" style={{ height: 68, objectFit: 'contain', display: 'block' }} />
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
          <p style={{ color: T.creamDim, fontSize: 16, fontWeight: 600 }}>
            Actualizado: {lastUpdated.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </header>

      {/* Top row: 2 donuts */}
      <div style={{ flex: 58, minHeight: 0, display: 'flex', gap: 12 }}>
        <DonutCard
          title="Canales · Mix Acumulado"
          items={topC} colors={CANAL_COLORS} total={totalCanal}
          totalTickets={totalCanalTkt} totalUnidades={totalCanalUds}
          pattern="/pattern-crosses-orange.png"
          deco="/Carrito de compras colorido y estilizado.png"
          animKey={animKey}
        />
        <DonutCard
          title="Depósitos · Fulfilment"
          items={topD} colors={DEP_COLORS} total={totalDep}
          totalTickets={totalDepTkt} totalUnidades={totalDepUds}
          pattern="/pattern-icons-lime.png"
          deco="/Tarro de crema en dibujo plano.png"
          animKey={animKey}
        />
      </div>

      {/* Bottom row: 2 bar lists */}
      <div style={{ flex: 42, minHeight: 0, display: 'flex', gap: 12 }}>
        <BarList title="Canales" items={topC} colors={CANAL_COLORS} total={totalCanal} pattern="/pattern-crosses-orange.png" />
        <BarList title="Depósitos" items={topD} colors={DEP_COLORS} total={totalDep} pattern="/pattern-icons-lime.png" />
      </div>
    </div>
  );
};
