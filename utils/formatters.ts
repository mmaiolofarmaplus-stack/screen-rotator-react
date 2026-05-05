export const formatPct = (value: number, decimals = 1): string =>
  value.toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const formatMillions = (value: number): string =>
  `$ ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)}`;

