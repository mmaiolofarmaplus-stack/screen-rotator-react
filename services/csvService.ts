import { DashboardData, BranchData } from '../types';

declare const Papa: any;

const CACHE_KEY = 'farmaplus_v3_cache';

export const getCachedData = (): DashboardData | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      lastUpdated: new Date(parsed.lastUpdated),
      altaClientes:           parsed.altaClientes           ?? 0,
      promedioDiarioClientes: parsed.promedioDiarioClientes ?? 0,
      pctNominados:           parsed.pctNominados           ?? 0,
      metaPctNominados:       parsed.metaPctNominados       ?? 35,
      ticketsNominados:       parsed.ticketsNominados       ?? 0,
      ticketsNominadosBase:   parsed.ticketsNominadosBase   ?? 0,
    };
  } catch {
    return null;
  }
};

const setCachedData = (data: DashboardData): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
};

const fetchCSV = async (path: string): Promise<any[]> => {
  const res = await fetch(path + '?t=' + Date.now());
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${path}`);
  const text = await res.text();
  return Papa.parse(text, { header: true, skipEmptyLines: true }).data;
};

const n = (v: any): number => {
  if (v === undefined || v === null || v === '') return 0;
  const parsed = parseFloat(String(v).replace(',', '.'));
  return isNaN(parsed) ? 0 : parsed;
};

const calcInactiveMinutes = (ultimaHoraTicket: string, ultimaFranjaHora: number): number => {
  try {
    const parts = ultimaHoraTicket.split(':');
    if (parts.length < 2) return 0;
    const ticketH = parseInt(parts[0], 10);
    const ticketM = parseInt(parts[1], 10);
    const ticketS = parts.length > 2 ? parseInt(parts[2], 10) : 0;
    const ticketSeconds = ticketH * 3600 + ticketM * 60 + ticketS;
    const nowSeconds = ultimaFranjaHora * 3600;
    const diff = nowSeconds - ticketSeconds;
    return diff > 0 ? Math.floor(diff / 60) : 0;
  } catch {
    return 0;
  }
};

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const [baseRows, horaRows, semRows, benRows] = await Promise.all([
    fetchCSV('/data/base_conocimiento.csv'),
    fetchCSV('/data/horas_hoy.csv'),
    fetchCSV('/data/horas_semana_anterior.csv'),
    fetchCSV('/data/beneficios.csv'),
  ]);

  // Build hourly maps: sucursal -> number[24]
  const hoySalesMap = new Map<string, number[]>();
  const hoyTicketsMap = new Map<string, number[]>();
  const hoyUnidadesMap = new Map<string, number[]>();

  horaRows.forEach((row: any) => {
    const suc = String(row.Sucursal || '').trim().toUpperCase();
    const hora = parseInt(row.Hora, 10);
    if (!suc || isNaN(hora) || hora < 0 || hora > 23) return;
    if (!hoySalesMap.has(suc)) {
      hoySalesMap.set(suc, Array(24).fill(0));
      hoyTicketsMap.set(suc, Array(24).fill(0));
      hoyUnidadesMap.set(suc, Array(24).fill(0));
    }
    hoySalesMap.get(suc)![hora] += n(row.Neto);
    hoyTicketsMap.get(suc)![hora] += n(row.Tickets);
    hoyUnidadesMap.get(suc)![hora] += n(row.Unidades);
  });

  const semSalesMap = new Map<string, number[]>();
  const semTicketsMap = new Map<string, number[]>();

  semRows.forEach((row: any) => {
    const suc = String(row.Sucursal || '').trim().toUpperCase();
    const hora = parseInt(row.Hora, 10);
    if (!suc || isNaN(hora) || hora < 0 || hora > 23) return;
    if (!semSalesMap.has(suc)) {
      semSalesMap.set(suc, Array(24).fill(0));
      semTicketsMap.set(suc, Array(24).fill(0));
    }
    semSalesMap.get(suc)![hora] += n(row.Neto);
    semTicketsMap.get(suc)![hora] += n(row.Tickets);
  });

  const ctx = baseRows[0] || {};
  const diaActual = parseInt(ctx.Ctx_Dia_Del_Mes, 10) || 1;
  const diasMes = parseInt(ctx.Ctx_Dias_Totales_Mes, 10) || 30;
  const diasRestantes = parseInt(ctx.Ctx_Dias_Restantes, 10) || 0;
  const pctMesTranscurrido = n(ctx.Ctx_Pct_Mes_Transcurrido);
  const ultimaFranjaHora = parseInt(ctx.Ctx_Ultima_Franja_Hora, 10) || 0;
  const fechaHoy = String(ctx.Ctx_Fecha_Hoy || '');

  const branches: BranchData[] = baseRows.map((row: any) => {
    const sucursal = String(row.Sucursal || '').trim().toUpperCase();
    const ultimaHoraTicket = String(row.Ultima_Hora_Ticket || '');

    return {
      id: String(row.ID_Sucursal || ''),
      name: sucursal,

      acumNeto: n(row.Acum_Neto),
      acumTickets: n(row.Acum_Tickets),
      acumUnidades: n(row.Acum_Unidades),
      acumCobertura: n(row.Acum_Cobertura),
      acumCliente: n(row.Acum_Cliente),

      hoyNeto: n(row.Hoy_Neto),
      hoyTickets: n(row.Hoy_Tickets),
      hoyUnidades: n(row.Hoy_Unidades),
      hoyCobertura: n(row.Hoy_Cobertura),
      hoyCliente: n(row.Hoy_Cliente),

      horaPicoHoy: n(row.Hora_Pico_Hoy),
      horaPicoHoyNeto: n(row.Hora_Pico_Hoy_Neto),
      ultimaFranjaConDatos: n(row.Ultima_Franja_Con_Datos),
      ultimaHoraTicket,
      alertaInactividad: String(row.Alerta_Inactividad || ''),
      inactiveMinutes: calcInactiveMinutes(ultimaHoraTicket, ultimaFranjaHora),

      semAntNeto: n(row.SemAnt_Neto_HastaAhora),
      semAntTickets: n(row.SemAnt_Tickets_HastaAhora),
      semAntUnidades: n(row.SemAnt_Unidades_HastaAhora),
      semAntNetoDiaCompleto: n(row.SemAnt_Neto_DiaCompleto),
      varPctVsSemAnt: n(row.Var_Pct_vs_SemAnt_HastaAhora),

      meta1UN: n(row.Obj_Meta1_UN_Mes),
      meta1Pesos: n(row.Obj_Meta1_Pesos_Mes),
      meta2UN: n(row.Obj_Meta2_UN_Mes),
      meta2Pesos: n(row.Obj_Meta2_Pesos_Mes),
      meta3UN: n(row.Obj_Meta3_UN_Mes),
      meta3Pesos: n(row.Obj_Meta3_Pesos_Mes),

      metaAcumM1: n(row.MetaAcum_Meta1_Pesos),
      metaAcumM2: n(row.MetaAcum_Meta2_Pesos),
      metaAcumM3: n(row.MetaAcum_Meta3_Pesos),
      metaAcumM1UN: n(row.MetaAcum_Meta1_UN),

      avancePctM1: n(row.Avance_Pct_vs_MetaAcum_M1),
      avancePctM2: n(row.Avance_Pct_vs_MetaAcum_M2),
      avancePctM3: n(row.Avance_Pct_vs_MetaAcum_M3),
      avancePctM1UN: n(row.Avance_Pct_vs_MetaAcum_UN_M1),

      deltaM1: n(row.Delta_vs_MetaAcum_M1),
      deltaM2: n(row.Delta_vs_MetaAcum_M2),
      deltaM3: n(row.Delta_vs_MetaAcum_M3),

      faltaMeta1: n(row.Falta_Meta1_FinMes),
      faltaMeta2: n(row.Falta_Meta2_FinMes),
      faltaMeta3: n(row.Falta_Meta3_FinMes),

      ritmoReal: n(row.Ritmo_Real_Diario),
      ritmoNecesarioM1: n(row.Ritmo_Necesario_Meta1),
      ritmoNecesarioM2: n(row.Ritmo_Necesario_Meta2),
      ritmoNecesarioM3: n(row.Ritmo_Necesario_Meta3),

      proyeccionNeto: n(row.Proyeccion_Neto_FinMes),
      proyeccionUN: n(row.Proyeccion_UN_FinMes),

      estadoAcumulado: String(row.Estado_Acumulado || ''),
      metaProyectada: String(row.Meta_Proyectada_FinMes || ''),
      semaforo: String(row.Semaforo || ''),

      hourlySales: hoySalesMap.get(sucursal) ?? Array(24).fill(0),
      hourlyTickets: hoyTicketsMap.get(sucursal) ?? Array(24).fill(0),
      hourlyUnidades: hoyUnidadesMap.get(sucursal) ?? Array(24).fill(0),
      hourlySalesSemAnt: semSalesMap.get(sucursal) ?? Array(24).fill(0),
      hourlyTicketsSemAnt: semTicketsMap.get(sucursal) ?? Array(24).fill(0),
    };
  });

  const hourlyTotalsHoy = Array(24).fill(0);
  const hourlyTotalsSemAnt = Array(24).fill(0);
  const hourlyTicketsTotalsHoy = Array(24).fill(0);
  branches.forEach(b => {
    for (let i = 0; i < 24; i++) {
      hourlyTotalsHoy[i] += b.hourlySales[i];
      hourlyTotalsSemAnt[i] += b.hourlySalesSemAnt[i];
      hourlyTicketsTotalsHoy[i] += b.hourlyTickets[i];
    }
  });

  const totalNeto = branches.reduce((s, b) => s + b.hoyNeto, 0);
  const totalTickets = branches.reduce((s, b) => s + b.hoyTickets, 0);
  const totalUnidades = branches.reduce((s, b) => s + b.hoyUnidades, 0);
  const totalCobertura = branches.reduce((s, b) => s + b.hoyCobertura, 0);
  const totalCliente = branches.reduce((s, b) => s + b.hoyCliente, 0);
  const totalAcumNeto = branches.reduce((s, b) => s + b.acumNeto, 0);
  const totalMetaAcumM1 = branches.reduce((s, b) => s + b.metaAcumM1, 0);
  const proyeccionTotal = branches.reduce((s, b) => s + b.proyeccionNeto, 0);
  const semAntTotal = branches.reduce((s, b) => s + b.semAntNeto, 0);
  const varPctVsSemAnt = semAntTotal > 0 ? ((totalNeto - semAntTotal) / semAntTotal) * 100 : 0;

  const ben = benRows[0] ?? {};
  const altaClientes           = n(ben.Alta_Clientes);
  const promedioDiarioClientes = n(ben.Promedio_Diario_Clientes);
  const pctNominados           = n(ben.Pct_Nominados);
  const metaPctNominados       = n(ben.Meta_Pct_Nominados) || 35;
  const ticketsNominados       = n(ben.Tickets_Nominados);
  const ticketsNominadosBase   = n(ben.Total_Tickets);

  const data: DashboardData = {
    branches,
    fechaHoy,
    diaActual,
    diasMes,
    diasRestantes,
    pctMesTranscurrido,
    ultimaFranjaHora,
    totalNeto,
    totalTickets,
    totalUnidades,
    totalCobertura,
    totalCliente,
    totalAcumNeto,
    totalMetaAcumM1,
    varPctVsSemAnt,
    proyeccionTotal,
    hourlyTotalsHoy,
    hourlyTotalsSemAnt,
    hourlyTicketsTotalsHoy,
    altaClientes,
    promedioDiarioClientes,
    pctNominados,
    metaPctNominados,
    ticketsNominados,
    ticketsNominadosBase,
    lastUpdated: new Date(),
    systemVersion: '2.0',
  };

  setCachedData(data);
  return data;
};
