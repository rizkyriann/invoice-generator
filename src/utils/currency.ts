import type { Currency } from '../types/invoice.types';

/**
 * Currency utilities with integer-cent safe arithmetic
 * All monetary values are handled as cents internally to avoid floating-point errors
 */

/**
 * Convert a decimal amount to cents (integer)
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert cents back to decimal amount
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Add two monetary amounts safely
 */
export function add(a: number, b: number): number {
  return fromCents(toCents(a) + toCents(b));
}

/**
 * Subtract two monetary amounts safely
 */
export function subtract(a: number, b: number): number {
  return fromCents(toCents(a) - toCents(b));
}

/**
 * Multiply amount by a factor safely
 */
export function multiply(amount: number, factor: number): number {
  return fromCents(Math.round(toCents(amount) * factor));
}

/**
 * Divide amount by a divisor safely
 */
export function divide(amount: number, divisor: number): number {
  if (divisor === 0) return 0;
  return fromCents(Math.round(toCents(amount) / divisor));
}

/**
 * Calculate percentage of an amount
 */
export function percentage(amount: number, percent: number): number {
  return multiply(amount, percent / 100);
}

/**
 * Format a monetary amount according to currency settings
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const formatter = new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: getDecimalPlaces(currency.code),
    maximumFractionDigits: getDecimalPlaces(currency.code),
  });

  return formatter.format(amount);
}

/**
 * Get decimal places for a currency code
 * Some currencies like IDR and JPY don't use decimal places
 */
export function getDecimalPlaces(currencyCode: string): number {
  const zeroDecimalCurrencies = ['JPY', 'KRW', 'IDR', 'CLP', 'VND'];
  return zeroDecimalCurrencies.includes(currencyCode.toUpperCase()) ? 0 : 2;
}

/**
 * Parse a currency string back to number
 */
export function parseCurrency(value: string): number {
  // Remove all non-numeric characters except decimal point and minus
  const cleaned = value.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Round to currency precision
 */
export function roundToCurrency(amount: number, currencyCode: string): number {
  const decimals = getDecimalPlaces(currencyCode);
  if (decimals === 0) {
    return Math.round(amount);
  }
  return fromCents(toCents(amount));
}
