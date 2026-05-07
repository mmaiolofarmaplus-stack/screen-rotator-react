import React, { useEffect, useState } from 'react';
import { ScreenHotSale }  from '../screens/ScreenHotSale';
import { ScreenHotSale2 } from '../screens/ScreenHotSale2';
import { ScreenHotSale3 } from '../screens/ScreenHotSale3';

const SCREENS = [
  { id: 'kpis',      label: 'KPIs',                  component: ScreenHotSale  },
  { id: 'charts',    label: 'Facturación · Canales',  component: ScreenHotSale2 },
  { id: 'insights',  label: 'Evolución · Productos',  component: ScreenHotSale3 },
];

const CYCLE_MS = 10_000;

export const DebugHotSale: React.FC = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % SCREENS.length), CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  const Screen = SCREENS[idx].component;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Screen />

      {/* Dot navigation overlay */}
      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 10, zIndex: 50,
        background: 'rgba(0,0,0,0.45)', borderRadius: 999, padding: '8px 18px',
        backdropFilter: 'blur(8px)',
      }}>
        {SCREENS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIdx(i)}
            title={s.label}
            style={{
              height: 10, width: i === idx ? 32 : 10,
              borderRadius: 999,
              background: i === idx ? '#FF6B00' : 'rgba(255,255,255,0.35)',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
          />
        ))}
        <span style={{
          color: 'rgba(255,255,255,0.65)', fontSize: 11, fontFamily: "'Inter', sans-serif",
          fontWeight: 600, marginLeft: 6, letterSpacing: '0.05em',
        }}>
          {SCREENS[idx].label}
        </span>
      </div>
    </div>
  );
};
