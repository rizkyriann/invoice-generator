import { describe, it, expect } from 'vitest';
import {
  toCents,
  fromCents,
  add,
  subtract,
  multiply,
  divide,
  percentage,
  formatCurrency,
  getDecimalPlaces,
} from '../utils/currency';

describe('currency utils', () => {
  describe('toCents and fromCents', () => {
    it('converts decimal to cents correctly', () => {
      expect(toCents(10.50)).toBe(1050);
      expect(toCents(0.01)).toBe(1);
      expect(toCents(100)).toBe(10000);
    });

    it('converts cents to decimal correctly', () => {
      expect(fromCents(1050)).toBe(10.50);
      expect(fromCents(1)).toBe(0.01);
      expect(fromCents(10000)).toBe(100);
    });

    it('handles rounding properly', () => {
      expect(toCents(10.555)).toBe(1056);
      expect(toCents(10.554)).toBe(1055);
    });
  });

  describe('arithmetic operations', () => {
    it('adds amounts correctly', () => {
      expect(add(10.50, 5.25)).toBe(15.75);
      expect(add(0.1, 0.2)).toBe(0.3);
    });

    it('subtracts amounts correctly', () => {
      expect(subtract(10.50, 5.25)).toBe(5.25);
      expect(subtract(0.3, 0.1)).toBe(0.2);
    });

    it('multiplies correctly', () => {
      expect(multiply(10.50, 2)).toBe(21);
      expect(multiply(10.99, 3)).toBe(32.97);
    });

    it('divides correctly', () => {
      expect(divide(10, 2)).toBe(5);
      expect(divide(10, 3)).toBeCloseTo(3.33, 2);
    });

    it('handles division by zero', () => {
      expect(divide(10, 0)).toBe(0);
    });

    it('calculates percentage correctly', () => {
      expect(percentage(100, 10)).toBe(10);
      expect(percentage(200, 5)).toBe(10);
      expect(percentage(150, 20)).toBe(30);
    });
  });

  describe('getDecimalPlaces', () => {
    it('returns 0 for zero-decimal currencies', () => {
      expect(getDecimalPlaces('IDR')).toBe(0);
      expect(getDecimalPlaces('JPY')).toBe(0);
      expect(getDecimalPlaces('KRW')).toBe(0);
    });

    it('returns 2 for standard currencies', () => {
      expect(getDecimalPlaces('USD')).toBe(2);
      expect(getDecimalPlaces('EUR')).toBe(2);
      expect(getDecimalPlaces('GBP')).toBe(2);
    });
  });

  describe('formatCurrency', () => {
    it('formats USD correctly', () => {
      const result = formatCurrency(1234.56, { code: 'USD', symbol: '$', locale: 'en-US' });
      expect(result).toContain('1,234.56');
    });

    it('formats IDR correctly (no decimals)', () => {
      const result = formatCurrency(1234, { code: 'IDR', symbol: 'Rp', locale: 'id-ID' });
      // IDR uses dot as thousands separator, so "Rp 1.234" is correct
      // We just need to verify no decimal places (not ending with ,00)
      expect(result).toContain('Rp');
      expect(result).not.toMatch(/,\d{2}$/); // No decimal places at end
    });

    it('formats JPY correctly (no decimals)', () => {
      const result = formatCurrency(50000, { code: 'JPY', symbol: '¥', locale: 'ja-JP' });
      expect(result).toContain('50,000');
      expect(result).not.toContain('.');
    });
  });

  describe('edge cases', () => {
    it('handles 100% percentage correctly', () => {
      expect(percentage(100, 100)).toBe(100);
      expect(percentage(250.50, 100)).toBe(250.50);
    });

    it('handles negative results from subtraction', () => {
      expect(subtract(50, 100)).toBe(-50);
      expect(subtract(0, 25.50)).toBe(-25.50);
    });

    it('handles very small amounts', () => {
      expect(add(0.01, 0.01)).toBe(0.02);
      expect(multiply(0.01, 3)).toBe(0.03);
    });

    it('handles large amounts without precision loss', () => {
      expect(add(999999.99, 0.01)).toBe(1000000);
      expect(multiply(100000, 1.5)).toBe(150000);
    });
  });
});
