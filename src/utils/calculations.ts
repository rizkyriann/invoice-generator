import type { InvoiceItem, Discount, Tax, InvoiceTotalsInputs } from '../types/invoice.types';
import { add, subtract, multiply, percentage } from './currency';

/**
 * Calculate the total for a single invoice item
 */
export function calculateItemTotal(item: InvoiceItem): number {
  // Base amount
  let total = multiply(item.quantity, item.unitPrice);

  // Apply item-level discount
  if (item.discount) {
    const discountAmount =
      item.discount.mode === 'percentage'
        ? percentage(total, item.discount.value)
        : item.discount.value;
    total = subtract(total, discountAmount);
  }

  // Apply item-level tax
  if (item.tax) {
    const taxAmount = percentage(total, item.tax.rate);
    total = add(total, taxAmount);
  }

  return total;
}

/**
 * Calculate the subtotal (sum of all item totals before invoice-level adjustments)
 */
export function calculateSubtotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => add(sum, item.total), 0);
}

/**
 * Calculate invoice-level discount amount
 */
export function calculateInvoiceDiscount(subtotal: number, discount?: Discount): number {
  if (!discount) return 0;
  
  return discount.mode === 'percentage'
    ? percentage(subtotal, discount.value)
    : discount.value;
}

/**
 * Calculate invoice-level tax amount
 */
export function calculateInvoiceTax(amountAfterDiscount: number, tax?: Tax): number {
  if (!tax) return 0;
  return percentage(amountAfterDiscount, tax.rate);
}

/**
 * Calculate shipping and other fees total
 */
export function calculateOtherFees(totalsInputs: InvoiceTotalsInputs): number {
  let fees = totalsInputs.shipping || 0;
  
  if (totalsInputs.otherFees && totalsInputs.otherFees.length > 0) {
    fees = totalsInputs.otherFees.reduce((sum, fee) => add(sum, fee.amount), fees);
  }
  
  return fees;
}

/**
 * Calculate the complete invoice totals breakdown
 */
export interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shipping: number;
  otherFeesTotal: number;
  grandTotal: number;
  amountPaid: number;
  remainingBalance: number;
}

export function calculateInvoiceTotals(
  items: InvoiceItem[],
  totalsInputs: InvoiceTotalsInputs
): InvoiceTotals {
  // Step 1: Calculate subtotal (sum of all item totals)
  const subtotal = calculateSubtotal(items);

  // Step 2: Apply invoice-level discount
  const discountAmount = calculateInvoiceDiscount(subtotal, totalsInputs.discount);
  const afterDiscount = subtract(subtotal, discountAmount);

  // Step 3: Apply invoice-level tax (after discount)
  const taxAmount = calculateInvoiceTax(afterDiscount, totalsInputs.tax);
  const afterTax = add(afterDiscount, taxAmount);

  // Step 4: Add shipping and other fees
  const otherFeesTotal = calculateOtherFees(totalsInputs);
  const grandTotal = add(afterTax, otherFeesTotal);

  // Step 5: Calculate remaining balance
  const amountPaid = totalsInputs.amountPaid || 0;
  const remainingBalance = subtract(grandTotal, amountPaid);

  return {
    subtotal,
    discountAmount,
    taxAmount,
    shipping: totalsInputs.shipping || 0,
    otherFeesTotal,
    grandTotal,
    amountPaid,
    remainingBalance,
  };
}

/**
 * WORKED EXAMPLE (from PRD Section 5.3)
 * This serves as a test fixture for calculations
 * 
 * Item 1: 2 × $150.00, 10% item discount, 0% item tax → $270.00
 *   - Base: 2 × 150 = 300
 *   - Discount: 300 × 0.10 = 30
 *   - After discount: 300 - 30 = 270
 *   - Tax: 0
 *   - Total: 270
 * 
 * Item 2: 5 × $40.00, no discount, 5% item tax → $210.00
 *   - Base: 5 × 40 = 200
 *   - Discount: 0
 *   - Tax: 200 × 0.05 = 10
 *   - Total: 200 + 10 = 210
 * 
 * Subtotal = 270 + 210 = $480.00
 * Invoice-level discount (5% of subtotal) = 480 × 0.05 = $24.00
 * After invoice discount = 480 - 24 = $456.00
 * Invoice-level tax (11%, applied after discount) = 456 × 0.11 = $50.16
 * After tax = 456 + 50.16 = $506.16
 * Shipping = $10.00
 * Other Fees ("Handling") = $5.00
 * Grand Total = 506.16 + 10 + 5 = $521.16
 * Amount Paid = $200.00
 * Remaining Balance = 521.16 - 200 = $321.16
 */
export function testWorkedExample(): InvoiceTotals {
  const items: InvoiceItem[] = [
    {
      id: '1',
      description: 'Item 1',
      quantity: 2,
      unitPrice: 150.0,
      discount: { mode: 'percentage', value: 10 },
      total: 270.0,
    },
    {
      id: '2',
      description: 'Item 2',
      quantity: 5,
      unitPrice: 40.0,
      tax: { label: 'Tax', rate: 5 },
      total: 210.0,
    },
  ];

  const totalsInputs: InvoiceTotalsInputs = {
    discount: { mode: 'percentage', value: 5 },
    tax: { label: 'VAT', rate: 11 },
    shipping: 10.0,
    otherFees: [{ label: 'Handling', amount: 5.0 }],
    amountPaid: 200.0,
  };

  return calculateInvoiceTotals(items, totalsInputs);
}
