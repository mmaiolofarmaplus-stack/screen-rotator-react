import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DebugLauncher } from './components/debug/DebugLauncher';
import { DebugHub } from './components/debug/DebugHub';
import { HotSaleRotator } from './components/HotSaleRotator';
import { fetchDashboardData, getCachedData } from './services/csvService';
import { fetchHotSaleData, getCachedHotSaleData, HotSaleData } from './services/hotSaleService';
import { DashboardData } from './types';
import { ScreenRanking } from './components/screens/ScreenRanking';
import { ScreenBeneficios } from './components/screens/ScreenBeneficios';
import { ScreenAcumMes } from './components/screens/ScreenAcumMes';
import { ScreenFacturacionHora } from './components/screens/ScreenFacturacionHora';
import { ScreenMetaDiaria } from './components/screens/ScreenMetaDiaria';
import { ScreenTicketPromedio } from './components/screens/ScreenTicketPromedio';
import { ScreenAlertas } from './components/screens/ScreenAlertas';
import { ScreenHotSale } from './components/screens/ScreenHotSale';
import { ScreenHotSale2 } from './components/screens/ScreenHotSale2';
import { ScreenHotSale3 } from './components/screens/ScreenHotSale3';

const VIDEO_MS       = 78_000;
const HS_MS          = 35_000;
const REG_MS         = 110_000;
const REG_REFRESH_MS = 5 * 60_000;

type VideoSlot = { type: 'video'; url: string; ms: number };
type HsSlot    = { type: 'hs';   component: React.FC<{ data: HotSaleData }>;   ms: number };
type RegSlot   = { type: 'reg';  component: React.FC<{ data: DashboardData }>; ms: number };
type Slot = VideoSlot | HsSlot | RegSlot;

const PLAYLIST: Slot[] = [
  { type: 'video', url: '/video1.mp4',               ms: VIDEO_MS },
  { type: 'hs',    component: ScreenHotSale,         ms: HS_MS   },
  { type: 'hs',    component: ScreenHotSale2,        ms: HS_MS   },
  { type: 'hs',    component: ScreenHotSale3,        ms: HS_MS   },
  { type: 'video', url: '/video2.mp4',               ms: VIDEO_MS },
  { type: 'reg',   component: ScreenRanking,         ms: REG_MS  },
  { type: 'reg',   component: ScreenBeneficios,      ms: REG_MS  },
  { type: 'reg',   component: ScreenAcumMes,         ms: REG_MS  },
  { type: 'reg',   component: ScreenFacturacionHora, ms: REG_MS  },
  { type: 'video', url: '/video3.mp4',               ms: VIDEO_MS },
  { type: 'reg',   component: ScreenMetaDiaria,      ms: REG_MS  },
  { type: 'reg',   component: ScreenTicketPromedio,  ms: REG_MS  },
  { type: 'reg',   component: ScreenAlertas,         ms: REG_MS  },
];

function msUntilNextHalfHour(): number {
  const now = new Date();
  const m = now.getMinutes(), s = now.getSeconds(), ms = now.getMilliseconds();
  return (m < 30 ? 30 - m : 90 - m) * 60_000 - s * 1_000 - ms;
}

const params    = new URLSearchParams(window.location.search);
const isDebug   = params.has('debug');
const isScreens = params.has('screens');
const isHotSale = window.location.pathname === '/hot-sale';

const App: React.FC = () => {
  const [data,     setData]     = useState<DashboardData | null>(() => getCachedData());
  const [hsData,   setHsData]   = useState<HotSaleData | null>(() => getCachedHotSaleData());
  const [idx,      setIdx]      = useState(0);
  const [progress, setProgress] = useState(0);

  // Regular data: every 5 min
  useEffect(() => {
    const load = () => fetchDashboardData().then(setData).catch(console.error);
    load();
    const id = setInterval(load, REG_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  // Hot Sale data: at :30 of each hour, then every 60 min
  useEffect(() => {
    const load = () => fetchHotSaleData().then(setHsData).catch(console.error);
    load();
    let intervalId: ReturnType<typeof setInterval>;
    const timeoutId = setTimeout(() => {
      load();
      intervalId = setInterval(load, 60 * 60_000);
    }, msUntilNextHalfHour());
    return () => { clearTimeout(timeoutId); clearInterval(intervalId); };
  }, []);

  // RAF progress bar + screen advance
  const rafRef  = useRef<number>(0);
  const startTs = useRef<number>(0);

  useEffect(() => {
    const duration = PLAYLIST[idx].ms;
    startTs.current = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTs.current) / duration, 1);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setIdx(i => (i + 1) % PLAYLIST.length);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [idx]);

  if (isHotSale) return <HotSaleRotator />;
  if (isDebug)   return <DebugHub />;
  if (isScreens) return <DebugLauncher />;

  if (!data) {
    return (
      <div className="w-screen h-screen bg-[#0b0e14] flex items-center justify-center">
        <p className="text-[#325795] font-mono text-xl uppercase font-bold tracking-widest animate-pulse">
          Cargando datos...
        </p>
      </div>
    );
  }

  const slot = PLAYLIST[idx];

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      <AnimatePresence mode="wait">
        {slot.type === 'video' ? (
          <motion.div
            key={`video-${idx}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <video autoPlay muted loop playsInline className="w-full h-full object-cover">
              <source src={slot.url} type="video/mp4" />
            </video>
          </motion.div>
        ) : slot.type === 'hs' ? (
          <motion.div
            key={`hs-${idx}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            {hsData
              ? React.createElement(slot.component, { data: hsData })
              : (
                <div style={{ width: '100vw', height: '100vh', background: '#09091e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: '#DDED59', fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    Cargando Hot Sale…
                  </p>
                </div>
              )
            }
          </motion.div>
        ) : (
          <motion.div
            key={`reg-${idx}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            {React.createElement(slot.component, { data })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 3, background: 'rgba(255,255,255,0.08)', zIndex: 100,
      }}>
        <div style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: slot.type === 'hs'
            ? 'linear-gradient(90deg, #FC5B31, #DDED59)'
            : 'linear-gradient(90deg, #325795, #4A90D9)',
          transition: 'none',
        }} />
      </div>

      {slot.type === 'reg' && (
        <div className="absolute bottom-3 right-5 text-gray-600 text-sm font-mono pointer-events-none z-50">
          Act. {data.lastUpdated.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
};

export default App;
