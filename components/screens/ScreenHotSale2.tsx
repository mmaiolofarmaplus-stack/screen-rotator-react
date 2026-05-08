import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { HotSaleData } from '../../services/hotSaleService';

ChartJS.register(ArcElement, Tooltip);

const T = {
  bg:         '#09091e',
  cardBlue:   'rgba(0,53,166,0.50)',
  cardDark:   'rgba(255,255,255,0.05)',
  border:     'rgba(252,91,49,0.35)',
  borderSub:  'rgba(255,255,255,0.10)',
  borderBlue: 'rgba(0,83,166,0.60)',
  orange:     '#FC5B31',
  orangeDark: '#D94820',
  lime:       '#DDED59',
  cyan:       '#3EC7F4',
  blue:       '#0053A6',
  cream:      '#FCECD5',
  creamDim:   'rgba(252,236,213,0.75)',
  creamFaint: 'rgba(252,236,213,0.22)',
  track:      'rgba(255,255,255,0.12)',
};

const CANAL_COLORS = [T.orange, T.blue, '#FF8C33', T.cyan, T.lime];
const DEP_COLORS   = ['#0053A6', T.orange, T.cyan, T.lime];

const fmtFull = (v: number): string =>
  '$ ' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(v));

const fmtPct = (v: number) =>
  v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';

const donutOpts = (total: number): any => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '66%',
  animation: { duration: 1200, easing: 'easeInOutQuart' as const },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0d1428',
      borderColor: T.lime,
      borderWidth: 1,
      titleColor: T.lime,
      bodyColor: T.creamDim,
      padding: 14,
      callbacks: {
        label: (ctx: any) => {
          const pct = total > 0 ? (ctx.raw / total) * 100 : 0;
          return ` ${ctx.label}: ${fmtFull(ctx.raw)} (${fmtPct(pct)})`;
        },
      },
    },
  },
});

export const ScreenHotSale2: React.FC<{ data: HotSaleData }> = ({ data }) => {
  const { canales, depositos, lastUpdated } = data;

  const [logoPulse, setLogoPulse] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setLogoPulse(true);
      setTimeout(() => setLogoPulse(false), 600);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const totalCanal = canales.reduce((s, c) => s + c.venta, 0);
  const totalDep   = depositos.reduce((s, d) => s + d.venta, 0);
  const topC = canales.slice(0, 5);
  const topD = depositos.slice(0, 4);

  const canalDonutData = {
    labels: topC.map(x => x.name),
    datasets: [{ data: topC.map(x => x.venta), backgroundColor: CANAL_COLORS.slice(0, topC.length), borderColor: T.bg, borderWidth: 4, hoverBorderWidth: 5 }],
  };
  const depDonutData = {
    labels: topD.map(x => x.name),
    datasets: [{ data: topD.map(x => x.venta), backgroundColor: DEP_COLORS.slice(0, topD.length), borderColor: T.bg, borderWidth: 4, hoverBorderWidth: 5 }],
  };

  return (
    <div style={{
      width: '100vw', height: '100vh', background: T.bg, overflow: 'hidden',
      display: 'flex', flexDirection: 'column', padding: '16px 22px', gap: 14,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* ── Header ── */}
      <header style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,16,50,0.85)', borderRadius: 16, padding: '12px 24px',
        border: `1px solid ${T.borderBlue}`, borderBottom: `3px solid ${T.lime}`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Pattern bg */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: 'url(/pattern-crosses-blue.png)', backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <div style={{ background: `${T.orange}22`, border: `1px solid ${T.orange}55`, borderRadius: 10, padding: '6px 16px' }}>
            <span style={{ color: T.orange, fontSize: 15, fontWeight: 800, letterSpacing: '0.05em' }}>MIX DE CANALES</span>
          </div>
          <div style={{ background: `${T.blue}33`, border: `1px solid ${T.cyan}44`, borderRadius: 10, padding: '6px 16px' }}>
            <span style={{ color: T.cyan, fontSize: 15, fontWeight: 800, letterSpacing: '0.05em' }}>DEPÓSITOS</span>
          </div>
        </div>

        {/* Logo with pulse */}
        <div style={{
          position: 'absolute', left: '50%', transform: `translateX(-50%) scale(${logoPulse ? 1.10 : 1.0})`,
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <img src="/logo_hotsale.png" alt="Hot Sale 2026" style={{ height: 72, objectFit: 'contain', display: 'block' }} />
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
          <p style={{ color: T.creamDim, fontSize: 15, fontWeight: 600 }}>
            Actualizado: {lastUpdated.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 16 }}>

        {/* ── CANALES column ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Donut card */}
          <div style={{
            flex: 6, minHeight: 0,
            background: T.cardBlue, borderRadius: 20,
            border: `1.5px solid ${T.border}`,
            padding: '20px 28px',
            display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.40)',
          }}>
            {/* Pattern */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.06,
              backgroundImage: 'url(/pattern-crosses-orange.png)', backgroundSize: '70px 70px',
              pointerEvents: 'none',
            }} />
            {/* Deco image */}
            <img src="/Carrito de compras colorido y estilizado.png" alt="" style={{
              position: 'absolute', right: -10, bottom: -10,
              height: '55%', opacity: 0.09, pointerEvents: 'none',
              objectFit: 'contain', transform: 'rotate(-8deg)',
            }} />

            <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.creamDim, flexShrink: 0, marginBottom: 16, position: 'relative' }}>
              Canales · Mix Acumulado
            </p>

            <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 28, alignItems: 'center', position: 'relative' }}>
              {/* Donut */}
              <div style={{ flex: '0 0 45%', height: '100%', position: 'relative' }}>
                <Doughnut data={canalDonutData} options={donutOpts(totalCanal)} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: 12, color: T.creamFaint, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total</span>
                  <span style={{ fontSize: 'clamp(14px,1.6vw,22px)', fontWeight: 900, color: '#fff', lineHeight: 1.2, textAlign: 'center' }}>{fmtFull(totalCanal)}</span>
                </div>
              </div>
              {/* Legend */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {topC.map((item, i) => {
                  const pct = totalCanal > 0 ? (item.venta / totalCanal) * 100 : 0;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: CANAL_COLORS[i], flexShrink: 0, boxShadow: `0 0 8px ${CANAL_COLORS[i]}99` }} />
                      <span style={{ fontSize: 'clamp(13px,1.4vw,18px)', fontWeight: 600, color: '#fff', flex: 1 }}>{item.name}</span>
                      <span style={{ fontSize: 'clamp(12px,1.2vw,16px)', color: T.creamDim, fontFamily: 'monospace' }}>{fmtFull(item.venta)}</span>
                      <span style={{ fontSize: 'clamp(14px,1.4vw,20px)', fontWeight: 700, color: CANAL_COLORS[i], minWidth: 60, textAlign: 'right' }}>{fmtPct(pct)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bar list */}
          <div style={{
            flex: 4, minHeight: 0,
            background: T.cardDark, borderRadius: 16,
            border: `1px solid ${T.borderSub}`,
            padding: '18px 24px',
            display: 'flex', flexDirection: 'column',
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.creamFaint, marginBottom: 16, flexShrink: 0 }}>
              Canales
            </p>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {topC.map((item, i) => {
                const pct = totalCanal > 0 ? (item.venta / totalCanal) * 100 : 0;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: CANAL_COLORS[i], flexShrink: 0, boxShadow: `0 0 8px ${CANAL_COLORS[i]}88` }} />
                        <span style={{ fontSize: 'clamp(14px,1.5vw,20px)', fontWeight: 600, color: '#fff' }}>{item.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
                        <span style={{ fontSize: 'clamp(13px,1.3vw,17px)', color: T.creamDim, fontFamily: 'monospace' }}>{fmtFull(item.venta)}</span>
                        <span style={{ fontSize: 'clamp(15px,1.5vw,21px)', fontWeight: 700, color: CANAL_COLORS[i], minWidth: 58, textAlign: 'right' }}>{fmtPct(pct)}</span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: T.track, borderRadius: 99 }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: CANAL_COLORS[i], boxShadow: `0 0 10px ${CANAL_COLORS[i]}66`, transition: 'width 1.2s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── DEPÓSITOS column ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Donut card */}
          <div style={{
            flex: 6, minHeight: 0,
            background: T.cardBlue, borderRadius: 20,
            border: `1.5px solid rgba(0,83,166,0.55)`,
            padding: '20px 28px',
            display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.40)',
          }}>
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.06,
              backgroundImage: 'url(/pattern-icons-lime.png)', backgroundSize: '70px 70px',
              pointerEvents: 'none',
            }} />
            <img src="/Tarro de crema en dibujo plano.png" alt="" style={{
              position: 'absolute', right: -10, bottom: -10,
              height: '55%', opacity: 0.09, pointerEvents: 'none',
              objectFit: 'contain', transform: 'rotate(-8deg)',
            }} />

            <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.creamDim, flexShrink: 0, marginBottom: 16, position: 'relative' }}>
              Depósitos · Fulfilment
            </p>

            <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 28, alignItems: 'center', position: 'relative' }}>
              <div style={{ flex: '0 0 45%', height: '100%', position: 'relative' }}>
                <Doughnut data={depDonutData} options={donutOpts(totalDep)} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: 12, color: T.creamFaint, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total</span>
                  <span style={{ fontSize: 'clamp(14px,1.6vw,22px)', fontWeight: 900, color: '#fff', lineHeight: 1.2, textAlign: 'center' }}>{fmtFull(totalDep)}</span>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {topD.map((item, i) => {
                  const pct = totalDep > 0 ? (item.venta / totalDep) * 100 : 0;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: DEP_COLORS[i], flexShrink: 0, boxShadow: `0 0 8px ${DEP_COLORS[i]}99` }} />
                      <span style={{ fontSize: 'clamp(13px,1.4vw,18px)', fontWeight: 600, color: '#fff', flex: 1 }}>{item.name}</span>
                      <span style={{ fontSize: 'clamp(12px,1.2vw,16px)', color: T.creamDim, fontFamily: 'monospace' }}>{fmtFull(item.venta)}</span>
                      <span style={{ fontSize: 'clamp(14px,1.4vw,20px)', fontWeight: 700, color: DEP_COLORS[i], minWidth: 60, textAlign: 'right' }}>{fmtPct(pct)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bar list */}
          <div style={{
            flex: 4, minHeight: 0,
            background: T.cardDark, borderRadius: 16,
            border: `1px solid ${T.borderSub}`,
            padding: '18px 24px',
            display: 'flex', flexDirection: 'column',
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.creamFaint, marginBottom: 16, flexShrink: 0 }}>
              Depósitos
            </p>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {topD.map((item, i) => {
                const pct = totalDep > 0 ? (item.venta / totalDep) * 100 : 0;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: DEP_COLORS[i], flexShrink: 0, boxShadow: `0 0 8px ${DEP_COLORS[i]}88` }} />
                        <span style={{ fontSize: 'clamp(14px,1.5vw,20px)', fontWeight: 600, color: '#fff' }}>{item.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
                        <span style={{ fontSize: 'clamp(13px,1.3vw,17px)', color: T.creamDim, fontFamily: 'monospace' }}>{fmtFull(item.venta)}</span>
                        <span style={{ fontSize: 'clamp(15px,1.5vw,21px)', fontWeight: 700, color: DEP_COLORS[i], minWidth: 58, textAlign: 'right' }}>{fmtPct(pct)}</span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: T.track, borderRadius: 99 }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${DEP_COLORS[i]}, ${DEP_COLORS[i]}BB)`, boxShadow: `0 0 10px ${DEP_COLORS[i]}66`, transition: 'width 1.2s ease' }} />
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
