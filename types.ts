export interface BranchData {
  id: string;
  name: string;

  // Acumulado del mes
  acumNeto: number;
  acumTickets: number;
  acumUnidades: number;
  acumCobertura: number;
  acumCliente: number;

  // Hoy
  hoyNeto: number;
  hoyTickets: number;
  hoyUnidades: number;
  hoyCobertura: number;
  hoyCliente: number;

  // Actividad horaria
  horaPicoHoy: number;
  horaPicoHoyNeto: number;
  ultimaFranjaConDatos: number;
  ultimaHoraTicket: string;
  alertaInactividad: string;
  inactiveMinutes: number;

  // Semana anterior
  semAntNeto: number;
  semAntTickets: number;
  semAntUnidades: number;
  semAntNetoDiaCompleto: number;
  varPctVsSemAnt: number;

  // Meta diaria
  metaDiaria: number;
  avancePctDiario: number;
  faltaMetaDiaria: number;

  // Arrays horarios (índice = hora 0..23)
  hourlySales: number[];
  hourlyTickets: number[];
  hourlyUnidades: number[];
  hourlySalesSemAnt: number[];
  hourlyTicketsSemAnt: number[];
}

export interface DashboardData {
  branches: BranchData[];

  // Contexto temporal
  fechaHoy: string;
  diaActual: number;
  diasMes: number;
  diasRestantes: number;
  pctMesTranscurrido: number;
  ultimaFranjaHora: number;

  // Totales de la red (hoy)
  totalNeto: number;
  totalTickets: number;
  totalUnidades: number;
  totalCobertura: number;
  totalCliente: number;

  // Totales acumulados del mes
  totalAcumNeto: number;

  // Meta diaria red
  totalMetaDiaria: number;

  // Variación vs semana anterior
  varPctVsSemAnt: number;

  // Arrays horarios totales
  hourlyTotalsHoy: number[];
  hourlyTotalsSemAnt: number[];
  hourlyTicketsTotalsHoy: number[];

  // Beneficios (red total)
  altaClientes: number;
  promedioDiarioClientes: number;
  pctNominados: number;
  metaPctNominados: number;
  ticketsNominados: number;
  ticketsNominadosBase: number;

  lastUpdated: Date;
  systemVersion: string;
}
