export const APP_CURRENCY_CODE = 'AOA';
export const APP_CURRENCY_SYMBOL = 'Kz';

export function formatAOA(value: number): string {
  return `${Number(value || 0).toLocaleString('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${APP_CURRENCY_SYMBOL}`;
}

export function formatAOACompact(value: number): string {
  return `${Number(value || 0).toLocaleString('pt-AO', {
    maximumFractionDigits: 0,
  })} ${APP_CURRENCY_SYMBOL}`;
}

export function formatCurrencyCode(value: number, code: string): string {
  return `${Number(value || 0).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${code}`;
}
