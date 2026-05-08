import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchHotSaleData, getCachedHotSaleData, HotSaleData } from '../services/hotSaleService';
import { ScreenHotSale  } from './screens/ScreenHotSale';
import { ScreenHotSale2 } from './screens/ScreenHotSale2';
import { ScreenHotSale3 } from './screens/ScreenHotSale3';

const REFRESH_MS = 5 * 60 * 1000;

// Variable dwell times: denser screens get more read time
const SCREENS = [
  { id: 'kpis',     ms: 22_000, component: ScreenHotSale  },
  { id: 'canales',  ms: 18_000, component: ScreenHotSale2 },
  { id: 'top-prod', ms: 18_000, component: ScreenHotSale3 },
];

export const HotSaleRotator: React.FC = () => {
  const [data, setData] = useState<HotSaleData | null>(() => getCachedHotSaleData());
  const [idx, setIdx]   = useState(0);
  const [progress, setProgress] = useState(0); // 0–1

  // Data refresh
  useEffect(() => {
    const load = () => fetchHotSaleData().then(setData).catch(console.error);
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  // Screen advance + progress bar
  const rafRef  = useRef<number>(0);
  const startTs = useRef<number>(0);

  useEffect(() => {
    const duration = SCREENS[idx].ms;
    startTs.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTs.current;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setIdx(i => (i + 1) % SCREENS.length);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [idx]);

  if (!data) {
    return (
      <div style={{
        width: '100vw', height: '100vh', background: '#09091e',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{
          color: '#DDED59', fontFamily: "'Inter',sans-serif",
          fontSize: 18, fontWeight: 700, letterSpacing: '0.2em',
          textTransform: 'uppercase', animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          Cargando Hot Sale…
        </p>
      </div>
    );
  }

  const Screen = SCREENS[idx].component;

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#09091e', overflow: 'hidden', position: 'relative' }}>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <Screen data={data} />
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 3, background: 'rgba(255,255,255,0.08)', zIndex: 100,
      }}>
        <div style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: 'linear-gradient(90deg, #FC5B31, #DDED59)',
          transition: 'none',
        }} />
      </div>

    </div>
  );
};
