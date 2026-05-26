export const APP_CURRENCY_CODE = 'AOA';
export const APP_CURRENCY_SYMBOL = 'Kz';

export function formatAOA(value: number): string {
  return `${Number(value || 0).toLocaleString('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${APP_CURRENCY_SYMBOL}`;
}

export function formatAOAFull(value: number): string {
  return `${Number(value || 0).toLocaleString('pt-AO', {
    maximumFractionDigits: 0,
  })} ${APP_CURRENCY_SYMBOL}`;
}

export function formatarOrcamento(valor: number): string {
  const value = Number(valor || 0);
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B ${APP_CURRENCY_SYMBOL}`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M ${APP_CURRENCY_SYMBOL}`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K ${APP_CURRENCY_SYMBOL}`;
  return `${value.toLocaleString('pt-AO', { maximumFractionDigits: 0 })} ${APP_CURRENCY_SYMBOL}`;
}

export function formatAOACompact(value: number): string {
  return formatarOrcamento(value);
}

export function formatCurrencyCode(value: number, code: string): string {
  return `${Number(value || 0).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${code}`;
}
