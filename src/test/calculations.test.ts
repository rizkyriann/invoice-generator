import { describe, it, expect } from 'vitest';
import {
  calculateItemTotal,
  calculateSubtotal,
  calculateInvoiceTotals,
  testWorkedExample,
} from '../utils/calculations';
import type { InvoiceItem, InvoiceTotalsInputs } from '../types/invoice.types';

describe('calculations utils', () => {
  describe('calculateItemTotal', () => {
    it('calculates basic item total', () => {
      const item: InvoiceItem = {
        id: '1',
        description: 'Test',
        quantity: 2,
        unitPrice: 100,
        total: 0,
      };
      expect(calculateItemTotal(item)).toBe(200);
    });

    it('applies percentage discount', () => {
      const item: InvoiceItem = {
        id: '1',
        description: 'Test',
        quantity: 2,
        unitPrice: 100,
        discount: { mode: 'percentage', value: 10 },
        total: 0,
      };
      expect(calculateItemTotal(item)).toBe(180);
    });

    it('applies fixed discount', () => {
      const item: InvoiceItem = {
        id: '1',
        description: 'Test',
        quantity: 2,
        unitPrice: 100,
        discount: { mode: 'fixed', value: 30 },
        total: 0,
      };
      expect(calculateItemTotal(item)).toBe(170);
    });

    it('applies tax', () => {
      const item: InvoiceItem = {
        id: '1',
        description: 'Test',
        quantity: 2,
        unitPrice: 100,
        tax: { label: 'VAT', rate: 10 },
        total: 0,
      };
      expect(calculateItemTotal(item)).toBe(220);
    });

    it('applies discount then tax', () => {
      const item: InvoiceItem = {
        id: '1',
        description: 'Test',
        quantity: 2,
        unitPrice: 100,
        discount: { mode: 'percentage', value: 10 },
        tax: { label: 'VAT', rate: 10 },
        total: 0,
      };
      expect(calculateItemTotal(item)).toBe(198);
    });

    it('handles zero quantity', () => {
      const item: InvoiceItem = {
        id: '1',
        description: 'Test',
        quantity: 0,
        unitPrice: 100,
        total: 0,
      };
      expect(calculateItemTotal(item)).toBe(0);
    });

    it('handles zero price', () => {
      const item: InvoiceItem = {
        id: '1',
        description: 'Test',
        quantity: 5,
        unitPrice: 0,
        total: 0,
      };
      expect(calculateItemTotal(item)).toBe(0);
    });
  });

  describe('calculateSubtotal', () => {
    it('sums item totals correctly', () => {
      const items: InvoiceItem[] = [
        { id: '1', description: 'A', quantity: 1, unitPrice: 100, total: 100 },
        { id: '2', description: 'B', quantity: 2, unitPrice: 50, total: 100 },
        { id: '3', description: 'C', quantity: 1, unitPrice: 75, total: 75 },
      ];
      expect(calculateSubtotal(items)).toBe(275);
    });

    it('handles empty items', () => {
      expect(calculateSubtotal([])).toBe(0);
    });
  });

  describe('calculateInvoiceTotals', () => {
    it('calculates totals without adjustments', () => {
      const items: InvoiceItem[] = [
        { id: '1', description: 'Test', quantity: 2, unitPrice: 100, total: 200 },
      ];
      const totals = calculateInvoiceTotals(items, {});

      expect(totals.subtotal).toBe(200);
      expect(totals.discountAmount).toBe(0);
      expect(totals.taxAmount).toBe(0);
      expect(totals.grandTotal).toBe(200);
      expect(totals.remainingBalance).toBe(200);
    });

    it('applies invoice-level discount', () => {
      const items: InvoiceItem[] = [
        { id: '1', description: 'Test', quantity: 2, unitPrice: 100, total: 200 },
      ];
      const totalsInput: InvoiceTotalsInputs = {
        discount: { mode: 'percentage', value: 10 },
      };
      const totals = calculateInvoiceTotals(items, totalsInput);

      expect(totals.subtotal).toBe(200);
      expect(totals.discountAmount).toBe(20);
      expect(totals.grandTotal).toBe(180);
    });

    it('applies invoice-level tax after discount', () => {
      const items: InvoiceItem[] = [
        { id: '1', description: 'Test', quantity: 2, unitPrice: 100, total: 200 },
      ];
      const totalsInput: InvoiceTotalsInputs = {
        discount: { mode: 'fixed', value: 20 },
        tax: { label: 'VAT', rate: 10 },
      };
      const totals = calculateInvoiceTotals(items, totalsInput);

      expect(totals.subtotal).toBe(200);
      expect(totals.discountAmount).toBe(20);
      expect(totals.taxAmount).toBe(18); // 10% of (200 - 20)
      expect(totals.grandTotal).toBe(198);
    });

    it('includes shipping and calculates remaining balance', () => {
      const items: InvoiceItem[] = [
        { id: '1', description: 'Test', quantity: 1, unitPrice: 100, total: 100 },
      ];
      const totalsInput: InvoiceTotalsInputs = {
        shipping: 10,
        amountPaid: 50,
      };
      const totals = calculateInvoiceTotals(items, totalsInput);

      expect(totals.grandTotal).toBe(110);
      expect(totals.amountPaid).toBe(50);
      expect(totals.remainingBalance).toBe(60);
    });
  });

  describe('testWorkedExample (PRD Section 5.3)', () => {
    it('matches the worked example from PRD', () => {
      const totals = testWorkedExample();

      expect(totals.subtotal).toBeCloseTo(480, 2);
      expect(totals.discountAmount).toBeCloseTo(24, 2);
      expect(totals.taxAmount).toBeCloseTo(50.16, 2);
      expect(totals.shipping).toBe(10);
      expect(totals.grandTotal).toBeCloseTo(521.16, 2);
      expect(totals.amountPaid).toBe(200);
      expect(totals.remainingBalance).toBeCloseTo(321.16, 2);
    });
  });

  describe('edge cases', () => {
    it('handles 100% percentage discount at item level', () => {
      const item: InvoiceItem = {
        id: '1',
        description: 'Free item',
        quantity: 2,
        unitPrice: 100,
        discount: { mode: 'percentage', value: 100 },
        total: 0,
      };
      expect(calculateItemTotal(item)).toBe(0);
    });

    it('handles 100% fixed discount exceeding item price', () => {
      const item: InvoiceItem = {
        id: '1',
        description: 'Test',
        quantity: 1,
        unitPrice: 50,
        discount: { mode: 'fixed', value: 100 },
        total: 0,
      };
      expect(calculateItemTotal(item)).toBe(-50);
    });

    it('handles 100% invoice-level discount', () => {
      const items: InvoiceItem[] = [
        { id: '1', description: 'Test', quantity: 1, unitPrice: 100, total: 100 },
      ];
      const totalsInput: InvoiceTotalsInputs = {
        discount: { mode: 'percentage', value: 100 },
      };
      const totals = calculateInvoiceTotals(items, totalsInput);

      expect(totals.subtotal).toBe(100);
      expect(totals.discountAmount).toBe(100);
      expect(totals.grandTotal).toBe(0);
    });

    it('handles negative balance when amountPaid exceeds grandTotal', () => {
      const items: InvoiceItem[] = [
        { id: '1', description: 'Test', quantity: 1, unitPrice: 100, total: 100 },
      ];
      const totalsInput: InvoiceTotalsInputs = {
        amountPaid: 150,
      };
      const totals = calculateInvoiceTotals(items, totalsInput);

      expect(totals.grandTotal).toBe(100);
      expect(totals.amountPaid).toBe(150);
      expect(totals.remainingBalance).toBe(-50);
    });

    it('handles overpayment with discount', () => {
      const items: InvoiceItem[] = [
        { id: '1', description: 'Test', quantity: 1, unitPrice: 100, total: 100 },
      ];
      const totalsInput: InvoiceTotalsInputs = {
        discount: { mode: 'fixed', value: 30 },
        amountPaid: 100,
      };
      const totals = calculateInvoiceTotals(items, totalsInput);

      expect(totals.grandTotal).toBe(70);
      expect(totals.amountPaid).toBe(100);
      expect(totals.remainingBalance).toBe(-30);
    });

    it('handles multiple items with zero quantity', () => {
      const items: InvoiceItem[] = [
        { id: '1', description: 'A', quantity: 0, unitPrice: 100, total: 0 },
        { id: '2', description: 'B', quantity: 0, unitPrice: 50, total: 0 },
      ];
      const totals = calculateInvoiceTotals(items, {});

      expect(totals.subtotal).toBe(0);
      expect(totals.grandTotal).toBe(0);
    });

    it('handles mixed zero and non-zero quantities', () => {
      const items: InvoiceItem[] = [
        { id: '1', description: 'A', quantity: 0, unitPrice: 100, total: 0 },
        { id: '2', description: 'B', quantity: 2, unitPrice: 50, total: 100 },
      ];
      const totals = calculateInvoiceTotals(items, {});

      expect(totals.subtotal).toBe(100);
      expect(totals.grandTotal).toBe(100);
    });

    it('handles zero-decimal currency amounts (IDR scenario)', () => {
      const items: InvoiceItem[] = [
        { id: '1', description: 'Test', quantity: 1, unitPrice: 50000, total: 50000 },
      ];
      const totalsInput: InvoiceTotalsInputs = {
        discount: { mode: 'percentage', value: 10 },
        tax: { label: 'VAT', rate: 11 },
        shipping: 5000,
      };
      const totals = calculateInvoiceTotals(items, totalsInput);

      expect(totals.subtotal).toBe(50000);
      expect(totals.discountAmount).toBe(5000);
      expect(totals.taxAmount).toBeCloseTo(4950, 0); // 11% of 45000
      expect(totals.grandTotal).toBeCloseTo(54950, 0);
    });
  });
});
