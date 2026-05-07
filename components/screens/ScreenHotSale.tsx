import React, { useEffect, useState } from 'react';
import { DAILY, HS_GOAL, CANALES } from './hotSaleData';

const T = {
  bg:          '#F7F8FA',
  surface:     '#FFFFFF',
  orange:      '#FF6B00',
  orangeLight: '#FF8C33',
  orangeDark:  '#D95A00',
  orangePale:  '#FFF0E0',
  blue:        '#003DA5',
  blueLight:   '#1A5BBF',
  bluePale:    '#E8EEFA',
  gray100:     '#F2F4F7',
  gray200:     '#E4E7EC',
  gray400:     '#98A2B3',
  gray600:     '#475467',
  gray900:     '#101828',
  success:     '#12B76A',
  successBg:   '#ECFDF3',
};

const totalVenta    = DAILY.reduce((s, d) => s + d.venta,    0); // 152.690.660
const totalTickets  = DAILY.reduce((s, d) => s + d.tickets,  0); // 5.559
const totalUnidades = DAILY.reduce((s, d) => s + d.unidades, 0); // 7.943

const pctVenta    = (totalVenta    / HS_GOAL.venta)    * 100;
const pctTickets  = (totalTickets  / HS_GOAL.tickets)  * 100;
const pctUnidades = (totalUnidades / HS_GOAL.unidades) * 100;

function fmtM(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}B`;
  if (v >= 1_000_000)     return `$${(v / 1_000_000).toLocaleString('es-AR',     { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
  return `$${new Intl.NumberFormat('es-AR').format(Math.round(v))}`;
}
function fmtN(v: number): string { return new Intl.NumberFormat('es-AR').format(v); }

// ── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  sub: string;
  pct: number;
  accent: string;
  isHero?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, sub, pct, accent, isHero }) => {
  const [bar, setBar] = useState(0);
  useEffect(() => { const t = setTimeout(() => setBar(pct), 400); return () => clearTimeout(t); }, [pct]);

  return (
    <div style={{
      flex: 1,
      background:   isHero ? `linear-gradient(135deg, ${T.orange} 0%, ${T.orangeDark} 100%)` : T.surface,
      borderRadius: 20,
      padding:      '28px 32px',
      border:       isHero ? 'none' : `1px solid ${T.gray200}`,
      boxShadow:    isHero ? `0 24px 48px -8px ${T.orange}44` : '0 4px 16px -4px rgba(16,24,40,0.08)',
      display:      'flex',
      flexDirection:'column' as const,
      gap:           12,
      position:     'relative' as const,
      overflow:     'hidden',
    }}>
      {!isHero && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
          borderRadius: '20px 20px 0 0',
        }} />
      )}

      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase' as const,
        color: isHero ? 'rgba(255,255,255,0.75)' : T.gray600,
        marginTop: isHero ? 0 : 4,
      }}>{label}</p>

      <p style={{
        fontFamily: "'Manrope', 'Inter', sans-serif",
        fontSize: 'clamp(44px, 5.5vw, 88px)',
        fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em',
        color: isHero ? '#FFFFFF' : accent,
      }}>{value}</p>

      <p style={{ fontSize: 13, color: isHero ? 'rgba(255,255,255,0.65)' : T.gray400 }}>{sub}</p>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: isHero ? 'rgba(255,255,255,0.65)' : T.gray400 }}>Meta Hot Sale</span>
          <span style={{
            fontFamily: "'Manrope', sans-serif", fontSize: 28, fontWeight: 800,
            color: isHero ? '#FFFFFF' : accent,
          }}>{pct.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</span>
        </div>
        <div style={{ height: 10, background: isHero ? 'rgba(255,255,255,0.25)' : T.gray200, borderRadius: 999, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(bar, 100)}%`,
            borderRadius: 999,
            background: isHero ? 'rgba(255,255,255,0.9)' : `linear-gradient(90deg, ${accent}, ${accent}CC)`,
            transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────

export const ScreenHotSale: React.FC = () => {
  const [clock, setClock] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(id); }, []);

  const hsStart    = new Date('2026-05-11');
  const today      = new Date('2026-05-07');
  const diasHs     = Math.ceil((hsStart.getTime() - today.getTime()) / 86_400_000);
  const bestDay    = DAILY.reduce((b, d) => d.venta > b.venta ? d : b, DAILY[0]);
  const ticketProm = totalTickets > 0 ? totalVenta / totalTickets : 0;
  const canalLider = CANALES.reduce((b, c) => c.venta > b.venta ? c : b, CANALES[0]);

  return (
    <div style={{
      width: '100vw', height: '100vh', background: T.bg, overflow: 'hidden',
      display: 'flex', flexDirection: 'column', padding: '18px 24px', gap: 14,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: T.surface, borderRadius: 14, padding: '12px 20px',
        boxShadow: '0 1px 6px rgba(16,24,40,0.06)', flexShrink: 0,
        border: `1px solid ${T.gray200}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            background: `linear-gradient(135deg, ${T.orange} 0%, ${T.orangeDark} 100%)`,
            borderRadius: 10, padding: '6px 16px',
          }}>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: 15, color: '#fff', letterSpacing: 2 }}>
              HOT SALE 2026
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: T.successBg, borderRadius: 999, padding: '4px 12px', border: `1px solid ${T.success}40` }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.success, display: 'inline-block', boxShadow: `0 0 8px ${T.success}` }} />
            <span style={{ color: T.success, fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>LIVE</span>
          </div>
          <span style={{ color: T.gray400 }}>·</span>
          <span style={{ color: T.gray600, fontSize: 14, fontWeight: 500 }}>Seguimiento de Ventas Ecommerce</span>
          <span style={{ color: T.gray400 }}>·</span>
          <span style={{ color: T.gray400, fontSize: 13 }}>Datos al JUE 07/05 – 02:59hs</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: "'Manrope', monospace", fontSize: 24, fontWeight: 700, color: T.gray900, lineHeight: 1 }}>
            {clock.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p style={{ color: T.gray400, fontSize: 11, marginTop: 2 }}>
            {clock.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: '2-digit' }).toUpperCase()}
          </p>
        </div>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0 }}>
        <KpiCard
          label="Venta Neta"
          value={fmtM(totalVenta)}
          sub="Acumulado 01–07 Mayo"
          pct={pctVenta}
          accent={T.orange}
          isHero
        />
        <KpiCard
          label="Tickets"
          value={fmtN(totalTickets)}
          sub="Operaciones totales"
          pct={pctTickets}
          accent={T.blue}
        />
        <KpiCard
          label="Unidades"
          value={fmtN(totalUnidades)}
          sub="Unidades vendidas"
          pct={pctUnidades}
          accent={T.orange}
        />
      </div>

      {/* Goal Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${T.blue} 0%, ${T.blueLight} 60%, ${T.orange} 100%)`,
        borderRadius: 14, padding: '16px 28px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Objetivo Hot Sale
          </p>
          <p style={{ fontFamily: "'Manrope', sans-serif", color: '#fff', fontSize: 20, fontWeight: 800, marginTop: 2 }}>
            11 al 18 de Mayo
          </p>
        </div>
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          {[
            { label: 'Meta Venta',     value: fmtM(HS_GOAL.venta)    },
            { label: 'Meta Tickets',   value: fmtN(HS_GOAL.tickets)   },
            { label: 'Meta Unidades',  value: fmtN(HS_GOAL.unidades)  },
          ].map(m => (
            <div key={m.label} style={{ textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, letterSpacing: '0.06em' }}>{m.label}</p>
              <p style={{ fontFamily: "'Manrope', sans-serif", color: '#fff', fontSize: 22, fontWeight: 800 }}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 14, flexShrink: 0 }}>
        {[
          { label: 'Mejor Día',           value: bestDay.short,      sub: fmtM(bestDay.venta)  },
          { label: 'Faltan para Hot Sale', value: `${diasHs} días`,   sub: 'Mayo 11 → 18'       },
          { label: 'Ticket Promedio',      value: fmtM(ticketProm),   sub: 'Media campaña'       },
          { label: 'Canal Líder',          value: canalLider.short,   sub: fmtM(canalLider.venta)},
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: T.surface, borderRadius: 12, padding: '12px 18px',
            boxShadow: '0 1px 4px rgba(16,24,40,0.06)', border: `1px solid ${T.gray200}`,
          }}>
            <p style={{ fontSize: 11, color: T.gray400, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: T.gray900, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: 12, color: T.gray600, marginTop: 3 }}>{s.sub}</p>
          </div>
        ))}
      </div>

    </div>
  );
};
