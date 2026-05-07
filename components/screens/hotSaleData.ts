// Embedded ecommerce data — Hot Sale 2026 · Mayo 1–7
export const DAILY = [
  { label: 'VIE 01/05', short: 'VIE', venta: 20_469_519, tickets: 720,  unidades: 1070 },
  { label: 'SÁB 02/05', short: 'SÁB', venta: 19_151_824, tickets: 679,  unidades: 967  },
  { label: 'DOM 03/05', short: 'DOM', venta: 22_215_715, tickets: 869,  unidades: 1281 },
  { label: 'LUN 04/05', short: 'LUN', venta: 26_867_189, tickets: 873,  unidades: 1325 },
  { label: 'MAR 05/05', short: 'MAR', venta: 31_552_578, tickets: 1150, unidades: 1682 },
  { label: 'MIÉ 06/05', short: 'MIÉ', venta: 27_440_412, tickets: 1093, unidades: 1388 },
  { label: 'JUE 07/05', short: 'JUE', venta:  4_993_423, tickets: 175,  unidades: 230  },
];

// Meta oficial Hot Sale 11–18/05
export const HS_GOAL = {
  venta:    1_179_149_656,
  tickets:  26_293,
  unidades: 98_372,
};

export const CANALES = [
  { name: 'MercadoLibre 1', short: 'ML Cuenta 1', venta: 58_849_310, tickets: 2_312, unidades: 3_280 },
  { name: 'Vtex',           short: 'Vtex',         venta: 56_630_537, tickets: 1_589, unidades: 2_210 },
  { name: 'MercadoLibre 2', short: 'ML Cuenta 2',  venta: 28_697_182, tickets: 1_245, unidades: 1_868 },
  { name: 'La Roche',       short: 'La Roche',      venta:  7_883_462, tickets:   380, unidades:   552 },
  { name: 'ICBC Store',     short: 'ICBC Store',    venta:    630_169, tickets:    33, unidades:    33 },
];

export const DEPOSITOS = [
  { name: 'DDS',                venta: 87_420_000, tickets: 3_200, unidades: 4_539 },
  { name: 'Barracas',           venta: 57_820_000, tickets: 2_100, unidades: 3_012 },
  { name: 'MercadoEnvíos Full', venta:  7_450_660, tickets:   259, unidades:   392 },
];

export const TOP_PRODUCTS = [
  { name: 'Kit Dermaglós Serum 3-en-1',           venta: 3_057_466, unidades: 48 },
  { name: 'Ultraflex Colágeno Hidrolizado x3',     venta: 2_331_200, unidades: 62 },
  { name: 'Nutrilon Profutura 2 (800g)',            venta: 2_054_756, unidades: 44 },
  { name: 'Metabolic Max 60 Cápsulas',             venta: 1_430_269, unidades: 46 },
  { name: 'La Roche Anthelios Toque Seco FPS50+',  venta: 1_391_900, unidades: 41 },
  { name: 'Megacistin Max Anti Caída 30 comp',     venta: 1_390_534, unidades: 67 },
  { name: 'Perpiel Emulsión Humectación 400gr',    venta: 1_378_602, unidades: 86 },
  { name: 'Valcatil Max 120 Cápsulas Blandas',     venta: 1_374_805, unidades: 20 },
];

export const TODAY_IDX = 6; // JUE 07/05
export const LAST_HOUR = 2; // datos hasta 02:59hs

export const HOURLY_TODAY: (number | null)[] = [
  1_682_291, 1_743_661, 1_567_471,
  null, null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null, null, null, null, null,
];
export const HOURLY_YEST: number[] = [
  2_147_895, 2_065_823, 2_178_137, 1_054_773, 400_533, 204_526, 41_011, 71_510,
  106_991, 180_792, 495_851, 844_200, 1_221_910, 2_163_828, 2_035_470, 695_227,
  1_072_771, 1_718_666, 1_568_047, 500_559, 1_179_345, 1_618_717, 1_525_517, 2_348_314,
];
