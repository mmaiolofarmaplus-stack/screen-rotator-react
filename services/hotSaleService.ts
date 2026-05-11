import Papa from 'papaparse';

const HS_SHEET_ID = '1n-hOdYJlztQZlaTRK-l5j0qJOvZCLPHu-tRXqIVojEU';
const CACHE_KEY   = 'farmaplus_hs_v6';
const SHEETS      = { objetivo: '0', facturacion: '74084248', productos: '1247183190' } as const;

export interface HotSaleMeta     { venta: number; tickets: number; unidades: number; }
export interface HotSaleCanal    { name: string; short: string; venta: number; tickets: number; unidades: number; }
export interface HotSaleDeposito { name: string; venta: number; tickets: number; unidades: number; }
export interface HotSaleProduct  { name: string; venta: number; tickets: number; unidades: number; }
export interface HotSaleDaily    { fecha: string; short: string; venta: number; tickets: number; unidades: number; }

export interface HotSaleData {
  meta: HotSaleMeta;
  acum: HotSaleMeta;
  daily: HotSaleDaily[];
  hourlyHoy:  (number | null)[];
  hourlyAyer: (number | null)[];
  hourlyLabels: string[];
  lastSlotIdx: number;
  canales:   HotSaleCanal[];
  depositos: HotSaleDeposito[];
  products:  HotSaleProduct[];
  hourlyCanales: Record<string, (number | null)[]>;
  lastUpdated: Date;
}

const n = (v: any): number => {
  if (v === undefined || v === null || v === '') return 0;
  let s = String(v).trim().replace(/[$\s%]/g, '');
  const lD = s.lastIndexOf('.'), lC = s.lastIndexOf(',');
  if (lC > lD) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (lD > -1) {
    // Multiple dots OR single dot with exactly 3 trailing digits → es-AR thousands separator
    const afterDot = s.length - lD - 1;
    if (s.indexOf('.') !== lD || afterDot === 3) s = s.replace(/\./g, '');
    else s = s.replace(/,/g, '');
  } else {
    s = s.replace(/,/g, '');
  }
  return parseFloat(s) || 0;
};

const g = (row: any, ...keys: string[]): number => {
  for (const k of keys) {
    for (const v of [k, k.toLowerCase(), k.toUpperCase()]) {
      if (row[v] !== undefined && row[v] !== '') return n(row[v]);
    }
  }
  return 0;
};

const normalizeCanal = (name: string): string => {
  const l = name.toLowerCase();
  if (l.includes('mercado') || l.includes('meli') || /\bml\b/.test(l) || l.includes('roche')) return 'MercadoLibre';
  return name;
};

const sheetUrl = (gid: string) =>
  `https://docs.google.com/spreadsheets/d/${HS_SHEET_ID}/export?format=csv&gid=${gid}&t=${Date.now()}`;

const fetchSheet = async (gid: string): Promise<any[]> => {
  const res = await fetch(sheetUrl(gid));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Papa.parse(await res.text(), { header: true, skipEmptyLines: true }).data;
};

const settle = <T>(p: Promise<T>, fb: T): Promise<T> => p.catch(() => fb);

const DOW = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];

// Returns [year, month (1-12), day] or null
// Handles: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, and timestamps like "01-05-2026 12:00:00 a. m."
const parseDateParts = (raw: string): [number, number, number] | null => {
  const s = raw.trim().split(/\s+/)[0]; // strip time component
  const slash = s.split('/');
  if (slash.length === 3) {
    const d = +slash[0], m = +slash[1], y = +(slash[2] || 2026);
    if (!isNaN(d) && !isNaN(m) && !isNaN(y) && y > 1000) return [y, m, d];
  }
  const dash = s.split('-');
  if (dash.length === 3) {
    const a = +dash[0], b = +dash[1], c = +dash[2];
    if (!isNaN(a) && !isNaN(b) && !isNaN(c)) {
      if (c > 1000) return [c, b, a]; // DD-MM-YYYY
      if (a > 1000) return [a, b, c]; // YYYY-MM-DD
    }
  }
  return null;
};

const parseDateMs = (s: string): number => {
  const p = parseDateParts(s);
  return p ? new Date(p[0], p[1] - 1, p[2]).getTime() : 0;
};

export const getCachedHotSaleData = (): HotSaleData | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    return { ...d, lastUpdated: new Date(d.lastUpdated) };
  } catch { return null; }
};

export const fetchHotSaleData = async (): Promise<HotSaleData> => {
  const [objRows, factRows, prodRows] = await Promise.all([
    settle(fetchSheet(SHEETS.objetivo),   []),
    settle(fetchSheet(SHEETS.facturacion), []),
    settle(fetchSheet(SHEETS.productos),   []),
  ]);

  // ── Meta ─────────────────────────────────────────────────────────────────────
  // objetivo sheet has one row per day; sum all rows.
  // Column names from the sheet pivot: "Suma de Meta 1 $" and "Suma de Meta 1 Unis"
  let metaVenta = 0, metaUnidades = 0, metaTickets = 0;
  objRows.forEach((r: any) => {
    metaVenta    += g(r, 'Suma de Meta 1 $',    'Meta_Venta',    'meta_venta',    'Meta Venta',    'Objetivo_Venta');
    metaUnidades += g(r, 'Suma de Meta 1 Unis',  'Meta_Unidades', 'meta_unidades', 'Meta Unidades', 'Objetivo_Unidades');
    metaTickets  += g(r, 'Suma de Meta 1 Tkt',   'Meta_Tickets',  'meta_tickets',  'Meta Tickets',  'Objetivo_Tickets');
  });
  const meta: HotSaleMeta = {
    venta:    metaVenta    || 1_179_149_656,
    tickets:  metaTickets  || 26_293,
    unidades: metaUnidades || 98_372,
  };

  // ── Facturacion rows ──────────────────────────────────────────────────────────
  const dailyMap = new Map<string, HotSaleDaily>();
  const canalMap = new Map<string, HotSaleCanal>();
  const depMap   = new Map<string, HotSaleDeposito>();

  // Detect half-hour intervals
  const sampleH = factRows.slice(0, 20)
    .map((r: any) => String(r.Hora ?? r.hora ?? r.HORA ?? ''))
    .filter(Boolean);
  const isHalf = sampleH.some(h => h.includes(':') && !h.endsWith(':00') && !h.endsWith(':0'));
  const SLOTS  = isHalf ? 48 : 24;

  const hourlyLabels: string[] = isHalf
    ? Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2,'0')}:${i % 2 === 0 ? '00' : '30'}`)
    : Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`);

  const parseSlot = (s: string): number => {
    const clean = String(s).trim();
    if (clean.includes(':')) {
      const [h, m] = clean.split(':').map(Number);
      return isHalf ? h * 2 + (m >= 30 ? 1 : 0) : h;
    }
    return parseInt(clean, 10) || 0;
  };

  const _now = new Date();
  const todayMs  = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate()).getTime();
  const yesterMs = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate() - 1).getTime();

  const hourlyHoy:  (number | null)[] = Array(SLOTS).fill(null);
  const hourlyAyer: (number | null)[] = Array(SLOTS).fill(null);
  let lastSlotIdx = 0;
  const hourlyCanalMap = new Map<string, (number | null)[]>();

  factRows.forEach((row: any) => {
    const fechaStr = String(row.Fecha ?? row.fecha ?? row.FECHA ?? '').trim();
    if (!fechaStr) return;

    // Robust date parsing — handles "01-05-2026 12:00:00 a. m.", "01/05/2026", etc.
    const dc = parseDateParts(fechaStr);
    let dayDate: Date | null = null;
    let dayKey = fechaStr;
    if (dc) {
      dayDate = new Date(dc[0], dc[1] - 1, dc[2]);
      dayKey  = `${String(dc[2]).padStart(2,'0')}/${String(dc[1]).padStart(2,'0')}`;
    }
    const dateMs = dayDate ? dayDate.getTime() : 0;

    const canal    = String(row.Canal    ?? row.canal    ?? row.CANAL    ?? '').trim();
    const deposito = String(row.Deposito ?? row.deposito ?? row.DEPOSITO ?? row.Deposito_Origen ?? '').trim();
    const horaStr  = String(row.Hora     ?? row.hora     ?? row.HORA     ?? '0');
    const neto     = n(row.Venta_Neta ?? row.venta_neta ?? row.VentaNeta ?? row.Neto ?? row.neto ?? row.NETO ?? row.Venta ?? row.venta ?? row.Ventas ?? row.Importe ?? row.Monto ?? 0);
    const tickets  = n(row.Tickets ?? row.tickets ?? 0);
    const unidades = n(row.Unidades ?? row.unidades ?? 0);

    // Daily
    if (!dailyMap.has(dayKey)) {
      const dow = dayDate ? (DOW[dayDate.getDay()] ?? dayKey) : dayKey;
      dailyMap.set(dayKey, { fecha: dayKey, short: dow, venta: 0, tickets: 0, unidades: 0 });
    }
    const day = dailyMap.get(dayKey)!;
    day.venta += neto; day.tickets += tickets; day.unidades += unidades;

    // Canal
    if (canal) {
      const nc = normalizeCanal(canal);
      if (!canalMap.has(nc)) {
        canalMap.set(nc, { name: nc, short: nc === 'MercadoLibre' ? 'ML' : nc, venta: 0, tickets: 0, unidades: 0 });
      }
      const c = canalMap.get(nc)!;
      c.venta += neto; c.tickets += tickets; c.unidades += unidades;
    }

    // Deposito
    if (deposito) {
      if (!depMap.has(deposito)) depMap.set(deposito, { name: deposito, venta: 0, tickets: 0, unidades: 0 });
      const d = depMap.get(deposito)!;
      d.venta += neto; d.tickets += tickets; d.unidades += unidades;
    }

    // Hourly (only for today / yesterday)
    const slot = parseSlot(horaStr);
    if (slot >= 0 && slot < SLOTS) {
      if (dateMs === todayMs) {
        hourlyHoy[slot] = (hourlyHoy[slot] ?? 0) + neto;
        if (neto > 0) lastSlotIdx = Math.max(lastSlotIdx, slot);
        if (canal) {
          const nc = normalizeCanal(canal);
          if (!hourlyCanalMap.has(nc)) hourlyCanalMap.set(nc, Array(SLOTS).fill(null));
          const cArr = hourlyCanalMap.get(nc)!;
          cArr[slot] = (cArr[slot] ?? 0) + neto;
        }
      } else if (dateMs === yesterMs) {
        hourlyAyer[slot] = (hourlyAyer[slot] ?? 0) + neto;
      }
    }
  });

  const daily = Array.from(dailyMap.values()).sort((a, b) => {
    const [da, ma] = a.fecha.split('/').map(Number);
    const [db, mb] = b.fecha.split('/').map(Number);
    return ma !== mb ? ma - mb : da - db;
  });

  const acum: HotSaleMeta = {
    venta:    daily.reduce((s, d) => s + d.venta,    0),
    tickets:  daily.reduce((s, d) => s + d.tickets,  0),
    unidades: daily.reduce((s, d) => s + d.unidades, 0),
  };

  const canales   = Array.from(canalMap.values()).sort((a, b) => b.venta - a.venta);
  const depositos = Array.from(depMap.values()).sort((a, b) => b.venta - a.venta);

  // Products — rows are per-transaction; aggregate by product name
  const prodAgg = new Map<string, HotSaleProduct>();
  prodRows.forEach((r: any) => {
    const name = String(r.Detalle ?? r.detalle ?? r.Producto ?? r.producto ?? r.Nombre_Producto ?? r.nombre ?? r.SKU ?? '').trim();
    const venta = n(r.Venta_Neta ?? r.venta_neta ?? r.VentaNeta ?? r.Venta ?? r.venta ?? r.Neto ?? r.neto ?? r.Ventas ?? 0);
    if (!name || venta <= 0) return;
    if (!prodAgg.has(name)) prodAgg.set(name, { name, venta: 0, tickets: 0, unidades: 0 });
    const p = prodAgg.get(name)!;
    p.venta    += venta;
    p.tickets  += n(r.Tickets  ?? r.tickets  ?? 0);
    p.unidades += n(r.Unidades ?? r.unidades ?? 0);
  });
  const products: HotSaleProduct[] = Array.from(prodAgg.values())
    .sort((a, b) => b.venta - a.venta)
    .slice(0, 10);

  const hourlyCanales: Record<string, (number | null)[]> = {};
  hourlyCanalMap.forEach((arr, name) => { hourlyCanales[name] = arr; });

  const data: HotSaleData = {
    meta, acum, daily,
    hourlyHoy, hourlyAyer, hourlyLabels, lastSlotIdx,
    hourlyCanales,
    canales, depositos, products,
    lastUpdated: new Date(),
  };

  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
  return data;
};
