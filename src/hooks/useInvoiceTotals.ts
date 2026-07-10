import { useMemo } from 'react';
import { useInvoiceStore } from '../store/invoiceStore';
import { calculateInvoiceTotals, calculateItemTotal } from '../utils/calculations';

/**
 * Hook that provides memoized invoice totals
 * Recalculates only when items or totals inputs change
 */
export function useInvoiceTotals() {
  const invoice = useInvoiceStore((state) => state.invoice);

  return useMemo(() => {
    // Recalculate item totals first
    const itemsWithTotals = invoice.items.map((item) => ({
      ...item,
      total: calculateItemTotal(item),
    }));

    // Calculate invoice totals
    const totals = calculateInvoiceTotals(itemsWithTotals, invoice.totals);

    return {
      items: itemsWithTotals,
      ...totals,
    };
  }, [invoice.items, invoice.totals]);
}
