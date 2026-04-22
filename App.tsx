import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DebugLauncher } from './components/debug/DebugLauncher';
import { fetchDashboardData, getCachedData } from './services/csvService';
import { DashboardData } from './types';
import { ScreenRanking } from './components/screens/ScreenRanking';
import { ScreenMetaDiaria } from './components/screens/ScreenMetaDiaria';
import { ScreenFacturacionHora } from './components/screens/ScreenFacturacionHora';
import { ScreenTicketsHora } from './components/screens/ScreenTicketsHora';
import { ScreenVariacion } from './components/screens/ScreenVariacion';
import { ScreenAlertas } from './components/screens/ScreenAlertas';
import { ScreenBeneficios } from './components/screens/ScreenBeneficios';
import { ROTATOR_CONFIG } from './constants';

const SCREEN_MS  = 3 * 60 * 1000;
const VIDEO_MS   = ROTATOR_CONFIG.videoDuration * ROTATOR_CONFIG.videoLoopsBeforeDashboard * 1000;
const REFRESH_MS = 5 * 60 * 1000;

const SCREENS: { id: string; component: React.FC<{ data: DashboardData }> }[] = [
  { id: 'ranking',          component: ScreenRanking },
  { id: 'meta-diaria',      component: ScreenMetaDiaria },
  { id: 'facturacion-hora', component: ScreenFacturacionHora },
  { id: 'tickets-hora',     component: ScreenTicketsHora },
  { id: 'variacion',        component: ScreenVariacion },
  { id: 'alertas',          component: ScreenAlertas },
  { id: 'beneficios',       component: ScreenBeneficios },
];

// Playlist: screen → video → screen → video → ... repeat
const VIDEO_SLOT = { type: 'video' as const, index: -1 };
const PLAYLIST = SCREENS.flatMap((_, i) => [
  { type: 'screen' as const, index: i },
  VIDEO_SLOT,
]);

const isDebug = new URLSearchParams(window.location.search).has('debug');

const App: React.FC = () => {
  const [data, setData]         = useState<DashboardData | null>(() => getCachedData());
  const [slotIndex, setSlotIndex] = useState(0);

  // Data fetch on mount + refresh every 30 min
  useEffect(() => {
    const load = () => fetchDashboardData().then(setData).catch(console.error);
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  // Rotation timer
  useEffect(() => {
    const slot     = PLAYLIST[slotIndex];
    const duration = slot.type === 'video' ? VIDEO_MS : SCREEN_MS;
    const id = setTimeout(() => setSlotIndex(i => (i + 1) % PLAYLIST.length), duration);
    return () => clearTimeout(id);
  }, [slotIndex]);

  if (isDebug) return <DebugLauncher />;

  if (!data) {
    return (
      <div className="w-screen h-screen bg-[#0b0e14] flex items-center justify-center">
        <p className="text-[#325795] font-mono text-xl uppercase font-bold tracking-widest animate-pulse">
          Cargando datos...
        </p>
      </div>
    );
  }

  const slot = PLAYLIST[slotIndex];

  return (
    <div className="w-screen h-screen bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        {slot.type === 'video' ? (
          <motion.div
            key="video"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <video autoPlay muted loop playsInline className="w-full h-full object-cover">
              <source src={ROTATOR_CONFIG.videoUrl} type="video/mp4" />
            </video>
          </motion.div>
        ) : (
          <motion.div
            key={`screen-${slotIndex}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            {React.createElement(SCREENS[slot.index].component, { data })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
