import { useEffect, useState } from 'react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { useInvoiceTotals } from '../../hooks/useInvoiceTotals';
import { Input } from '../../components/ui';
import { formatCurrency } from '../../utils/currency';
import type { Discount, Tax } from '../../types/invoice.types';

export default function TotalsSection() {
  const currency = useInvoiceStore((state) => state.invoice.currency);
  const totalsInput = useInvoiceStore((state) => state.invoice.totals);
  const updateTotalsInput = useInvoiceStore((state) => state.updateTotalsInput);
  
  const totals = useInvoiceTotals();

  const [localInputs, setLocalInputs] = useState({
    discount: totalsInput.discount,
    tax: totalsInput.tax,
    shipping: totalsInput.shipping || 0,
    amountPaid: totalsInput.amountPaid || 0,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      updateTotalsInput(localInputs);
    }, 300);
    return () => clearTimeout(handler);
  }, [localInputs, updateTotalsInput]);

  const handleDiscountUpdate = (updates: Partial<Discount>) => {
    setLocalInputs({
      ...localInputs,
      discount: { ...(localInputs.discount || { mode: 'percentage', value: 0 }), ...updates },
    });
  };

  const handleTaxUpdate = (updates: Partial<Tax>) => {
    setLocalInputs({
      ...localInputs,
      tax: { ...(localInputs.tax || { label: 'Tax', rate: 0 }), ...updates },
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text">Totals</h2>

      <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="text-sm text-text-secondary">Subtotal</span>
          <span className="font-medium text-text">
            {formatCurrency(totals.subtotal, currency)}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-secondary">Invoice Discount</label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleDiscountUpdate({ mode: 'percentage' })}
                className={`rounded px-2 py-1 text-xs ${
                  localInputs.discount?.mode === 'percentage'
                    ? 'bg-primary text-white'
                    : 'bg-surface-tertiary text-text-secondary'
                }`}
              >
                %
              </button>
              <button
                type="button"
                onClick={() => handleDiscountUpdate({ mode: 'fixed' })}
                className={`rounded px-2 py-1 text-xs ${
                  localInputs.discount?.mode === 'fixed'
                    ? 'bg-primary text-white'
                    : 'bg-surface-tertiary text-text-secondary'
                }`}
              >
                {currency.symbol}
              </button>
            </div>
          </div>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={localInputs.discount?.value || 0}
            onChange={(e) =>
              handleDiscountUpdate({ value: parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
          />
          {totals.discountAmount > 0 && (
            <div className="flex justify-end text-xs text-danger">
              -{formatCurrency(totals.discountAmount, currency)}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Invoice Tax (%)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={localInputs.tax?.rate || 0}
            onChange={(e) => handleTaxUpdate({ rate: parseFloat(e.target.value) || 0 })}
            placeholder="0"
          />
          {totals.taxAmount > 0 && (
            <div className="flex justify-end text-xs text-success">
              +{formatCurrency(totals.taxAmount, currency)}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Shipping</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={localInputs.shipping}
            onChange={(e) =>
              setLocalInputs({ ...localInputs, shipping: parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
          />
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="font-semibold text-text">Grand Total</span>
          <span className="text-xl font-bold text-text">
            {formatCurrency(totals.grandTotal, currency)}
          </span>
        </div>

        <div className="space-y-2 border-t border-border pt-3">
          <label className="text-sm font-medium text-text-secondary">Amount Paid</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={localInputs.amountPaid}
            onChange={(e) =>
              setLocalInputs({ ...localInputs, amountPaid: parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg bg-primary-light p-3">
          <span className="font-semibold text-text">Remaining Balance</span>
          <span className="text-xl font-bold text-primary">
            {formatCurrency(totals.remainingBalance, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
