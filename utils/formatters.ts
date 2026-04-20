export const formatPct = (value: number, decimals = 1): string =>
  value.toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatMillions = (value: number): string =>
  `$ ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)}`;

export const formatThousands = (value: number): string => {
  const k = value / 1000;
  return `$ ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(k)}K`;
};
