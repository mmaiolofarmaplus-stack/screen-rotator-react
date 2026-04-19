import React, { useEffect, useState } from 'react';
import { fetchDashboardData, getCachedData } from '../../services/csvService';
import { DashboardData } from '../../types';
import { ScreenRanking } from '../screens/ScreenRanking';
import { ScreenFacturacionHora } from '../screens/ScreenFacturacionHora';
import { ScreenTicketsHora } from '../screens/ScreenTicketsHora';
import { ScreenVariacion } from '../screens/ScreenVariacion';
import { ScreenProyeccion } from '../screens/ScreenProyeccion';
import { ScreenAlertas } from '../screens/ScreenAlertas';
import { ScreenRitmo } from '../screens/ScreenRitmo';
import { ScreenBeneficios } from '../screens/ScreenBeneficios';

type ScreenId = 'ranking' | 'facturacion-hora' | 'tickets-hora' | 'variacion' | 'proyeccion' | 'alertas' | 'ritmo' | 'beneficios';

interface ScreenDef {
  id: ScreenId;
  label: string;
  sublabel: string;
  accent: string;
  component: React.FC<{ data: DashboardData }>;
}

const SCREENS: ScreenDef[] = [
  { id: 'ranking',         label: 'Ranking',              sublabel: 'Acumulado del mes',              accent: '#325795', component: ScreenRanking },
  { id: 'facturacion-hora',label: 'Facturación x Hora',   sublabel: 'Hoy vs semana anterior',         accent: '#C8102E', component: ScreenFacturacionHora },
  { id: 'tickets-hora',    label: 'Tickets x Hora',       sublabel: 'Ranking del día',                accent: '#C8102E', component: ScreenTicketsHora },
  { id: 'variacion',       label: 'Variación %',          sublabel: 'Vs semana anterior',             accent: '#01B693', component: ScreenVariacion },
  { id: 'proyeccion',      label: 'Proyección',           sublabel: 'A fin de mes',                   accent: '#01B693', component: ScreenProyeccion },
  { id: 'alertas',         label: 'Alertas',              sublabel: 'Inactividad por sucursal',       accent: '#ef4444', component: ScreenAlertas },
  { id: 'ritmo',           label: 'Ritmo Diario',         sublabel: 'Real vs necesario',              accent: '#f59e0b', component: ScreenRitmo },
  { id: 'beneficios',      label: 'Beneficios',           sublabel: 'Alta clientes & nominados',      accent: '#01B693', component: ScreenBeneficios },
];

// Scale factor for the live previews
const SCALE = 0.22;

export const DebugLauncher: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(() => getCachedData());
  const [loading, setLoading] = useState(!getCachedData());
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ScreenId | null>(null);

  useEffect(() => {
    fetchDashboardData()
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, []);

  // Keyboard escape to close fullscreen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (loading && !data) {
    return (
      <div className="w-screen h-screen bg-[#0b0e14] flex items-center justify-center">
        <p className="text-[#325795] font-mono text-xl uppercase font-bold tracking-widest animate-pulse">Cargando datos...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="w-screen h-screen bg-[#0b0e14] flex items-center justify-center">
        <p className="text-red-500 font-mono text-base font-bold">Error: {error}</p>
      </div>
    );
  }

  // --- Fullscreen view ---
  if (selected && data) {
    const def = SCREENS.find(s => s.id === selected)!;
    const ScreenComponent = def.component;
    return (
      <div className="relative w-screen h-screen">
        <ScreenComponent data={data} />
        <button
          onClick={() => setSelected(null)}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-black/70 border border-white/20 text-white text-sm font-bold tracking-wider hover:bg-black/90 transition-all backdrop-blur-sm cursor-pointer"
        >
          ← VOLVER
        </button>
        <div
          className="absolute top-4 right-4 z-50 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs font-bold tracking-widest text-gray-400 backdrop-blur-sm"
        >
          ESC para cerrar
        </div>
      </div>
    );
  }

  // --- Grid launcher ---
  return (
    <div className="w-screen h-screen bg-[#080b10] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-8 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-[#C8102E] animate-pulse" />
          <span className="text-[#C8102E] text-xs font-black tracking-[0.4em] uppercase">Modo Debug</span>
          <span className="text-gray-600 text-xs">·</span>
          <span className="text-gray-500 text-xs font-bold tracking-wider">Selector de pantallas</span>
        </div>
        <div className="flex items-center gap-3">
          {data && (
            <span className="text-gray-600 text-xs font-mono">
              {data.branches.length} sucursales · actualizado {new Date(data.lastUpdated).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {loading && <span className="text-yellow-500 text-xs font-bold animate-pulse">actualizando...</span>}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-6">
        <div className="grid grid-cols-4 gap-5">
          {SCREENS.map((screen) => {
            const ScreenComponent = screen.component;
            return (
              <button
                key={screen.id}
                onClick={() => setSelected(screen.id)}
                className="group flex flex-col gap-0 rounded-xl overflow-hidden border border-white/8 hover:border-white/25 transition-all duration-200 cursor-pointer focus:outline-none hover:scale-[1.02] active:scale-[0.99]"
                style={{ boxShadow: `0 0 0 0 ${screen.accent}`, transition: 'border-color 200ms, transform 200ms, box-shadow 200ms' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 20px 2px ${screen.accent}44`)}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 0 transparent')}
              >
                {/* Live preview */}
                <div
                  style={{
                    width: `${SCALE * 100}vw`,
                    height: `${SCALE * 100}vh`,
                    overflow: 'hidden',
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  {data ? (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        transform: `scale(${SCALE})`,
                        transformOrigin: 'top left',
                        pointerEvents: 'none',
                      }}
                    >
                      <ScreenComponent data={data} />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-[#0b0e14] flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Label */}
                <div
                  className="px-3 py-2 flex items-center justify-between bg-[#0d1119] border-t border-white/5 group-hover:bg-[#111827] transition-colors"
                >
                  <div className="text-left">
                    <p className="text-white font-bold text-xs uppercase tracking-wide leading-tight">{screen.label}</p>
                    <p className="text-gray-500 text-[10px] font-medium leading-tight mt-0.5">{screen.sublabel}</p>
                  </div>
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0 opacity-50 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: screen.accent }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
