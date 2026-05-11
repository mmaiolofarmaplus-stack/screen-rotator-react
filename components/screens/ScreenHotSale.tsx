import React, { useEffect, useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
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
  gridLine:    'rgba(252,236,213,0.06)',
  tickColor:   'rgba(252,236,213,0.55)',
};

const fmtM = (v: number): string =>
  `$ ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(v))}`;
const fmtN  = (v: number) => new Intl.NumberFormat('es-AR').format(v);
const fmtPt = (v: number) => v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

interface KpiProps {
  label: string; value: string; metaStr: string; hoyStr: string; pct: number;
  color: string; isHero?: boolean; decoSrc?: string;
}

const KpiCard: React.FC<KpiProps> = ({ label, value, metaStr, hoyStr, pct, color, isHero, decoSrc }) => {
  const [bar, setBar] = useState(0);
  useEffect(() => { const t = setTimeout(() => setBar(Math.min(pct, 100)), 500); return () => clearTimeout(t); }, [pct]);

  const pctColor = pct >= 100 ? T.lime : pct >= 80 ? T.cyan : T.orange;
  const accentColor = isHero ? T.lime : pctColor;

  return (
    <div style={{
      flex: 1, borderRadius: 20, padding: '16px 22px',
      background: isHero
        ? `linear-gradient(145deg, ${T.orange} 0%, ${T.orangeDark} 100%)`
        : T.surfaceBlue,
      border: isHero ? `1px solid ${T.orangeDark}` : `1.5px solid ${T.border}`,
      boxShadow: isHero
        ? `0 20px 60px -10px rgba(252,91,49,0.50), 0 0 0 1px rgba(252,91,49,0.35)`
        : `0 4px 24px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.08)`,
      display: 'flex', flexDirection: 'column', gap: 10,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: isHero ? 'url(/pattern-crosses-orange.png)' : 'url(/pattern-crosses-blue.png)',
        backgroundSize: '80px 80px',
        opacity: isHero ? 0.12 : 0.05,
        pointerEvents: 'none',
      }} />
      {decoSrc && (
        <img src={decoSrc} alt="" style={{
          position: 'absolute', right: -10, bottom: -8,
          height: '70%', opacity: isHero ? 0.13 : 0.07,
          pointerEvents: 'none', objectFit: 'contain',
          transform: 'rotate(-8deg)',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <p style={{
          fontSize: 15, fontWeight: 700, letterSpacing: '0.13em',
          textTransform: 'uppercase',
          color: isHero ? 'rgba(255,255,255,0.70)' : T.creamDim,
        }}>{label}</p>
        <span style={{
          fontFamily: "'Manrope',sans-serif", fontSize: 34, fontWeight: 900, lineHeight: 1,
          color: accentColor,
          textShadow: `0 0 20px ${accentColor}88`,
        }}>{fmtPt(pct)}%</span>
      </div>

      <p style={{
        fontFamily: "'Manrope','Inter',sans-serif",
        fontSize: 'clamp(44px, 4.8vw, 76px)',
        fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em',
        color: isHero ? '#FFFFFF' : color,
        position: 'relative',
      }}>{value}</p>

      <p style={{ fontSize: 16, color: isHero ? 'rgba(255,255,255,0.60)' : T.creamDim, position: 'relative' }}>
        Meta: {metaStr}
        <span style={{ opacity: 0.55 }}> · </span>
        Acum: <span style={{ color: isHero ? T.lime : color, fontWeight: 700 }}>{hoyStr}</span>
      </p>

      <div style={{ height: 10, background: 'rgba(255,255,255,0.18)', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          height: '100%', width: `${bar}%`, borderRadius: 99,
          background: accentColor,
          boxShadow: `0 0 14px ${accentColor}BB`,
          transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
};

const HS_START = new Date('2026-05-11');
const HS_END   = new Date('2026-05-18');

const formatYAxis = (v: number) =>
  v === 0 ? '$0' : `$${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(v)}`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(9,9,30,0.97)', border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 10, padding: '10px 16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
    }}>
      <p style={{ color: T.tickColor, fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => p.value !== null && (
        <p key={p.dataKey} style={{ color: p.color, fontSize: 16, fontWeight: 800 }}>
          Hoy: {fmtM(p.value)}
        </p>
      ))}
    </div>
  );
};


export const ScreenHotSale: React.FC<{ data: HotSaleData }> = ({ data }) => {
  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { meta, acum, metaHoy, daily, hourlyHoy, hourlyLabels, lastSlotIdx } = data;

  const pctVenta    = meta.venta    > 0 ? (acum.venta    / meta.venta)    * 100 : 0;
  const pctTickets  = meta.tickets  > 0 ? (acum.tickets  / meta.tickets)  * 100 : 0;
  const pctUnidades = meta.unidades > 0 ? (acum.unidades / meta.unidades) * 100 : 0;

  const todayData  = daily.length ? daily[daily.length - 1] : null;
  const todayVenta = todayData?.venta    ?? 0;
  const pctMetaHoy = metaHoy > 0 ? (todayVenta / metaHoy) * 100 : 0;
  const metaHoyColor = pctMetaHoy >= 100 ? '#01B693' : pctMetaHoy >= 80 ? '#f59e0b' : T.orange;
  const todayTix   = todayData?.tickets  ?? 0;
  const todayUds   = todayData?.unidades ?? 0;

  const nowMs         = clock.getTime();
  const diasRestantes = Math.max(0, Math.ceil((HS_END.getTime() - nowMs) / 86_400_000));
  const diasParaStart = Math.max(0, Math.ceil((HS_START.getTime() - nowMs) / 86_400_000));
  const enCurso       = nowMs >= HS_START.getTime() && nowMs <= HS_END.getTime() + 86_400_000;
  const pillLabel     = enCurso
    ? `🗓 ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''} restantes`
    : diasParaStart > 0 ? `🗓 Inicia en ${diasParaStart} día${diasParaStart !== 1 ? 's' : ''}` : '🗓 Finalizado';

  const slots = hourlyLabels.length;
  const startSlot = slots === 48 ? 14 : 7;

  // Current slot from the live clock — cap chart so future hours never appear
  const currentSlot = slots === 48
    ? clock.getHours() * 2 + (clock.getMinutes() >= 30 ? 1 : 0)
    : clock.getHours();

  const chartData = useMemo(() => {
    const endSlot = Math.min(lastSlotIdx + 1, currentSlot + 1, hourlyLabels.length);
    return hourlyLabels.slice(startSlot, endSlot).map((label, i) => {
      const slotIdx = startSlot + i;
      const hoy = hourlyHoy[slotIdx];
      return {
        time: label,
        hoy:  hoy !== null && hoy > 0 ? hoy : null,
      };
    });
  }, [hourlyHoy, hourlyLabels, startSlot, lastSlotIdx, currentSlot]);

  const currentTimeLabel = hourlyLabels[Math.min(lastSlotIdx, currentSlot)] ?? null;

  return (
    <div style={{
      width: '100vw', height: '100vh', background: T.bg, overflow: 'hidden',
      display: 'flex', flexDirection: 'column', padding: '14px 20px', gap: 12,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0, 16, 50, 0.90)', borderRadius: 16, padding: '10px 22px',
        border: `1px solid ${T.borderBlue}`, borderBottom: `3px solid ${T.lime}`,
        flexShrink: 0, position: 'relative', overflow: 'hidden',
      }}>
        {/* Header pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'url(/pattern-crosses-blue.png)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.lime, borderRadius: 99, padding: '6px 16px 6px 12px' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: T.blue, display: 'inline-block' }} />
            <span style={{ color: T.blue, fontSize: 15, fontWeight: 900, letterSpacing: '0.12em' }}>EN VIVO</span>
          </div>
          <div style={{ background: 'rgba(221,237,89,0.15)', border: `1px solid ${T.lime}44`, borderRadius: 99, padding: '6px 16px' }}>
            <span style={{ color: T.lime, fontSize: 15, fontWeight: 700 }}>{pillLabel}</span>
          </div>
        </div>

        <img src="/logo_hotsale.png" alt="Hot Sale 2026" style={{ height: 70, objectFit: 'contain', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }} />

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', textAlign: 'right', position: 'relative' }}>
          <div>
            <p style={{ fontFamily: "'Manrope',monospace", fontSize: 48, fontWeight: 800, color: T.lime, lineHeight: 1 }}>
              {clock.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p style={{ color: T.creamDim, fontSize: 18, marginTop: 4 }}>
              {clock.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: '2-digit' }).toUpperCase()}
            </p>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 14, flex: 28, minHeight: 0 }}>
        <KpiCard
          label="$ Venta neta" value={fmtM(todayVenta)}
          metaStr={fmtM(meta.venta)} hoyStr={fmtM(acum.venta)}
          pct={pctVenta} color={T.orange} isHero
          decoSrc="/Carrito de compras colorido y estilizado.png"
        />
        <KpiCard
          label="Tickets" value={fmtN(todayTix)}
          metaStr={fmtN(meta.tickets)} hoyStr={fmtN(acum.tickets)}
          pct={pctTickets} color={T.cyan}
        />
        <KpiCard
          label="Unidades" value={fmtN(todayUds)}
          metaStr={fmtN(meta.unidades)} hoyStr={fmtN(acum.unidades)}
          pct={pctUnidades} color={T.lime}
          decoSrc="/Tarro de crema en dibujo plano.png"
        />
      </div>

      {/* Hourly chart */}
      <div style={{
        flex: 72, minHeight: 0, background: 'rgba(0,53,166,0.28)', borderRadius: 22,
        padding: '16px 12px 12px 4px', border: `1.5px solid ${T.border}`,
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
      }}>
        {/* Chart pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'url(/pattern-crosses-orange.png)', backgroundSize: '70px 70px', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, marginBottom: 8, paddingLeft: 16, paddingRight: 8, position: 'relative' }}>
          <p style={{ fontSize: 15, color: T.creamDim, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Venta por hora · Hoy {clock.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: '2-digit' }).toUpperCase()}
          </p>
          {metaHoy > 0 && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, background: 'rgba(0,0,0,0.30)', borderRadius: 12, padding: '6px 18px', border: `1px solid ${metaHoyColor}44` }}>
              <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 34, fontWeight: 900, color: metaHoyColor, lineHeight: 1, textShadow: `0 0 18px ${metaHoyColor}88` }}>
                {fmtPt(pctMetaHoy)}%
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: metaHoyColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>meta hoy</span>
                <span style={{ fontSize: 12, color: T.creamDim }}>{fmtM(metaHoy)}</span>
              </div>
            </div>
          )}
        </div>
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 24, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.orange} stopOpacity={0.65} />
                  <stop offset="95%" stopColor={T.orange} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke={T.gridLine} vertical={false} />

              <XAxis
                dataKey="time"
                stroke="transparent"
                tick={{ fill: T.tickColor, fontSize: 15, fontWeight: 700 }}
                axisLine={false} tickLine={false}
                dy={10}
              />
              <YAxis
                stroke="transparent"
                tick={{ fill: T.tickColor, fontSize: 13, fontWeight: 600 }}
                tickFormatter={formatYAxis}
                axisLine={false} tickLine={false}
                width={130}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Vertical reference line at current hour */}
              {currentTimeLabel && (
                <ReferenceLine
                  x={currentTimeLabel}
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth={1.5}
                  strokeDasharray="0"
                />
              )}

              {/* Today — per-hour wave */}
              <Area
                type="monotone"
                dataKey="hoy"
                stroke={T.orange}
                strokeWidth={3}
                fill="url(#gradSales)"
                fillOpacity={1}
                connectNulls={false}
                isAnimationActive={true}
                animationDuration={900}
                animationEasing="ease-out"
                name="hoy"
                dot={false}
                activeDot={{ r: 6, fill: T.orange, stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
