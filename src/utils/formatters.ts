/**
 * Financial Number Formatters & Parsers
 * Supports both International (1,234,567.89) and Indian (12,34,567.89) numbering formats,
 * with currency symbols, scaling options, and 2 decimal places.
 */

import { CurrencyCode, DisplayScale, FormattingConfig, NumberSystem } from '../types/pnl';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  NONE: ''
};

/**
 * Formats a raw number into Indian Numbering System (e.g., 12,34,567.89)
 */
export function formatIndianNumber(val: number, decimals: number = 2): string {
  if (isNaN(val)) return '0.00';
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  
  const fixed = absVal.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  
  if (intPart.length <= 3) {
    const res = decPart ? `${intPart}.${decPart}` : intPart;
    return isNegative ? `-${res}` : res;
  }
  
  // Last 3 digits
  const lastThree = intPart.substring(intPart.length - 3);
  const otherDigits = intPart.substring(0, intPart.length - 3);
  
  // Regex to add commas every 2 digits in the remaining part
  const formattedOthers = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const res = `${formattedOthers},${lastThree}${decPart ? `.${decPart}` : ''}`;
  
  return isNegative ? `-${res}` : res;
}

/**
 * Formats a raw number into International Numbering System (e.g., 1,234,567.89)
 */
export function formatInternationalNumber(val: number, decimals: number = 2): string {
  if (isNaN(val)) return '0.00';
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  
  const fixed = absVal.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const res = `${formattedInt}${decPart ? `.${decPart}` : ''}`;
  
  return isNegative ? `-${res}` : res;
}

/**
 * Formats a financial figure based on system configuration
 */
export function formatFinancialValue(
  value: number | null | undefined,
  config: FormattingConfig
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  let scaledValue = value;
  let scaleSuffix = '';

  if (config.scale === 'thousands') {
    scaledValue = value / 1000;
    scaleSuffix = ' K';
  } else if (config.scale === 'millions') {
    scaledValue = value / 1000000;
    scaleSuffix = ' M';
  } else if (config.scale === 'lakhs') {
    scaledValue = value / 100000;
    scaleSuffix = ' L';
  } else if (config.scale === 'crores') {
    scaledValue = value / 10000000;
    scaleSuffix = ' Cr';
  }

  const decimals = config.showDecimals ? 2 : 0;
  const formattedNum =
    config.numberSystem === 'indian'
      ? formatIndianNumber(scaledValue, decimals)
      : formatInternationalNumber(scaledValue, decimals);

  const symbol = CURRENCY_SYMBOLS[config.currency] || '';
  const prefix = symbol ? `${symbol} ` : '';

  return `${prefix}${formattedNum}${scaleSuffix}`;
}

/**
 * Formats percentage with 1 or 2 decimals
 */
export function formatPercent(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  return `${value.toFixed(decimals)}%`;
}

/**
 * Parses user input string (which can be standard, Indian, with commas, suffixes, or currency symbols)
 * into a valid float number.
 */
export function parseFinancialInput(input: string | number): number {
  if (typeof input === 'number') {
    return isNaN(input) ? 0 : input;
  }
  if (!input) return 0;

  let str = input.toString().trim();
  
  // Check for accounting parentheses: (123.45) => -123.45
  let isNegative = false;
  if (str.startsWith('(') && str.endsWith(')')) {
    isNegative = true;
    str = str.slice(1, -1).trim();
  } else if (str.startsWith('-')) {
    isNegative = true;
    str = str.substring(1).trim();
  }

  // Remove currency symbols, spaces, commas
  str = str.replace(/[₹$€£\s,]/g, '');

  // Check for scaling multipliers (K, M, B, L, Cr)
  let multiplier = 1;
  const upper = str.toUpperCase();
  if (upper.endsWith('CR') || upper.endsWith('CRORE') || upper.endsWith('CRORES')) {
    multiplier = 10000000;
    str = str.replace(/(CR|CRORE|CRORES)/i, '');
  } else if (upper.endsWith('L') || upper.endsWith('LAC') || upper.endsWith('LAKH')) {
    multiplier = 100000;
    str = str.replace(/(L|LAC|LAKH)/i, '');
  } else if (upper.endsWith('M') || upper.endsWith('MN')) {
    multiplier = 1000000;
    str = str.replace(/(MN|M)/i, '');
  } else if (upper.endsWith('B') || upper.endsWith('BN')) {
    multiplier = 1000000000;
    str = str.replace(/(BN|B)/i, '');
  } else if (upper.endsWith('K')) {
    multiplier = 1000;
    str = str.replace(/K/i, '');
  }

  const parsed = parseFloat(str);
  if (isNaN(parsed)) return 0;
  
  const finalVal = parsed * multiplier;
  return isNegative ? -finalVal : finalVal;
}
