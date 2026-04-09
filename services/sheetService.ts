import { CONFIG } from '../constants';
import { DashboardData, BranchData } from '../types';

declare const Papa: any;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const smartParseNumber = (value: string | undefined): number => {
  if (!value) return 0;
  let str = String(value).trim();
  const cleanStrForDetection = str.replace(/[^\d.,-]/g, '');
  if (!cleanStrForDetection || cleanStrForDetection === '' || cleanStrForDetection === '-') return 0;

  let result = 0;
  const lastComma = cleanStrForDetection.lastIndexOf(',');
  const lastDot = cleanStrForDetection.lastIndexOf('.');

  if (lastComma > -1 && lastDot > -1) {
    if (lastDot > lastComma) {
      result = parseFloat(cleanStrForDetection.replace(/,/g, ''));
    } else {
      result = parseFloat(cleanStrForDetection.replace(/\./g, '').replace(',', '.'));
    }
  } else if (lastDot > -1) {
    const dotCount = (cleanStrForDetection.match(/\./g) || []).length;
    if (dotCount > 1) {
      result = parseFloat(cleanStrForDetection.replace(/\./g, ''));
    } else if (/\.\d{3}$/.test(cleanStrForDetection)) {
      result = parseFloat(cleanStrForDetection.replace(/\./g, ''));
    } else {
      result = parseFloat(cleanStrForDetection);
    }
  } else if (lastComma > -1) {
    const commaCount = (cleanStrForDetection.match(/,/g) || []).length;
    if (commaCount > 1) {
      result = parseFloat(cleanStrForDetection.replace(/,/g, ''));
    } else if (/,\d{3}$/.test(cleanStrForDetection)) {
      result = parseFloat(cleanStrForDetection.replace(/,/g, ''));
    } else {
      result = parseFloat(cleanStrForDetection.replace(',', '.'));
    }
  } else {
    result = parseFloat(cleanStrForDetection);
  }

  return isNaN(result) ? 0 : result;
};

const parseInteger = (value: string | undefined): number => {
  if (!value) return 0;
  const parsed = parseInt(String(value).replace(/[^\d-]/g, ''), 10);
  return isNaN(parsed) ? 0 : parsed;
};

// --- ROBUST PROXY SYSTEM ---
const PROXY_GENERATORS = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}&t=${Date.now()}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
];

const fetchWithRobustRetry = async (url: string, attempt = 0): Promise<string> => {
  if (!url) return '';
  if (attempt >= PROXY_GENERATORS.length) {
    throw new Error(`All proxies failed to fetch the data for URL: ${url}`);
  }
  const targetUrl = PROXY_GENERATORS[attempt](url);
  try {
    console.log(`📡 Fetching via Proxy #${attempt + 1}...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const response = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    if (!text || text.length < 10) throw new Error("Empty response");
    return text;
  } catch (error) {
    console.warn(`⚠️ Proxy #${attempt + 1} failed:`, error);
    await delay(1000);
    return fetchWithRobustRetry(url, attempt + 1);
  }
};

const parseCSV = (csv: string) => {
  if (!csv) return [];
  return Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
  }).data;
};

// Helper to find a column name ignoring case and spaces
const findCol = (row: any, possibleNames: string[]) => {
  const keys = Object.keys(row);
  for (const key of keys) {
    const cleanKey = key.trim().toLowerCase();
    for (const name of possibleNames) {
      if (cleanKey.includes(name.toLowerCase())) {
        return row[key];
      }
    }
  }
  return undefined;
};

export const fetchDashboardData = async (): Promise<DashboardData> => {
  try {
    const sheetEntries = Object.entries(CONFIG.SHEETS) as [string, string][];

    const csvResults = await Promise.all(
      sheetEntries.map(([name, url]) =>
        fetchWithRobustRetry(url).then(csv => ({ name, csv }))
      )
    );

    const parsedSheets: Record<string, any[]> = {};
    csvResults.forEach(({ name, csv }) => {
      parsedSheets[name] = parseCSV(csv);
    });

    const branchesMap = new Map<string, BranchData>();

    const getOrCreateBranch = (id: string, name: string) => {
      if (!id) return null;
      if (!branchesMap.has(id)) {
        branchesMap.set(id, {
          id,
          name: name || `Sucursal ${id}`,
          todaySales: 0,
          todayTickets: 0,
          todayUnits: 0,
          todayCobertura: 0,
          todayCliente: 0,
          monthSales: 0,
          monthTickets: 0,
          hourlySales: Array(24).fill(0),
          hourlySalesPrevWeek: Array(24).fill(0),
          lastTicketTime: '',
          dailyTarget: 1, // Default to avoid division by zero
          dailyTargetUnits: 1,
          inactiveMinutes: 0,
          progressPercentage: 0,
          quadrant: 4,
        });
      }
      return branchesMap.get(id)!;
    };

    // 1. Facturacion_x_Dia
    const factDia = parsedSheets['facturacionDia'] || [];
    factDia.forEach(row => {
      const id = findCol(row, ['sucursal', 'id']);
      const name = findCol(row, ['nombre_sucu', 'nombre']);
      const branch = getOrCreateBranch(id, name);
      if (branch) {
        branch.todaySales = smartParseNumber(findCol(row, ['neto', 'facturacion']));
        branch.todayTickets = parseInteger(findCol(row, ['ticket']));
        branch.todayUnits = parseInteger(findCol(row, ['unidad', 'unidades']));
        branch.todayCobertura = smartParseNumber(findCol(row, ['cobertura']));
        branch.todayCliente = smartParseNumber(findCol(row, ['cliente']));
      }
    });

    // 2. Facturacion_Mes
    const factMes = parsedSheets['facturacionMes'] || [];
    factMes.forEach(row => {
      const id = findCol(row, ['sucursal', 'id']);
      const name = findCol(row, ['nombre_sucu', 'nombre']);
      const branch = getOrCreateBranch(id, name);
      if (branch) {
        branch.monthSales = smartParseNumber(findCol(row, ['neto', 'facturacion']));
        branch.monthTickets = parseInteger(findCol(row, ['ticket']));
      }
    });

    // 3. Sucursal_x_Hora
    const sucHora = parsedSheets['sucursalPorHora'] || [];
    sucHora.forEach(row => {
      const id = findCol(row, ['sucursal', 'id']);
      const name = findCol(row, ['nombre_sucu', 'nombre']);
      const branch = getOrCreateBranch(id, name);
      if (branch) {
        const hour = parseInteger(findCol(row, ['franja', 'hora']));
        const sales = smartParseNumber(findCol(row, ['neto', 'facturacion']));
        if (hour >= 0 && hour < 24) {
          branch.hourlySales[hour] += sales;
        }
      }
    });

    // 4. Sucursal_Semana_Anterior
    const sucSemana = parsedSheets['sucursalSemanaAnterior'] || [];
    sucSemana.forEach(row => {
      const id = findCol(row, ['sucursal', 'id']);
      const name = findCol(row, ['nombre_sucu', 'nombre']);
      const branch = getOrCreateBranch(id, name);
      if (branch) {
        const hour = parseInteger(findCol(row, ['franja', 'hora']));
        const sales = smartParseNumber(findCol(row, ['neto', 'facturacion']));
        if (hour >= 0 && hour < 24) {
          branch.hourlySalesPrevWeek[hour] += sales;
        }
      }
    });

    // 5. Ultima_Hora_Ticket
    const ultimaHora = parsedSheets['ultimaHoraTicket'] || [];
    ultimaHora.forEach(row => {
      const id = findCol(row, ['sucursal', 'id']);
      const name = findCol(row, ['nombre_sucu', 'nombre']);
      const branch = getOrCreateBranch(id, name);
      if (branch) {
        branch.lastTicketTime = findCol(row, ['ultima_hora', 'hora']) || '';
      }
    });

    // 6. Objetivos
    const objetivos = parsedSheets['objetivos'] || [];
    objetivos.forEach(row => {
      const id = findCol(row, ['sucursal', 'id']);
      const name = findCol(row, ['nombre_sucu', 'nombre', 'farmacia']);
      
      let branch = null;
      if (id && !isNaN(parseInt(id))) {
          branch = getOrCreateBranch(id, name);
      } else if (name) {
          branch = Array.from(branchesMap.values()).find(b => 
              b.name.toLowerCase().includes(name.toLowerCase()) || 
              name.toLowerCase().includes(b.name.toLowerCase())
          );
      }

      if (branch) {
        const targetSales = smartParseNumber(findCol(row, ['meta 1 $$', 'meta 1 $', 'objetivo', 'meta', 'cuota']));
        const targetUnits = smartParseNumber(findCol(row, ['meta 1 un']));
        
        if (targetSales > 0) {
          branch.dailyTarget = targetSales;
        }
        if (targetUnits > 0) {
          branch.dailyTargetUnits = targetUnits;
        }
      }
    });

    const allBranches = Array.from(branchesMap.values());

    // Calculate Quadrants based on monthSales
    const branchesByMonthSales = [...allBranches].sort((a, b) => b.monthSales - a.monthSales);
    const totalBranches = branchesByMonthSales.length;
    branchesByMonthSales.forEach((b, index) => {
        if (index < totalBranches * 0.25) b.quadrant = 1;
        else if (index < totalBranches * 0.5) b.quadrant = 2;
        else if (index < totalBranches * 0.75) b.quadrant = 3;
        else b.quadrant = 4;
    });

    let combinedTotalSales = 0;
    let combinedTotalOrders = 0;
    let combinedTotalUnits = 0;
    let combinedDailyTarget = 0;
    let combinedTotalCobertura = 0;
    let combinedTotalCliente = 0;
    const combinedHourlyTotals: number[] = Array(24).fill(0);
    const combinedHourlyTotalsPrevWeek: number[] = Array(24).fill(0);

    const now = new Date();
    const argTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}));
    const currentTotalSeconds = argTime.getHours() * 3600 + argTime.getMinutes() * 60 + argTime.getSeconds();

    allBranches.forEach(branch => {
      combinedTotalSales += branch.todaySales;
      combinedTotalOrders += branch.todayTickets;
      combinedTotalUnits += branch.todayUnits;
      combinedDailyTarget += branch.dailyTarget;
      combinedTotalCobertura += branch.todayCobertura;
      combinedTotalCliente += branch.todayCliente;
      for (let i = 0; i < 24; i++) {
        combinedHourlyTotals[i] += branch.hourlySales[i];
        combinedHourlyTotalsPrevWeek[i] += branch.hourlySalesPrevWeek[i];
      }

      branch.progressPercentage = branch.dailyTarget > 0 ? (branch.todaySales / branch.dailyTarget) * 100 : 0;
      
      let inactiveMinutes = 0;
      if (branch.lastTicketTime) {
         const parts = branch.lastTicketTime.split(':');
         if (parts.length >= 2) {
             const h = parseInt(parts[0], 10);
             const m = parseInt(parts[1], 10);
             const s = parts.length > 2 ? parseInt(parts[2], 10) : 0;
             const ticketTotalSeconds = h * 3600 + m * 60 + s;
             let diff = currentTotalSeconds - ticketTotalSeconds;
             if (diff < 0) diff += 24 * 3600; 
             inactiveMinutes = Math.floor(diff / 60);
         }
      }
      branch.inactiveMinutes = inactiveMinutes;
    });

    // Sort by progress descending
    allBranches.sort((a, b) => b.progressPercentage - a.progressPercentage);

    if (combinedDailyTarget === 0) combinedDailyTarget = 1;

    return {
      branches: allBranches,
      totalSales: combinedTotalSales,
      totalOrders: combinedTotalOrders,
      totalUnits: combinedTotalUnits,
      dailyTarget: combinedDailyTarget,
      totalCobertura: combinedTotalCobertura,
      totalCliente: combinedTotalCliente,
      hourlyTotals: combinedHourlyTotals,
      hourlyTotalsPrevWeek: combinedHourlyTotalsPrevWeek,
      lastUpdated: new Date(),
      systemVersion: '1.0', // We can implement remote reload later if needed
    };

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};