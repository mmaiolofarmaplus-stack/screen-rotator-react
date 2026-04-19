import React, { useEffect, useState, useCallback, useRef } from 'react';
import { DebugLauncher } from './components/debug/DebugLauncher';
import { fetchDashboardData, getCachedData } from './services/csvService';
import { playNotificationSound, playCelebrationSound, initAudio } from './services/soundService';
import { DashboardData } from './types';
import { KpiCard } from './components/KpiCard';
import { TopBranchCard } from './components/TopBranchCard';
import { BranchBarChart, EvolutionLineChart } from './components/Charts';
import { COLORS, ROTATOR_CONFIG } from './constants';
import { formatMillions, formatPct } from './utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';



const Dashboard: React.FC<{ phase: 'video' | 'dashboard' }> = ({ phase }) => {
  const [data, setData] = useState<DashboardData | null>(() => getCachedData());
  const [loading, setLoading] = useState<boolean>(() => getCachedData() === null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Celebration & Sound State
  const [celebrationMode, setCelebrationMode] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [isHotZone, setIsHotZone] = useState<boolean>(false);
  const hasCelebratedRef = useRef<boolean>(false);
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Track previous sales to detect updates
  const prevTotalSalesRef = useRef<number>(0);
  
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const dashboardData = await fetchDashboardData();
      
      // --- REMOTE RELOAD CHECK (PERSISTENT) ---
      const currentVersion = dashboardData.systemVersion;
      const localVersion = localStorage.getItem('FARM_DASH_VERSION');

      if (currentVersion && currentVersion !== localVersion) {
          console.log(`🔄 Reload Command Detected! Remote: ${currentVersion} vs Local: ${localVersion}`);
          // Update local storage so we don't reload again until it changes
          localStorage.setItem('FARM_DASH_VERSION', currentVersion);
          // Force reload
          window.location.reload();
          return; 
      }

      // Check for Sales Increase (Data Update Sound)
      if (prevTotalSalesRef.current > 0 && dashboardData.totalNeto > prevTotalSalesRef.current) {
          console.log("💰 Sales increased!", { prev: prevTotalSalesRef.current, new: dashboardData.totalNeto, audioEnabled });
          if (audioEnabled) {
              playNotificationSound();
          }
      }
      prevTotalSalesRef.current = dashboardData.totalNeto;

      setData(dashboardData);
      setLastRefresh(new Date());
      setError(null);
      
      // Check for Daily Target Celebration
      if (dashboardData.totalMetaAcumM1 > 0 && dashboardData.totalNeto >= dashboardData.totalMetaAcumM1) {
        if (!hasCelebratedRef.current) {
          console.log("🎉 DAILY TARGET MET! CELEBRATING!");
          hasCelebratedRef.current = true; // Mark as celebrated so we don't spam it
          setCelebrationMode(true);
          
          if (audioEnabled) {
             playCelebrationSound();
          }
          
          // Turn off celebration visual after 15 seconds
          setTimeout(() => {
            setCelebrationMode(false);
          }, 15000);
        }
      } else {
        // If sales drop below target (unlikely but possible if data changes), reset celebration flag
        hasCelebratedRef.current = false;
      }

    } catch (err) {
      console.error('Error in loadData:', err);
      setError('⚠️ Error de conexión. Reintentando...');
    } finally {
      setLoading(false);
    }
  }, [audioEnabled]);

  // Initial load and scheduling
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchAndSchedule = async () => {
      await loadData();
      
      const now = new Date();
      const minutes = now.getMinutes();
      
      // "Hot Zone": Between minute 58 and minute 25 of any hour.
      const hotZoneActive = minutes >= 58 || minutes <= 25;
      setIsHotZone(hotZoneActive);
      
      // Hot zone: refresh every 30 seconds. Cold zone: refresh every 5 minutes.
      const delay = hotZoneActive ? 30000 : 300000;
      
      if (phaseRef.current !== 'video') {
        timeoutId = setTimeout(fetchAndSchedule, delay);
      }
    };

    fetchAndSchedule();

    return () => clearTimeout(timeoutId);
  }, [loadData]);

  // Resume polling when returning from video phase
  useEffect(() => {
    if (phase === 'dashboard') {
      loadData();
    }
  }, [phase, loadData]);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleAudio = () => {
    if (!audioEnabled) {
      // Initialize audio context on first user interaction
      initAudio();
    }
    setAudioEnabled(!audioEnabled);
  };

  if (loading && !data) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0b0e14] text-white">
        <div className="flex flex-col items-center gap-4">
          <p className="text-[#325795] font-mono text-xl uppercase font-bold tracking-widest animate-pulse">Iniciando Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0b0e14] text-white">
        <div className="flex flex-col items-center gap-4">
          <p className="text-red-500 font-mono text-xl uppercase font-bold tracking-widest">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const totalSales = data?.totalNeto || 0;
  const totalOrders = data?.totalTickets || 0;
  const totalUnits = data?.totalUnidades || 0;
  const topPerformer = [...(data?.branches ?? [])].sort((a, b) => b.hoyNeto - a.hoyNeto)[0];
  const inactiveBranches = data?.branches.filter(b => b.inactiveMinutes > 60).sort((a, b) => b.inactiveMinutes - a.inactiveMinutes) || [];

  const proyeccionFinMes = data?.proyeccionTotal || 0;
  const varPctVsSemAnt = data?.varPctVsSemAnt || 0;
  const diasRestantes = data?.diasRestantes || 0;
  const diaActual = data?.diaActual || 0;
  const diasMes = data?.diasMes || 0;

  return (
    <div className={`h-screen w-screen flex flex-col p-4 2xl:p-6 transition-all duration-1000 ease-in-out font-sans overflow-hidden select-none
        ${celebrationMode 
          ? 'bg-gradient-to-l from-[#C8102E] via-[#325795] to-[#01B693] bg-[length:400%_400%] animate-[gradientAnim_8s_ease_infinite]' 
          : 'bg-[#0b0e14]'
        }`}>
        
        {/* Ambient Background Glow for Standard Mode */}
        {!celebrationMode && (
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
             <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#325795] opacity-[0.05] blur-[150px]"></div>
             <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#325795] opacity-[0.05] blur-[150px]"></div>
          </div>
        )}

        <style>{`
          @keyframes gradientAnim {
              0%{background-position:0% 50%}
              50%{background-position:100% 50%}
              100%{background-position:0% 50%}
          }
          @keyframes ticker {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
          }
        `}</style>

      {/* Header - Ultra Compact */}
      <div className="flex justify-between items-center mb-2 shrink-0 relative z-10 bg-white/5 p-2 rounded-xl backdrop-blur-sm border border-white/5">
        <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="bg-white/10 p-1.5 rounded-lg">
                <img 
                    src="https://ugc.production.linktr.ee/5ef65f71-15a5-4bc2-8e40-71e49e3483e5_FarmaPlus-ORIGINAL-H.png" 
                    alt="Logo" 
                    className="h-5 2xl:h-6 object-contain"
                />
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              <div className={`w-1.5 h-1.5 rounded-full ${error ? 'bg-yellow-500' : 'bg-[#01B693] shadow-[0_0_8px_#01B693] animate-pulse'}`}></div>
              <p className="text-[10px] 2xl:text-xs text-gray-400 font-bold tracking-wide flex items-center">
                ACTUALIZADO: <span className="text-white font-mono ml-1">{lastRefresh.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}</span>
                {isHotZone && (
                  <span className="ml-2 flex items-center gap-1 text-[#01B693] bg-[#01B693]/10 px-1.5 py-0.5 rounded text-[8px] 2xl:text-[10px] border border-[#01B693]/20" title="Modo de actualización rápida activo (XX:00 - XX:20)">
                    <span className="animate-ping w-1 h-1 rounded-full bg-[#01B693]"></span>
                    SYNC RÁPIDO
                  </span>
                )}
              </p>
            </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
            <button 
                onClick={toggleFullscreen}
                className="px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-gray-400 text-[10px] 2xl:text-xs font-bold transition-all hover:bg-white/10 hover:text-white cursor-pointer active:scale-95">
                {isFullscreen ? '🗗 SALIR PANTALLA COMPLETA' : '🖵 PANTALLA COMPLETA'}
            </button>
            <button 
                onClick={toggleAudio}
                className={`px-3 py-1 rounded-lg border text-[10px] 2xl:text-xs font-bold transition-all hover:bg-white/5 cursor-pointer active:scale-95
                    ${audioEnabled 
                    ? 'bg-green-900/20 border-[#01B693]/50 text-[#01B693]' 
                    : 'bg-white/5 border-white/10 text-gray-500'
                    }`}>
                {audioEnabled ? '🔊 SONIDO ON' : '🔇 SONIDO OFF'}
            </button>
        </div>
      </div>

      {/* ROW 1: KPIs + Top Performer */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2 2xl:gap-3 mb-2 shrink-0 relative z-10">
        <KpiCard
          title="Facturación Total"
          value={formatMillions(totalSales)}
          numericValue={totalSales}
          format={formatMillions}
          color={COLORS.BLUE}
          subtitle={
            <div className="flex flex-col gap-0.5">
              <span className="text-gray-400 text-[9px] 2xl:text-[10px] font-bold tracking-wider">
                PROY. MES: <span className="text-white/80">{formatMillions(proyeccionFinMes)}</span>
              </span>
              <span className="text-gray-400 text-[9px] 2xl:text-[10px] font-bold tracking-wider">
                VS SEM ANT: <span className={varPctVsSemAnt >= 0 ? 'text-[#01B693]' : 'text-[#C8102E]'}>
                  {varPctVsSemAnt >= 0 ? '+' : ''}{formatPct(varPctVsSemAnt)}%
                </span>
              </span>
            </div>
          }
        />
        <KpiCard
          title="Tickets"
          value={new Intl.NumberFormat('es-AR').format(totalOrders)}
          numericValue={totalOrders}
          format={(val) => new Intl.NumberFormat('es-AR').format(val)}
          color={COLORS.RED}
          subtitle={
            <span className="text-gray-400 text-[9px] 2xl:text-[10px] font-bold tracking-wider">
              DÍA <span className="text-white/80">{diaActual}</span> DE <span className="text-white/80">{diasMes}</span> · FALTAN <span className="text-white/80">{diasRestantes}d</span>
            </span>
          }
        />
        <KpiCard
          title="Unidades"
          value={new Intl.NumberFormat('es-AR').format(totalUnits)}
          numericValue={totalUnits}
          format={(val) => new Intl.NumberFormat('es-AR').format(val)}
          color={COLORS.GOLD}
        />
        <TopBranchCard 
          branch={topPerformer} 
          totalSales={totalSales} 
        />
        <div className="bg-[#121620] p-3 2xl:p-4 rounded-xl border border-white/5 flex flex-col shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#01B693]"></div>
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#01B693] rounded-full opacity-5 blur-2xl group-hover:opacity-10 transition-opacity"></div>
            
            <h3 className="text-gray-400 text-[10px] 2xl:text-xs font-bold tracking-widest uppercase mb-2">PROYECCIÓN / VARIACIÓN</h3>

            <div className="flex flex-col gap-2 flex-1 justify-center">
                <div className="flex justify-between items-end">
                    <span className="text-gray-500 text-[9px] 2xl:text-[10px] font-bold">PROY. FIN DE MES</span>
                    <span className="text-white font-mono font-bold text-lg 2xl:text-xl drop-shadow-md">
                        {formatMillions(proyeccionFinMes)}
                    </span>
                </div>

                <div className="w-full h-[1px] bg-white/5"></div>

                <div className="flex justify-between items-end">
                    <span className="text-gray-500 text-[9px] 2xl:text-[10px] font-bold">VS SEM. ANT.</span>
                    <span className={`font-mono font-bold text-lg 2xl:text-xl drop-shadow-md ${varPctVsSemAnt >= 0 ? 'text-[#01B693]' : 'text-[#C8102E]'}`}>
                        {varPctVsSemAnt >= 0 ? '+' : ''}{formatPct(varPctVsSemAnt)}%
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* ROW 2: Ticker & Coverage */}
      <div className="flex flex-col gap-2 mb-2 shrink-0 relative z-10">
        {/* Ticker & Coverage */}
        <div className="flex gap-2 2xl:gap-3 h-7 2xl:h-8">
          <div className="flex-1 bg-[#121620] border border-white/5 rounded-lg flex items-center px-3 overflow-hidden relative">
            <span className="text-red-400 font-bold text-[10px] 2xl:text-xs mr-2 shrink-0 animate-pulse">⚠️ ALERTAS:</span>
            <div className="flex-1 overflow-hidden relative h-full flex items-center">
              <div className="whitespace-nowrap animate-[ticker_300s_linear_infinite] flex gap-12 text-[10px] 2xl:text-xs text-gray-300">
                {inactiveBranches.length > 0 ? inactiveBranches.map(b => {
                  const hours = Math.floor(b.inactiveMinutes / 60);
                  return (
                    <strong key={b.id}>Sucursal {b.name} sin tickets hace + {hours} hora{hours !== 1 ? 's' : ''}</strong>
                  );
                }) : <span className="text-emerald-400">Todas las sucursales operando normalmente (última hora).</span>}
              </div>
            </div>
          </div>
          <div className="w-56 2xl:w-64 bg-[#121620] border border-white/5 rounded-lg flex items-center justify-between px-3 shrink-0">
            <span className="text-gray-400 text-[9px] 2xl:text-[10px] font-bold">TOTAL COBERTURA / CLIENTES (HOY)</span>
            <div className="flex items-center gap-1.5">
                <span className="text-[#01B693] font-mono font-bold text-[10px] 2xl:text-xs">{new Intl.NumberFormat('es-AR').format(data.totalCobertura)}</span>
                <span className="text-gray-500 text-[10px]">/</span>
                <span className="text-[#325795] font-mono font-bold text-[10px] 2xl:text-xs">{new Intl.NumberFormat('es-AR').format(data.totalCliente)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 2xl:gap-3 flex-1 min-h-0 relative z-10">
        
        {/* Branch Ranking */}
        <div className="lg:col-span-2 bg-[#121620] p-3 2xl:p-4 rounded-xl border border-white/5 flex flex-col shadow-2xl relative backdrop-blur-md overflow-hidden">
            <div className="flex-1 min-h-0 relative overflow-hidden">
                 {data && <BranchBarChart branches={data.branches} />}
            </div>
        </div>

        {/* Evolution Chart */}
        <div className="lg:col-span-1 bg-[#121620] p-3 2xl:p-4 rounded-xl border border-white/5 flex flex-col shadow-2xl relative backdrop-blur-md overflow-hidden">
             <div className="flex-1 min-h-0 relative">
                {data && <EvolutionLineChart hourlyTotals={data.hourlyTotalsHoy} hourlyTotalsPrevWeek={data.hourlyTotalsSemAnt} currentFranja={data.ultimaFranjaHora} />}
            </div>
        </div>
      </div>

    </div>
  );
};

const isDebug = new URLSearchParams(window.location.search).has('debug');

const App: React.FC = () => {
  const [phase, setPhase] = useState<'video' | 'dashboard'>('dashboard'); // video temporalmente desactivado

  useEffect(() => {
    if (isDebug) return;
    let timeout: NodeJS.Timeout;
    if (phase === 'video') {
      const duration = ROTATOR_CONFIG.videoDuration * ROTATOR_CONFIG.videoLoopsBeforeDashboard * 1000;
      timeout = setTimeout(() => setPhase('dashboard'), duration);
    } else {
      const duration = ROTATOR_CONFIG.dashboardDuration * 1000;
      timeout = setTimeout(() => setPhase('video'), duration);
    }
    return () => clearTimeout(timeout);
  }, [phase]);

  if (isDebug) return <DebugLauncher />;

  return (
    <div className="w-full h-screen overflow-hidden bg-black relative">
      {/* Dashboard is always mounted to preserve state and prevent loading spinners */}
      <motion.div
        animate={{ 
          opacity: phase === 'dashboard' ? 1 : 0,
          scale: phase === 'dashboard' ? 1 : 0.98
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: phase === 'dashboard' ? 'auto' : 'none' }}
      >
        <Dashboard phase={phase} />
      </motion.div>

      <AnimatePresence>
        {phase === 'video' && (
          <motion.div
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full z-50"
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src={ROTATOR_CONFIG.videoUrl} type="video/mp4" />
            </video>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
