import React, { useEffect, useState } from 'react';
import { HotSaleData } from '../../services/hotSaleService';

const T = {
  bg:          '#09091e',
  surfaceBlue: 'rgba(0, 53, 166, 0.28)',
  surfaceDark: 'rgba(255,255,255,0.04)',
  border:      'rgba(252, 91, 49, 0.25)',
  borderBlue:  'rgba(0, 83, 166, 0.5)',
  borderSub:   'rgba(255,255,255,0.07)',
  orange:      '#FC5B31',
  orangeDark:  '#D94820',
  lime:        '#DDED59',
  limeDark:    '#B8C82A',
  cyan:        '#3EC7F4',
  blue:        '#0053A6',
  cream:       '#FCECD5',
  creamDim:    'rgba(252,236,213,0.65)',
  creamFaint:  'rgba(252,236,213,0.18)',
};

const fmtM = (v: number): string => {
  if (v >= 1e9) return `$${(v/1e9).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}B`;
  if (v >= 1e6) return `$${(v/1e6).toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
  if (v >= 1e3) return `$${(v/1e3).toLocaleString('es-AR', { maximumFractionDigits: 0 })}K`;
  return `$${new Intl.NumberFormat('es-AR').format(Math.round(v))}`;
};
const fmtN  = (v: number) => new Intl.NumberFormat('es-AR').format(v);
const fmtPt = (v: number) => v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

interface KpiProps {
  label: string; value: string; sub: string; pct: number;
  color: string; isHero?: boolean; decoSrc?: string;
}

const KpiCard: React.FC<KpiProps> = ({ label, value, sub, pct, color, isHero, decoSrc }) => {
  const [bar, setBar] = useState(0);
  useEffect(() => { const t = setTimeout(() => setBar(Math.min(pct, 100)), 500); return () => clearTimeout(t); }, [pct]);

  const pctColor = pct >= 100 ? T.lime : pct >= 80 ? T.cyan : T.orange;

  return (
    <div style={{
      flex: 1, borderRadius: 20, padding: '26px 30px',
      background: isHero
        ? `linear-gradient(145deg, ${T.orange} 0%, ${T.orangeDark} 100%)`
        : T.surfaceBlue,
      border: isHero ? 'none' : `1px solid ${T.border}`,
      boxShadow: isHero
        ? `0 20px 60px -10px rgba(252,91,49,0.45), 0 0 0 1px rgba(252,91,49,0.3)`
        : '0 4px 24px rgba(0,0,0,0.35)',
      display: 'flex', flexDirection: 'column', gap: 10,
      position: 'relative', overflow: 'hidden',
    }}>
      {isHero && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/pattern-crosses-orange.png)',
          backgroundSize: '80px 80px', opacity: 0.1, pointerEvents: 'none',
        }} />
      )}
      {decoSrc && (
        <img src={decoSrc} alt="" style={{
          position: 'absolute', right: -14, bottom: -10,
          height: '65%', opacity: isHero ? 0.18 : 0.12,
          pointerEvents: 'none', objectFit: 'contain',
          transform: 'rotate(-8deg)',
        }} />
      )}

      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: isHero ? 'rgba(255,255,255,0.65)' : T.creamDim,
        position: 'relative',
      }}>{label}</p>

      <p style={{
        fontFamily: "'Manrope','Inter',sans-serif",
        fontSize: 'clamp(44px, 6vw, 96px)',
        fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em',
        color: isHero ? '#FFFFFF' : color,
        position: 'relative',
      }}>{value}</p>

      <p style={{ fontSize: 13, color: isHero ? 'rgba(255,255,255,0.55)' : T.creamDim }}>
        {sub}
      </p>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: isHero ? 'rgba(255,255,255,0.45)' : T.creamFaint }}>
            vs meta Hot Sale
          </span>
          <span style={{
            fontFamily: "'Manrope',sans-serif", fontSize: 30, fontWeight: 900, lineHeight: 1,
            color: isHero ? T.lime : pctColor,
          }}>{fmtPt(pct)}%</span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${bar}%`, borderRadius: 99,
            background: isHero ? T.lime : pctColor,
            boxShadow: `0 0 10px ${isHero ? T.lime : pctColor}88`,
            transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
      </div>
    </div>
  );
};

export const ScreenHotSale: React.FC<{ data: HotSaleData }> = ({ data }) => {
  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { meta, acum, daily, canales } = data;

  const pctVenta    = meta.venta    > 0 ? (acum.venta    / meta.venta)    * 100 : 0;
  const pctTickets  = meta.tickets  > 0 ? (acum.tickets  / meta.tickets)  * 100 : 0;
  const pctUnidades = meta.unidades > 0 ? (acum.unidades / meta.unidades) * 100 : 0;

  const hsStart    = new Date('2026-05-11');
  const diasHs     = Math.max(0, Math.ceil((hsStart.getTime() - clock.getTime()) / 86_400_000));
  const bestDay    = daily.length ? daily.reduce((b, d) => d.venta > b.venta ? d : b, daily[0]) : null;
  const ticketProm = acum.tickets > 0 ? acum.venta / acum.tickets : 0;
  const canalLider = canales.length > 0 ? canales[0] : null;
  const lastDate   = daily.length ? daily[daily.length - 1].fecha : '–';

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
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: T.lime, borderRadius: 99, padding: '3px 10px 3px 7px',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: T.blue,
              display: 'inline-block',
            }} />
            <span style={{ color: T.blue, fontSize: 10, fontWeight: 900, letterSpacing: '0.12em' }}>LIVE</span>
          </div>
          <span style={{ color: T.creamDim, fontSize: 14 }}>Seguimiento Ecommerce</span>
          <span style={{ color: T.creamFaint }}>·</span>
          <span style={{ color: 'rgba(252,236,213,0.4)', fontSize: 12 }}>Datos al {lastDate}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{
            fontFamily: "'Manrope',monospace", fontSize: 28, fontWeight: 800,
            color: T.lime, lineHeight: 1,
          }}>
            {clock.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p style={{ color: T.creamDim, fontSize: 11, marginTop: 2 }}>
            {clock.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: '2-digit' }).toUpperCase()}
          </p>
        </div>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 12, flex: 1, minHeight: 0 }}>
        <KpiCard
          label="Venta Neta" value={fmtM(acum.venta)}
          sub={`de ${fmtM(meta.venta)} meta campaña`}
          pct={pctVenta} color={T.orange} isHero
          decoSrc="/Carrito de compras colorido y estilizado.png"
        />
        <KpiCard
          label="Tickets" value={fmtN(acum.tickets)}
          sub={`de ${fmtN(meta.tickets)} meta campaña`}
          pct={pctTickets} color={T.cyan}
        />
        <KpiCard
          label="Unidades" value={fmtN(acum.unidades)}
          sub={`de ${fmtN(meta.unidades)} meta campaña`}
          pct={pctUnidades} color={T.lime}
          decoSrc="/Tarro de crema en dibujo plano.png"
        />
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>

        {/* Countdown */}
        <div style={{
          flex: '0 0 260px',
          background: T.surfaceBlue,
          borderRadius: 14, padding: '14px 18px',
          border: `1.5px solid ${T.lime}44`,
          backgroundImage: 'url(/pattern-crosses-blue.png)',
          backgroundSize: '60px 60px',
          boxShadow: '0 4px 24px rgba(0,53,166,0.4)',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <p style={{ fontSize: 10, color: T.lime, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Hot Sale 2026
          </p>
          <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 20, fontWeight: 900, color: '#fff' }}>
            11 – 18 Mayo
          </p>
          {diasHs > 0 ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
              <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 52, fontWeight: 900, color: T.lime, lineHeight: 1 }}>
                {diasHs}
              </span>
              <span style={{ color: T.creamDim, fontSize: 13 }}>días para empezar</span>
            </div>
          ) : (
            <div style={{ background: T.lime, borderRadius: 8, padding: '6px 14px', marginTop: 4, width: 'fit-content' }}>
              <span style={{ color: T.blue, fontWeight: 900, fontSize: 14, letterSpacing: '0.05em' }}>¡ EN CURSO !</span>
            </div>
          )}
        </div>

        {/* Stats */}
        {([
          { label: 'Ticket Promedio',  value: fmtM(ticketProm),         sub: 'media campaña' },
          { label: 'Canal Líder',      value: canalLider?.short ?? '–',  sub: canalLider ? fmtM(canalLider.venta) : '' },
          { label: 'Mejor Día',        value: bestDay?.short ?? '–',     sub: bestDay ? fmtM(bestDay.venta) : '' },
          { label: 'Días con datos',   value: String(daily.length),      sub: `inicio: ${daily[0]?.fecha ?? '–'}` },
        ] as { label: string; value: string; sub: string }[]).map(s => (
          <div key={s.label} style={{
            flex: 1, background: T.surfaceDark, borderRadius: 12, padding: '12px 16px',
            border: `1px solid ${T.borderSub}`,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <p style={{ fontSize: 10, color: T.creamDim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {s.label}
            </p>
            <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1, marginTop: 8 }}>
              {s.value}
            </p>
            <p style={{ fontSize: 12, color: T.creamDim, marginTop: 4 }}>{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
