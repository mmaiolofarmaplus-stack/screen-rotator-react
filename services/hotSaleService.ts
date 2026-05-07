import Papa from 'papaparse';

const HS_SHEET_ID = '1n-hOdYJlztQZlaTRK-l5j0qJOvZCLPHu-tRXqIVojEU';
const CACHE_KEY   = 'farmaplus_hs_v3';
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
  lastUpdated: Date;
}

const n = (v: any): number => {
  if (v === undefined || v === null || v === '') return 0;
  let s = String(v).trim().replace(/[$\s%]/g, '');
  const lD = s.lastIndexOf('.'), lC = s.lastIndexOf(',');
  if (lC > lD)           s = s.replace(/\./g, '').replace(',', '.');
  else if (lD > -1 && s.indexOf('.') !== lD) s = s.replace(/\./g, '');
  else                   s = s.replace(/,/g, '');
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

const sheetUrl = (gid: string) =>
  `https://docs.google.com/spreadsheets/d/${HS_SHEET_ID}/export?format=csv&gid=${gid}&t=${Date.now()}`;

const fetchSheet = async (gid: string): Promise<any[]> => {
  const res = await fetch(sheetUrl(gid));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Papa.parse(await res.text(), { header: true, skipEmptyLines: true }).data;
};

const settle = <T>(p: Promise<T>, fb: T): Promise<T> => p.catch(() => fb);

const DOW = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];

const parseDateMs = (s: string): number => {
  const p = s.split('/');
  if (p.length >= 2) return new Date(+(p[2] || 2026), +p[1] - 1, +p[0]).getTime();
  const p2 = s.split('-');
  if (p2.length === 3) return new Date(+p2[0], +p2[1] - 1, +p2[2]).getTime();
  return 0;
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

  // ── Meta ────────────────────────────────────────────────────────────────────
  const obj0 = objRows[0] ?? {};
  const meta: HotSaleMeta = {
    venta:    g(obj0, 'Meta_Venta','meta_venta','Venta_Meta','Meta Venta','META_VENTA','Objetivo_Venta','objetivo_venta') || 1_179_149_656,
    tickets:  g(obj0, 'Meta_Tickets','meta_tickets','Tickets_Meta','Meta Tickets','Objetivo_Tickets')                    || 26_293,
    unidades: g(obj0, 'Meta_Unidades','meta_unidades','Unidades_Meta','Meta Unidades','Objetivo_Unidades')               || 98_372,
  };

  // ── Facturacion rows ─────────────────────────────────────────────────────────
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

  // Find latest two dates for today/yesterday hourly
  const allDates = [...new Set(
    factRows
      .map((r: any) => String(r.Fecha ?? r.fecha ?? r.FECHA ?? '').trim())
      .filter(Boolean)
  )].sort((a, b) => parseDateMs(a) - parseDateMs(b));
  const todayMs  = allDates.length ? parseDateMs(allDates[allDates.length - 1]) : 0;
  const yesterMs = allDates.length > 1 ? parseDateMs(allDates[allDates.length - 2]) : -1;

  const hourlyHoy:  (number | null)[] = Array(SLOTS).fill(null);
  const hourlyAyer: (number | null)[] = Array(SLOTS).fill(null);
  let lastSlotIdx = 0;

  factRows.forEach((row: any) => {
    const fechaStr = String(row.Fecha ?? row.fecha ?? row.FECHA ?? '').trim();
    if (!fechaStr) return;

    const dateMs   = parseDateMs(fechaStr);
    const parts    = fechaStr.split('/');
    let dayDate: Date | null = null;
    let dayKey = fechaStr;
    if (parts.length >= 2) {
      dayDate = new Date(+(parts[2] || 2026), +parts[1] - 1, +parts[0]);
      dayKey  = `${String(dayDate.getDate()).padStart(2,'0')}/${String(dayDate.getMonth() + 1).padStart(2,'0')}`;
    }

    const canal    = String(row.Canal    ?? row.canal    ?? row.CANAL    ?? '').trim();
    const deposito = String(row.Deposito ?? row.deposito ?? row.DEPOSITO ?? row.Deposito_Origen ?? '').trim();
    const horaStr  = String(row.Hora     ?? row.hora     ?? row.HORA     ?? '0');
    const neto     = n(row.Neto  ?? row.neto  ?? row.Venta  ?? row.venta  ?? 0);
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
      if (!canalMap.has(canal)) {
        const short = canal.replace('MercadoLibre', 'ML').replace('Mercado Libre', 'ML');
        canalMap.set(canal, { name: canal, short, venta: 0, tickets: 0, unidades: 0 });
      }
      const c = canalMap.get(canal)!;
      c.venta += neto; c.tickets += tickets; c.unidades += unidades;
    }

    // Deposito
    if (deposito) {
      if (!depMap.has(deposito)) depMap.set(deposito, { name: deposito, venta: 0, tickets: 0, unidades: 0 });
      const d = depMap.get(deposito)!;
      d.venta += neto; d.tickets += tickets; d.unidades += unidades;
    }

    // Hourly
    const slot = parseSlot(horaStr);
    if (slot >= 0 && slot < SLOTS) {
      if (dateMs === todayMs) {
        hourlyHoy[slot] = (hourlyHoy[slot] ?? 0) + neto;
        if (neto > 0) lastSlotIdx = Math.max(lastSlotIdx, slot);
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

  // Products
  const products: HotSaleProduct[] = prodRows
    .map((r: any) => ({
      name:     String(r.Producto ?? r.producto ?? r.Nombre_Producto ?? r.nombre ?? r.SKU ?? '').trim(),
      venta:    n(r.Venta ?? r.venta ?? r.Neto ?? r.neto ?? r.Ventas ?? 0),
      tickets:  n(r.Tickets ?? r.tickets ?? 0),
      unidades: n(r.Unidades ?? r.unidades ?? 0),
    }))
    .filter((p: HotSaleProduct) => p.name && p.venta > 0)
    .sort((a: HotSaleProduct, b: HotSaleProduct) => b.venta - a.venta)
    .slice(0, 10);

  const data: HotSaleData = {
    meta, acum, daily,
    hourlyHoy, hourlyAyer, hourlyLabels, lastSlotIdx,
    canales, depositos, products,
    lastUpdated: new Date(),
  };

  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
  return data;
};
