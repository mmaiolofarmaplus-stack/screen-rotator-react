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

export const formatMillions = (value: number): string => {
  if (value >= 1000000) {
    const millions = value / 1000000;
    return `$ ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(millions)}M`;
  }
  return formatCurrency(value);
};
