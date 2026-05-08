import React, { useEffect, useState } from 'react';
import { HotSaleData } from '../../services/hotSaleService';

const T = {
  bg:         '#09091e',
  cardBlue:   'rgba(0,53,166,0.50)',
  cardDark:   'rgba(14,20,48,0.85)',
  border:     'rgba(252,91,49,0.35)',
  borderBlue: 'rgba(0,83,166,0.60)',
  borderSub:  'rgba(255,255,255,0.10)',
  orange:     '#FC5B31',
  lime:       '#DDED59',
  cyan:       '#3EC7F4',
  blue:       '#0053A6',
  cream:      '#FCECD5',
  creamDim:   'rgba(252,236,213,0.75)',
  creamFaint: 'rgba(252,236,213,0.22)',
  track:      'rgba(255,255,255,0.14)',
};

const PROD_COLORS = [
  '#FF6B00', '#FF8C33', '#FFAA66',
  '#0053A6', '#1A5BBF',
  'rgba(180,178,169,0.65)', 'rgba(180,178,169,0.60)',
  'rgba(180,178,169,0.55)', 'rgba(180,178,169,0.50)',
  'rgba(180,178,169,0.45)',
];

const ROW_BG = [
  'rgba(252,91,49,0.12)', 'rgba(252,91,49,0.09)', 'rgba(252,91,49,0.06)',
  'rgba(0,83,166,0.15)',  'rgba(0,83,166,0.10)',
];

const fmtFull = (v: number) =>
  '$ ' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(v));

const fmtNum = (v: number) =>
  new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(v));

const fmtPct = (v: number) =>
  v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';

export const ScreenHotSale3: React.FC<{ data: HotSaleData }> = ({ data }) => {
  const { products, lastUpdated } = data;
  const top = products.slice(0, 10);
  const maxVenta   = top[0]?.venta ?? 1;
  const totalVenta = top.reduce((s, p) => s + p.venta, 0);

  const [logoPulse, setLogoPulse] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setLogoPulse(true);
      setTimeout(() => setLogoPulse(false), 600);
    }, 2200);
    return () => clearInterval(id);
  }, []);

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
            <span style={{ color: T.orange, fontSize: 16, fontWeight: 800, letterSpacing: '0.06em' }}>TOP PRODUCTOS</span>
          </div>
          <div style={{ background: `${T.blue}44`, border: `1px solid ${T.cyan}44`, borderRadius: 10, padding: '6px 16px' }}>
            <span style={{ color: T.cyan, fontSize: 16, fontWeight: 800, letterSpacing: '0.06em' }}>HOT SALE 2026</span>
          </div>
        </div>

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

      {/* Main */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 12 }}>

        {/* Left: product table */}
        <div style={{
          flex: 1, background: T.cardBlue, borderRadius: 22,
          border: `1.5px solid ${T.border}`,
          padding: '20px 24px',
          display: 'flex', flexDirection: 'column',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.07, backgroundImage: 'url(/pattern-crosses-orange.png)', backgroundSize: '70px 70px', pointerEvents: 'none' }} />
          <img src="/Carrito de compras colorido y estilizado.png" alt="" style={{ position: 'absolute', right: -8, bottom: -8, height: '40%', opacity: 0.09, pointerEvents: 'none', objectFit: 'contain', transform: 'rotate(-8deg)' }} />

          <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: T.creamDim, marginBottom: 12, flexShrink: 0, position: 'relative' }}>
            Top productos · Venta neta
          </p>

          {/* Column headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '34px 1fr 90px 90px 1fr',
            gap: '0 12px', padding: '6px 8px',
            borderBottom: `1px solid ${T.borderSub}`,
            flexShrink: 0, position: 'relative',
          }}>
            {['#', 'PRODUCTO', 'TKT', 'UDS', '$ NETO'].map((h, i) => (
              <span key={i} style={{
                fontSize: 13, fontWeight: 700, letterSpacing: '0.10em',
                color: T.creamFaint, textAlign: i >= 2 ? 'right' : 'left',
              }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', position: 'relative' }}>
            {top.map((prod, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '34px 1fr 90px 90px 1fr',
                gap: '0 12px', padding: '5px 8px',
                borderRadius: 8, background: ROW_BG[i] ?? 'transparent',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: 'clamp(16px,1.7vw,22px)', fontWeight: 900, color: PROD_COLORS[i] }}>{i + 1}</span>
                <span style={{ fontSize: 'clamp(14px,1.4vw,19px)', fontWeight: 600, color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {prod.name}
                </span>
                <span style={{ fontSize: 'clamp(14px,1.4vw,19px)', fontWeight: 700, color: T.creamDim, textAlign: 'right' }}>
                  {fmtNum(prod.tickets)}
                </span>
                <span style={{ fontSize: 'clamp(14px,1.4vw,19px)', fontWeight: 700, color: T.creamDim, textAlign: 'right' }}>
                  {fmtNum(prod.unidades)}
                </span>
                <span style={{ fontSize: 'clamp(15px,1.6vw,22px)', fontWeight: 800, color: PROD_COLORS[i], textAlign: 'right', fontFamily: "'Manrope',monospace" }}>
                  {fmtFull(prod.venta)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: contribution bars */}
        <div style={{
          flex: 1, background: T.cardDark, borderRadius: 22,
          border: `1px solid ${T.borderSub}`,
          padding: '20px 24px',
          display: 'flex', flexDirection: 'column',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.30)',
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'url(/pattern-icons-lime.png)', backgroundSize: '70px 70px', pointerEvents: 'none' }} />
          <img src="/Tarro de crema en dibujo plano.png" alt="" style={{ position: 'absolute', right: -8, bottom: -8, height: '40%', opacity: 0.09, pointerEvents: 'none', objectFit: 'contain' }} />

          <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: T.creamFaint, marginBottom: 12, flexShrink: 0, position: 'relative' }}>
            % Contribución · Venta neta
          </p>

          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', position: 'relative' }}>
            {top.map((prod, i) => {
              const pct = totalVenta > 0 ? (prod.venta / totalVenta) * 100 : 0;
              const barW = maxVenta > 0 ? (prod.venta / maxVenta) * 100 : 0;
              const color = PROD_COLORS[i];
              const shortName = prod.name.length > 26 ? prod.name.slice(0, 25) + '…' : prod.name;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{
                    width: 'clamp(100px,9vw,145px)', flexShrink: 0,
                    fontSize: 'clamp(13px,1.3vw,17px)', fontWeight: 600, color: T.creamDim,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{shortName}</span>
                  <div style={{ flex: 1, height: 'clamp(22px,2.6vh,34px)', background: T.track, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      width: `${barW}%`, height: '100%', borderRadius: 99,
                      background: color,
                      boxShadow: `0 0 10px ${color}66`,
                      transition: 'width 1.3s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 12,
                    }}>
                      <span style={{ fontSize: 'clamp(12px,1.2vw,16px)', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                        {fmtPct(pct)}
                      </span>
                    </div>
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
