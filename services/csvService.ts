import { DashboardData, BranchData } from '../types';

declare const Papa: any;

const CACHE_KEY = 'farmaplus_v4_cache';

const SHEET_ID = '1rTow4rq7UJL4Kuts-JdMLBS6AUqXcHXUrYOgEWj_fI4';
const SHEETS = {
  base_conocimiento:     '1016914412',
  horas_hoy:             '1209004727',
  horas_semana_anterior: '2088265702',
  clientes:              '1855567166',
  nominados:             '1235412273',
  meta_diaria:           '1440527970',
} as const;

const sheetUrl = (gid: string) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}&t=${Date.now()}`;

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

const fetchSheet = async (gid: string): Promise<any[]> => {
  const res = await fetch(sheetUrl(gid));
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching gid=${gid}`);
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
    const diff = ultimaFranjaHora * 3600 - (ticketH * 3600 + ticketM * 60 + ticketS);
    return diff > 0 ? Math.floor(diff / 60) : 0;
  } catch {
    return 0;
  }
};

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const [baseRows, horaRows, semRows, cliRows, nomRows, metaRows] = await Promise.all([
    fetchSheet(SHEETS.base_conocimiento),
    fetchSheet(SHEETS.horas_hoy),
    fetchSheet(SHEETS.horas_semana_anterior),
    fetchSheet(SHEETS.clientes),
    fetchSheet(SHEETS.nominados),
    fetchSheet(SHEETS.meta_diaria),
  ]);

  // Hourly maps: sucursal -> number[24]
  const hoySalesMap    = new Map<string, number[]>();
  const hoyTicketsMap  = new Map<string, number[]>();
  const hoyUnidadesMap = new Map<string, number[]>();

  horaRows.forEach((row: any) => {
    const suc  = String(row.Sucursal || '').trim().toUpperCase();
    const hora = parseInt(row.Hora, 10);
    if (!suc || isNaN(hora) || hora < 0 || hora > 23) return;
    if (!hoySalesMap.has(suc)) {
      hoySalesMap.set(suc,    Array(24).fill(0));
      hoyTicketsMap.set(suc,  Array(24).fill(0));
      hoyUnidadesMap.set(suc, Array(24).fill(0));
    }
    hoySalesMap.get(suc)![hora]    += n(row.Neto);
    hoyTicketsMap.get(suc)![hora]  += n(row.Tickets);
    hoyUnidadesMap.get(suc)![hora] += n(row.Unidades);
  });

  const semSalesMap   = new Map<string, number[]>();
  const semTicketsMap = new Map<string, number[]>();

  semRows.forEach((row: any) => {
    const suc  = String(row.Sucursal || '').trim().toUpperCase();
    const hora = parseInt(row.Hora, 10);
    if (!suc || isNaN(hora) || hora < 0 || hora > 23) return;
    if (!semSalesMap.has(suc)) {
      semSalesMap.set(suc,   Array(24).fill(0));
      semTicketsMap.set(suc, Array(24).fill(0));
    }
    semSalesMap.get(suc)![hora]   += n(row.Neto);
    semTicketsMap.get(suc)![hora] += n(row.Tickets);
  });

  // Build meta map: FARMACIA (uppercase) → meta value for today
  const today        = new Date();
  const metaDateKey  = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
  const metaMap      = new Map<string, number>();
  metaRows.forEach((row: any) => {
    if (String(row.FECHA || '').trim() !== metaDateKey) return;
    const farmacia = String(row.FARMACIA || '').trim().toUpperCase();
    const raw      = String(row['Meta 1 $$'] || '').replace(/[$\s.]/g, '').replace(',', '.');
    const val      = parseFloat(raw);
    if (farmacia && !isNaN(val)) metaMap.set(farmacia, val);
  });

  const ctx               = baseRows[0] || {};
  const diaActual         = parseInt(ctx.Ctx_Dia_Del_Mes, 10) || 1;
  const diasMes           = parseInt(ctx.Ctx_Dias_Totales_Mes, 10) || 30;
  const diasRestantes     = parseInt(ctx.Ctx_Dias_Restantes, 10) || 0;
  const pctMesTranscurrido = n(ctx.Ctx_Pct_Mes_Transcurrido);
  const ultimaFranjaHora  = parseInt(ctx.Ctx_Ultima_Franja_Hora, 10) || 0;
  const fechaHoy          = String(ctx.Ctx_Fecha_Hoy || '');

  const branches: BranchData[] = baseRows.map((row: any) => {
    const sucursal         = String(row.Sucursal || '').trim().toUpperCase();
    const ultimaHoraTicket = String(row.Ultima_Hora_Ticket || '');

    return {
      id:   String(row.ID_Sucursal || ''),
      name: sucursal,

      acumNeto:      n(row.Acum_Neto),
      acumTickets:   n(row.Acum_Tickets),
      acumUnidades:  n(row.Acum_Unidades),
      acumCobertura: n(row.Acum_Cobertura),
      acumCliente:   n(row.Acum_Cliente),

      hoyNeto:      n(row.Hoy_Neto),
      hoyTickets:   n(row.Hoy_Tickets),
      hoyUnidades:  n(row.Hoy_Unidades),
      hoyCobertura: n(row.Hoy_Cobertura),
      hoyCliente:   n(row.Hoy_Cliente),

      horaPicoHoy:           n(row.Hora_Pico_Hoy),
      horaPicoHoyNeto:       n(row.Hora_Pico_Hoy_Neto),
      ultimaFranjaConDatos:  n(row.Ultima_Franja_Con_Datos),
      ultimaHoraTicket,
      alertaInactividad:     String(row.Alerta_Inactividad || ''),
      inactiveMinutes:       calcInactiveMinutes(ultimaHoraTicket, ultimaFranjaHora),

      semAntNeto:              n(row.SemAnt_Neto_HastaAhora),
      semAntTickets:           n(row.SemAnt_Tickets_HastaAhora),
      semAntUnidades:          n(row.SemAnt_Unidades_HastaAhora),
      semAntNetoDiaCompleto:   n(row.SemAnt_Neto_DiaCompleto),
      varPctVsSemAnt:          n(row.Var_Pct_vs_SemAnt_HastaAhora),

      metaDiaria:       metaMap.get(sucursal) ?? 0,
      avancePctDiario:  (metaMap.get(sucursal) ?? 0) > 0
                          ? (n(row.Hoy_Neto) / metaMap.get(sucursal)!) * 100
                          : 0,
      faltaMetaDiaria:  (metaMap.get(sucursal) ?? 0) - n(row.Hoy_Neto),

      hourlySales:         hoySalesMap.get(sucursal)    ?? Array(24).fill(0),
      hourlyTickets:       hoyTicketsMap.get(sucursal)  ?? Array(24).fill(0),
      hourlyUnidades:      hoyUnidadesMap.get(sucursal) ?? Array(24).fill(0),
      hourlySalesSemAnt:   semSalesMap.get(sucursal)    ?? Array(24).fill(0),
      hourlyTicketsSemAnt: semTicketsMap.get(sucursal)  ?? Array(24).fill(0),
    };
  });

  const hourlyTotalsHoy          = Array(24).fill(0);
  const hourlyTotalsSemAnt       = Array(24).fill(0);
  const hourlyTicketsTotalsHoy   = Array(24).fill(0);
  branches.forEach(b => {
    for (let i = 0; i < 24; i++) {
      hourlyTotalsHoy[i]        += b.hourlySales[i];
      hourlyTotalsSemAnt[i]     += b.hourlySalesSemAnt[i];
      hourlyTicketsTotalsHoy[i] += b.hourlyTickets[i];
    }
  });

  const totalNeto       = branches.reduce((s, b) => s + b.hoyNeto, 0);
  const totalTickets    = branches.reduce((s, b) => s + b.hoyTickets, 0);
  const totalUnidades   = branches.reduce((s, b) => s + b.hoyUnidades, 0);
  const totalCobertura  = branches.reduce((s, b) => s + b.hoyCobertura, 0);
  const totalCliente    = branches.reduce((s, b) => s + b.hoyCliente, 0);
  const totalAcumNeto   = branches.reduce((s, b) => s + b.acumNeto, 0);
  const totalMetaDiaria = branches.reduce((s, b) => s + b.metaDiaria, 0);
  const semAntTotal     = branches.reduce((s, b) => s + b.semAntNeto, 0);
  const varPctVsSemAnt  = semAntTotal > 0 ? ((totalNeto - semAntTotal) / semAntTotal) * 100 : 0;

  // Beneficios — assembled from clientes + nominados sheets
  const cli = cliRows[0] ?? {};
  const nom = nomRows[0] ?? {};
  const altaClientes           = n(cli.TotalClientes);
  const pctNominados           = parseFloat(String(nom.PctNominados ?? '0').replace(',', '.')) || 0;
  const ticketsNominados       = n(nom.TicketsNominados);
  const ticketsNominadosBase   = n(nom.TotalTickets);
  const promedioDiarioClientes = diaActual > 0 ? Math.round(altaClientes / diaActual) : 0;
  const metaPctNominados       = 35;

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
    totalMetaDiaria,
    varPctVsSemAnt,
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
