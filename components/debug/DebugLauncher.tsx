import React, { useEffect, useState } from 'react';
import { fetchDashboardData, getCachedData } from '../../services/csvService';
import { fetchHotSaleData, getCachedHotSaleData, HotSaleData } from '../../services/hotSaleService';
import { DashboardData } from '../../types';
import { ScreenRanking } from '../screens/ScreenRanking';
import { ScreenMetaDiaria } from '../screens/ScreenMetaDiaria';
import { ScreenFacturacionHora } from '../screens/ScreenFacturacionHora';
import { ScreenTicketsHora } from '../screens/ScreenTicketsHora';
import { ScreenVariacion } from '../screens/ScreenVariacion';
import { ScreenAlertas } from '../screens/ScreenAlertas';
import { ScreenBeneficios } from '../screens/ScreenBeneficios';
import { ScreenAcumMes } from '../screens/ScreenAcumMes';
import { ScreenTicketPromedio } from '../screens/ScreenTicketPromedio';
import { ScreenProyeccionDia } from '../screens/ScreenProyeccionDia';
import { ScreenHotSale } from '../screens/ScreenHotSale';
import { ScreenHotSale2 } from '../screens/ScreenHotSale2';
import { ScreenHotSale3 } from '../screens/ScreenHotSale3';

type ScreenId = 'ranking' | 'acum-mes' | 'meta-diaria' | 'proyeccion-dia' | 'facturacion-hora' | 'tickets-hora' | 'ticket-promedio' | 'variacion' | 'alertas' | 'beneficios' | 'hs-kpis' | 'hs-hora' | 'hs-evol';

interface ScreenDef {
  id: ScreenId;
  label: string;
  sublabel: string;
  accent: string;
  component: React.FC<{ data: DashboardData }>;
}

interface HotSaleDef {
  id: ScreenId;
  label: string;
  sublabel: string;
  accent: string;
  component: React.FC<{ data: HotSaleData }>;
}

const SCREENS: ScreenDef[] = [
  { id: 'ranking',          label: 'Ranking',              sublabel: 'Ventas del día por sucursal',    accent: '#325795', component: ScreenRanking },
  { id: 'acum-mes',         label: 'Acumulado Mes',        sublabel: 'Avance mensual por sucursal',    accent: '#325795', component: ScreenAcumMes },
  { id: 'meta-diaria',      label: 'Meta Diaria',          sublabel: 'Hoy vs meta por sucursal',       accent: '#01B693', component: ScreenMetaDiaria },
  { id: 'proyeccion-dia',   label: 'Proyección Día',       sublabel: 'Estimación fin de jornada',      accent: '#f59e0b', component: ScreenProyeccionDia },
  { id: 'facturacion-hora', label: 'Facturación x Hora',   sublabel: 'Hoy vs semana anterior',         accent: '#C8102E', component: ScreenFacturacionHora },
  { id: 'tickets-hora',     label: 'Tickets x Hora',       sublabel: 'Hoy vs semana anterior',         accent: '#C8102E', component: ScreenTicketsHora },
  { id: 'ticket-promedio',  label: 'Ticket Promedio',      sublabel: 'Valor promedio por ticket',      accent: '#325795', component: ScreenTicketPromedio },
  { id: 'variacion',        label: 'Variación %',          sublabel: 'Vs semana anterior',             accent: '#01B693', component: ScreenVariacion },
  { id: 'alertas',          label: 'Alertas',              sublabel: 'Inactividad por sucursal',       accent: '#ef4444', component: ScreenAlertas },
  { id: 'beneficios',       label: 'Beneficios',           sublabel: 'Alta clientes & nominados',      accent: '#01B693', component: ScreenBeneficios },
];

const HS_SCREENS: HotSaleDef[] = [
  { id: 'hs-kpis', label: 'KPIs · Tablero',       sublabel: 'Hot Sale — resumen',         accent: '#DDED59', component: ScreenHotSale },
  { id: 'hs-hora', label: 'Hora · Canales',        sublabel: 'Hot Sale — por hora',        accent: '#FC5B31', component: ScreenHotSale2 },
  { id: 'hs-evol', label: 'Top · Productos',       sublabel: 'Hot Sale — ranking prod.',   accent: '#FF6B00', component: ScreenHotSale3 },
];

// Scale factor for the live previews
const SCALE = 0.22;

export const DebugLauncher: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(() => getCachedData());
  const [hsData, setHsData] = useState<HotSaleData | null>(() => getCachedHotSaleData());
  const [loading, setLoading] = useState(!getCachedData());
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ScreenId | null>(null);

  useEffect(() => {
    fetchDashboardData()
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
    fetchHotSaleData().then(setHsData).catch(console.error);
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
  if (selected) {
    const hsDef = HS_SCREENS.find(s => s.id === selected);
    const def   = SCREENS.find(s => s.id === selected);
    const back = (
      <>
        <button
          onClick={() => setSelected(null)}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-black/70 border border-white/20 text-white text-sm font-bold tracking-wider hover:bg-black/90 transition-all backdrop-blur-sm cursor-pointer"
        >
          ← VOLVER
        </button>
        <div className="absolute top-4 right-4 z-50 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs font-bold tracking-widest text-gray-400 backdrop-blur-sm">
          ESC para cerrar
        </div>
      </>
    );
    if (hsDef && hsData) {
      const HS = hsDef.component;
      return <div className="relative w-screen h-screen"><HS data={hsData} />{back}</div>;
    }
    if (def && data) {
      const ScreenComponent = def.component;
      return <div className="relative w-screen h-screen"><ScreenComponent data={data} />{back}</div>;
    }
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
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center gap-6 p-6">

        {/* Regular screens */}
        <div className="grid grid-cols-5 gap-4">
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
                <div style={{ width: `${SCALE * 100}vw`, height: `${SCALE * 100}vh`, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                  {data ? (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', transform: `scale(${SCALE})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
                      <ScreenComponent data={data} />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-[#0b0e14] flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="px-3 py-2 flex items-center justify-between bg-[#0d1119] border-t border-white/5 group-hover:bg-[#111827] transition-colors">
                  <div className="text-left">
                    <p className="text-white font-bold text-xs uppercase tracking-wide leading-tight">{screen.label}</p>
                    <p className="text-gray-500 text-[10px] font-medium leading-tight mt-0.5">{screen.sublabel}</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: screen.accent }} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Hot Sale separator */}
        <div className="w-full flex items-center gap-4 px-1">
          <div className="flex-1 h-px bg-[#DDED59]/20" />
          <span className="text-[#DDED59] text-xs font-black tracking-[0.35em] uppercase shrink-0">Hot Sale</span>
          <div className="flex-1 h-px bg-[#DDED59]/20" />
        </div>

        {/* Hot Sale screens */}
        <div className="grid grid-cols-5 gap-4 w-full">
          {HS_SCREENS.map((screen) => {
            const ScreenComponent = screen.component;
            return (
              <button
                key={screen.id}
                onClick={() => setSelected(screen.id)}
                className="group flex flex-col gap-0 rounded-xl overflow-hidden border border-white/8 hover:border-white/25 transition-all duration-200 cursor-pointer focus:outline-none hover:scale-[1.02] active:scale-[0.99]"
                style={{ boxShadow: '0 0 0 0 transparent', transition: 'border-color 200ms, transform 200ms, box-shadow 200ms' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 20px 2px ${screen.accent}44`)}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 0 transparent')}
              >
                <div style={{ width: `${SCALE * 100}vw`, height: `${SCALE * 100}vh`, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                  {hsData ? (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', transform: `scale(${SCALE})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
                      <ScreenComponent data={hsData} />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-[#09091e] flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-[#DDED59]/20 border-t-[#DDED59] rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="px-3 py-2 flex items-center justify-between bg-[#09091e] border-t border-[#DDED59]/10 group-hover:bg-[#0e0e25] transition-colors">
                  <div className="text-left">
                    <p className="text-white font-bold text-xs uppercase tracking-wide leading-tight">{screen.label}</p>
                    <p className="text-gray-500 text-[10px] font-medium leading-tight mt-0.5">{screen.sublabel}</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: screen.accent }} />
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
