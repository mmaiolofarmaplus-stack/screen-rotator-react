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

  // Metas totales del mes
  meta1UN: number;
  meta1Pesos: number;
  meta2UN: number;
  meta2Pesos: number;
  meta3UN: number;
  meta3Pesos: number;

  // Meta acumulada real hasta hoy
  metaAcumM1: number;
  metaAcumM2: number;
  metaAcumM3: number;
  metaAcumM1UN: number;

  // Avance vs meta acumulada
  avancePctM1: number;
  avancePctM2: number;
  avancePctM3: number;
  avancePctM1UN: number;

  // Delta vs meta acumulada (+ bien, - mal)
  deltaM1: number;
  deltaM2: number;
  deltaM3: number;

  // Falta para cerrar el mes
  faltaMeta1: number;
  faltaMeta2: number;
  faltaMeta3: number;

  // Ritmo
  ritmoReal: number;
  ritmoNecesarioM1: number;
  ritmoNecesarioM2: number;
  ritmoNecesarioM3: number;

  // Proyecciones
  proyeccionNeto: number;
  proyeccionUN: number;

  // Conclusión
  estadoAcumulado: string;
  metaProyectada: string;
  semaforo: string;

  // Arrays horarios (índice = hora 0..23)
  hourlySales: number[];
  hourlyTickets: number[];
  hourlyUnidades: number[];
  hourlySalesSemAnt: number[];
  hourlyTicketsSemAnt: number[];
}

export interface DashboardData {
  branches: BranchData[];

  // Contexto temporal (igual para todas las sucursales)
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
  totalMetaAcumM1: number;

  // Variación y proyección
  varPctVsSemAnt: number;
  proyeccionTotal: number;

  // Arrays horarios totales (suma de todas las sucursales)
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
