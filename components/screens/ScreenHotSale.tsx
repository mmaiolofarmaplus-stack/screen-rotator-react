import React, { useEffect, useState } from 'react';
import { HotSaleData } from '../../services/hotSaleService';

const T = {
  bg:          '#09091e',
  surfaceBlue: 'rgba(0, 53, 166, 0.55)',
  surfaceDark: 'rgba(255,255,255,0.09)',
  border:      'rgba(252, 91, 49, 0.35)',
  borderBlue:  'rgba(0, 83, 166, 0.6)',
  borderSub:   'rgba(255,255,255,0.12)',
  orange:      '#FC5B31',
  orangeDark:  '#D94820',
  lime:        '#DDED59',
  limeDark:    '#B8C82A',
  cyan:        '#3EC7F4',
  blue:        '#0053A6',
  cream:       '#FCECD5',
  creamDim:    'rgba(252,236,213,0.75)',
  creamFaint:  'rgba(252,236,213,0.25)',
};

const fmtM = (v: number): string => {
  if (v >= 1e9) return `$${(v/1e9).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}B`;
  if (v >= 1e6) return `$${(v/1e6).toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
  if (v >= 1e3) return `$${(v/1e3).toLocaleString('es-AR', { maximumFractionDigits: 0 })}K`;
  return `$${new Intl.NumberFormat('es-AR').format(Math.round(v))}`;
};
const fmtN  = (v: number) => new Intl.NumberFormat('es-AR').format(v);
const fmtPt = (v: number) => v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmtUds = (v: number) => v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

interface KpiProps {
  label: string; value: string; metaStr: string; hoyStr: string; pct: number;
  color: string; isHero?: boolean; decoSrc?: string;
}

const KpiCard: React.FC<KpiProps> = ({ label, value, metaStr, hoyStr, pct, color, isHero, decoSrc }) => {
  const [bar, setBar] = useState(0);
  useEffect(() => { const t = setTimeout(() => setBar(Math.min(pct, 100)), 500); return () => clearTimeout(t); }, [pct]);

  const pctColor = pct >= 100 ? T.lime : pct >= 80 ? T.cyan : T.orange;

  return (
    <div style={{
      flex: 1, borderRadius: 20, padding: '28px 32px',
      background: isHero
        ? `linear-gradient(145deg, ${T.orange} 0%, ${T.orangeDark} 100%)`
        : T.surfaceBlue,
      border: isHero ? `1px solid ${T.orangeDark}` : `1.5px solid ${T.border}`,
      boxShadow: isHero
        ? `0 20px 60px -10px rgba(252,91,49,0.50), 0 0 0 1px rgba(252,91,49,0.35)`
        : `0 4px 24px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.08)`,
      display: 'flex', flexDirection: 'column', gap: 12,
      position: 'relative', overflow: 'hidden',
    }}>
      {isHero && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/pattern-crosses-orange.png)',
          backgroundSize: '80px 80px', opacity: 0.12, pointerEvents: 'none',
        }} />
      )}
      {decoSrc && (
        <img src={decoSrc} alt="" style={{
          position: 'absolute', right: -14, bottom: -10,
          height: '65%', opacity: isHero ? 0.18 : 0.10,
          pointerEvents: 'none', objectFit: 'contain',
          transform: 'rotate(-8deg)',
        }} />
      )}

      <p style={{
        fontSize: 14, fontWeight: 700, letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: isHero ? 'rgba(255,255,255,0.75)' : T.creamDim,
        position: 'relative',
      }}>{label}</p>

      <p style={{
        fontFamily: "'Manrope','Inter',sans-serif",
        fontSize: 'clamp(60px, 7.5vw, 120px)',
        fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em',
        color: isHero ? '#FFFFFF' : color,
        position: 'relative',
      }}>{value}</p>

      <p style={{ fontSize: 15, color: isHero ? 'rgba(255,255,255,0.65)' : T.creamDim }}>
        Meta: {metaStr}
        <span style={{ opacity: 0.6 }}> · </span>
        Hoy: <span style={{ color: isHero ? T.lime : color, fontWeight: 700 }}>{hoyStr}</span>
      </p>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <span style={{ fontSize: 14, color: isHero ? 'rgba(255,255,255,0.50)' : T.creamFaint }}>
            % de la meta
          </span>
          <span style={{
            fontFamily: "'Manrope',sans-serif", fontSize: 42, fontWeight: 900, lineHeight: 1,
            color: isHero ? T.lime : pctColor,
          }}>{fmtPt(pct)}%</span>
        </div>
        <div style={{ height: 10, background: 'rgba(255,255,255,0.18)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${bar}%`, borderRadius: 99,
            background: isHero ? T.lime : pctColor,
            boxShadow: `0 0 12px ${isHero ? T.lime : pctColor}99`,
            transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
      </div>
    </div>
  );
};

const HS_START = new Date('2026-05-11');
const HS_END   = new Date('2026-05-18');
const CAMPAIGN_DAYS = 8;

export const ScreenHotSale: React.FC<{ data: HotSaleData }> = ({ data }) => {
  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { meta, acum, daily, hourlyHoy, lastSlotIdx } = data;

  const pctVenta    = meta.venta    > 0 ? (acum.venta    / meta.venta)    * 100 : 0;
  const pctTickets  = meta.tickets  > 0 ? (acum.tickets  / meta.tickets)  * 100 : 0;
  const pctUnidades = meta.unidades > 0 ? (acum.unidades / meta.unidades) * 100 : 0;

  const todayData   = daily.length ? daily[daily.length - 1] : null;
  const todayVenta  = todayData?.venta    ?? 0;
  const todayTix    = todayData?.tickets  ?? 0;
  const todayUds    = todayData?.unidades ?? 0;

  const ticketProm  = acum.tickets  > 0 ? acum.venta    / acum.tickets  : 0;
  const udsTicket   = acum.tickets  > 0 ? acum.unidades / acum.tickets  : 0;

  // Hourly rhythm from today's slots
  const slotsElapsed = lastSlotIdx > 0 ? lastSlotIdx + 1 : 1;
  const todayHourlySum = hourlyHoy.slice(0, lastSlotIdx + 1).reduce((s, v) => s + (v ?? 0), 0);
  const ritmoHoy = slotsElapsed > 0 && todayHourlySum > 0 ? todayHourlySum / slotsElapsed : 0;

  // Campaign projection: extrapolate today to full day, add prev days
  const prevDays       = acum.venta - todayVenta;
  const todayProjected = ritmoHoy > 0 ? ritmoHoy * 24 : todayVenta;
  const proyeccion     = prevDays + todayProjected;
  const proyPct        = meta.venta > 0 ? (proyeccion / meta.venta) * 100 : 0;

  // Days remaining in campaign
  const nowMs          = clock.getTime();
  const diasRestantes  = Math.max(0, Math.ceil((HS_END.getTime() - nowMs) / 86_400_000));
  const diasParaStart  = Math.max(0, Math.ceil((HS_START.getTime() - nowMs) / 86_400_000));
  const enCurso        = nowMs >= HS_START.getTime() && nowMs <= HS_END.getTime() + 86_400_000;
  const pillLabel      = enCurso
    ? `🗓 ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''} restantes`
    : diasParaStart > 0 ? `🗓 Inicia en ${diasParaStart} día${diasParaStart !== 1 ? 's' : ''}` : '🗓 Finalizado';

  const stats: { label: string; value: string; sub: string; accent: string }[] = [
    { label: 'Ticket promedio', value: fmtM(ticketProm),      sub: `hoy ${fmtM(todayTix > 0 ? todayVenta / todayTix : 0)}`,      accent: T.cyan },
    { label: 'Uds / ticket',   value: fmtUds(udsTicket),      sub: `objetivo ${fmtUds(meta.unidades / Math.max(meta.tickets,1))}`, accent: T.lime },
    { label: 'Ritmo hoy',      value: fmtM(ritmoHoy) + '/h',  sub: `objetivo ${fmtM(meta.venta / CAMPAIGN_DAYS / 24)}/h`,         accent: T.orange },
    { label: 'Proyección cierre', value: fmtM(proyeccion),    sub: `${fmtPt(proyPct)}% meta total`,                               accent: proyPct >= 100 ? T.lime : proyPct >= 80 ? T.cyan : T.orange },
  ];

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
        flexShrink: 0, position: 'relative',
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* En vivo pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.lime, borderRadius: 99, padding: '5px 13px 5px 10px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.blue, display: 'inline-block' }} />
            <span style={{ color: T.blue, fontSize: 13, fontWeight: 900, letterSpacing: '0.12em' }}>EN VIVO</span>
          </div>
          {/* Days pill */}
          <div style={{ background: 'rgba(221,237,89,0.15)', border: `1px solid ${T.lime}44`, borderRadius: 99, padding: '5px 13px' }}>
            <span style={{ color: T.lime, fontSize: 13, fontWeight: 700 }}>{pillLabel}</span>
          </div>
        </div>

        {/* Centered logo */}
        <img src="/logo_hotsale.png" alt="Hot Sale 2026" style={{ height: 70, objectFit: 'contain', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }} />

        {/* Clock */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', textAlign: 'right' }}>
          <div>
            <p style={{ fontFamily: "'Manrope',monospace", fontSize: 42, fontWeight: 800, color: T.lime, lineHeight: 1 }}>
              {clock.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p style={{ color: T.creamDim, fontSize: 15, marginTop: 3 }}>
              {clock.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: '2-digit' }).toUpperCase()}
            </p>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0 }}>
        <KpiCard
          label="$ Venta neta" value={fmtM(acum.venta)}
          metaStr={fmtM(meta.venta)} hoyStr={fmtM(todayVenta)}
          pct={pctVenta} color={T.orange} isHero
          decoSrc="/Carrito de compras colorido y estilizado.png"
        />
        <KpiCard
          label="Tickets" value={fmtN(acum.tickets)}
          metaStr={fmtN(meta.tickets)} hoyStr={fmtN(todayTix)}
          pct={pctTickets} color={T.cyan}
        />
        <KpiCard
          label="Unidades" value={fmtN(acum.unidades)}
          metaStr={fmtN(meta.unidades)} hoyStr={fmtN(todayUds)}
          pct={pctUnidades} color={T.lime}
          decoSrc="/Tarro de crema en dibujo plano.png"
        />
      </div>

      {/* Bottom stats row */}
      <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            flex: 1, background: T.surfaceDark, borderRadius: 12, padding: '14px 18px',
            border: `1px solid ${T.borderSub}`,
            borderTop: `3px solid ${s.accent}`,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <p style={{ fontSize: 14, color: T.creamDim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {s.label}
            </p>
            <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1, marginTop: 8 }}>
              {s.value}
            </p>
            <p style={{ fontSize: 16, color: T.creamDim, marginTop: 4 }}>{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
