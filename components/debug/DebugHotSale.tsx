import React, { useEffect, useState } from 'react';
import { fetchHotSaleData, getCachedHotSaleData, HotSaleData } from '../../services/hotSaleService';
import { ScreenHotSale }  from '../screens/ScreenHotSale';
import { ScreenHotSale2 } from '../screens/ScreenHotSale2';
import { ScreenHotSale3 } from '../screens/ScreenHotSale3';

const SCREENS = [
  { id: 'kpis',     label: 'KPIs · Tablero',           component: ScreenHotSale  },
  { id: 'hora',     label: 'Hora · Canales',            component: ScreenHotSale2 },
  { id: 'evol',     label: 'Evolución · Productos',     component: ScreenHotSale3 },
];

const CYCLE_MS   = 12_000;
const REFRESH_MS = 5 * 60 * 1000;

export const DebugHotSale: React.FC = () => {
  const [data, setData] = useState<HotSaleData | null>(() => getCachedHotSaleData());
  const [idx,  setIdx]  = useState(0);

  useEffect(() => {
    const load = () => fetchHotSaleData().then(setData).catch(console.error);
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % SCREENS.length), CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  if (!data) {
    return (
      <div style={{
        width: '100vw', height: '100vh', background: '#09091e',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ color: '#DDED59', fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Cargando Hot Sale…
        </p>
      </div>
    );
  }

  const Screen = SCREENS[idx].component;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Screen data={data} />

      {/* Dot nav */}
      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 10, zIndex: 50,
        background: 'rgba(9,9,30,0.75)', borderRadius: 999, padding: '8px 18px',
        backdropFilter: 'blur(10px)', border: '1px solid rgba(221,237,89,0.2)',
      }}>
        {SCREENS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIdx(i)}
            title={s.label}
            style={{
              height: 10, width: i === idx ? 32 : 10,
              borderRadius: 999,
              background: i === idx ? '#FC5B31' : 'rgba(252,236,213,0.25)',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.3s ease', padding: 0,
            }}
          />
        ))}
        <span style={{
          color: 'rgba(252,236,213,0.6)', fontSize: 11,
          fontFamily: "'Inter',sans-serif", fontWeight: 600,
          marginLeft: 6, letterSpacing: '0.05em',
        }}>
          {SCREENS[idx].label}
        </span>
      </div>

      {/* Update timestamp */}
      <div style={{
        position: 'absolute', top: 8, right: 8, zIndex: 50,
        fontSize: 10, color: 'rgba(252,236,213,0.35)',
        fontFamily: "'Inter',sans-serif",
        background: 'rgba(9,9,30,0.6)', borderRadius: 6, padding: '3px 8px',
      }}>
        Act. {data.lastUpdated.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};
