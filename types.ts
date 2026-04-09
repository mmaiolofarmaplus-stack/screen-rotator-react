export interface BranchData {
  id: string;
  name: string;
  todaySales: number;
  todayTickets: number;
  todayUnits: number;
  todayCobertura: number;
  todayCliente: number;
  
  monthSales: number;
  monthTickets: number;
  
  hourlySales: number[]; // 0 to 23
  hourlySalesPrevWeek: number[]; // 0 to 23
  
  lastTicketTime: string;
  
  dailyTarget: number;
  dailyTargetUnits?: number;
  inactiveMinutes: number;
  progressPercentage: number;
  quadrant?: number;
}

export interface DashboardData {
  branches: BranchData[];
  totalSales: number;
  totalOrders: number;
  totalUnits: number;
  dailyTarget: number;
  totalCobertura: number;
  totalCliente: number;
  hourlyTotals: number[];
  hourlyTotalsPrevWeek: number[];
  lastUpdated: Date;
  systemVersion: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}