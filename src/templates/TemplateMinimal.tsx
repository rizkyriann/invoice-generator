import type { Invoice } from '../types/invoice.types';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/dateFormat';
import { useInvoiceTotals } from '../hooks/useInvoiceTotals';

interface TemplateMinimalProps {
  invoice: Invoice;
}

export default function TemplateMinimal({ invoice }: TemplateMinimalProps) {
  const totals = useInvoiceTotals();

  return (
    <div className="mx-auto w-full max-w-[794px] bg-white p-12 text-gray-900">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between border-b border-gray-200 pb-6">
        <div>
          {invoice.business.logoDataUrl && (
            <img
              src={invoice.business.logoDataUrl}
              alt={invoice.business.name}
              className="mb-3 h-16 object-contain object-left"
            />
          )}
          <h1 className="text-2xl font-bold text-gray-900">{invoice.business.name}</h1>
          {invoice.business.email && <p className="text-sm text-gray-600">{invoice.business.email}</p>}
          {invoice.business.phone && <p className="text-sm text-gray-600">{invoice.business.phone}</p>}
          {invoice.business.website && <p className="text-sm text-gray-600">{invoice.business.website}</p>}
          {invoice.business.address && (
            <p className="mt-2 whitespace-pre-line text-sm text-gray-600">{invoice.business.address}</p>
          )}
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-indigo-600">INVOICE</h2>
          <p className="mt-2 text-sm font-medium text-gray-600">#{invoice.invoiceNumber}</p>
          <div className="mt-4 space-y-1 text-sm">
            <p className="text-gray-600">
              <span className="font-medium">Issue Date:</span> {formatDate(invoice.issueDate)}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Due Date:</span> {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-8">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Bill To</h3>
        <div className="text-sm">
          <p className="font-semibold text-gray-900">{invoice.client.name}</p>
          {invoice.client.company && <p className="text-gray-600">{invoice.client.company}</p>}
          {invoice.client.email && <p className="text-gray-600">{invoice.client.email}</p>}
          {invoice.client.phone && <p className="text-gray-600">{invoice.client.phone}</p>}
          {invoice.client.address && (
            <p className="mt-1 whitespace-pre-line text-gray-600">{invoice.client.address}</p>
          )}
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Description
              </th>
              <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Qty
              </th>
              <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Price
              </th>
              <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {totals.items.map((item, index) => (
              <tr key={item.id} className={index > 0 ? 'border-t border-gray-100' : ''}>
                <td className="py-3 text-sm text-gray-900">
                  <div>{item.description}</div>
                  {item.discount && (
                    <div className="text-xs text-gray-500">
                      Discount: {item.discount.mode === 'percentage' ? `${item.discount.value}%` : formatCurrency(item.discount.value, invoice.currency)}
                    </div>
                  )}
                  {item.tax && (
                    <div className="text-xs text-gray-500">
                      {item.tax.label}: {item.tax.rate}%
                    </div>
                  )}
                </td>
                <td className="py-3 text-right text-sm text-gray-900">{item.quantity}</td>
                <td className="py-3 text-right text-sm text-gray-900">
                  {formatCurrency(item.unitPrice, invoice.currency)}
                </td>
                <td className="py-3 text-right text-sm font-medium text-gray-900">
                  {formatCurrency(item.total, invoice.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mb-8 flex justify-end">
        <div className="w-80 space-y-2">
          <div className="flex justify-between border-b border-gray-200 pb-2 text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">{formatCurrency(totals.subtotal, invoice.currency)}</span>
          </div>

          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Discount {invoice.totals.discount?.mode === 'percentage' ? `(${invoice.totals.discount.value}%)` : ''}
              </span>
              <span className="text-red-600">-{formatCurrency(totals.discountAmount, invoice.currency)}</span>
            </div>
          )}

          {totals.taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {invoice.totals.tax?.label || 'Tax'} ({invoice.totals.tax?.rate}%)
              </span>
              <span className="text-gray-900">{formatCurrency(totals.taxAmount, invoice.currency)}</span>
            </div>
          )}

          {totals.shipping > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900">{formatCurrency(totals.shipping, invoice.currency)}</span>
            </div>
          )}

          <div className="flex justify-between border-t-2 border-gray-300 pt-2 text-base font-semibold">
            <span className="text-gray-900">Total</span>
            <span className="text-indigo-600">{formatCurrency(totals.grandTotal, invoice.currency)}</span>
          </div>

          {totals.amountPaid > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount Paid</span>
                <span className="text-gray-900">{formatCurrency(totals.amountPaid, invoice.currency)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-2 text-base font-semibold">
                <span className="text-gray-900">Balance Due</span>
                <span className="text-red-600">{formatCurrency(totals.remainingBalance, invoice.currency)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-4 border-t border-gray-200 pt-6">
        {invoice.paymentTerms && (
          <div>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Payment Terms</h4>
            <p className="text-sm text-gray-600">{invoice.paymentTerms}</p>
          </div>
        )}

        {invoice.notes && (
          <div>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Notes</h4>
            <p className="whitespace-pre-line text-sm text-gray-600">{invoice.notes}</p>
          </div>
        )}

        {invoice.termsAndConditions && (
          <div>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Terms & Conditions</h4>
            <p className="whitespace-pre-line text-sm text-gray-600">{invoice.termsAndConditions}</p>
          </div>
        )}

        {(invoice.extras?.signatureDataUrl || invoice.extras?.stampDataUrl || invoice.extras?.qrCodePayload) && (
          <div className="flex items-end justify-between">
            {invoice.extras.signatureDataUrl && (
              <div>
                <img src={invoice.extras.signatureDataUrl} alt="Signature" className="mb-2 h-16 object-contain" />
                <p className="text-xs text-gray-500">Authorized Signature</p>
              </div>
            )}
            {invoice.extras.qrCodePayload && (
              <div className="text-center">
                <div className="mb-2 inline-block h-24 w-24 bg-gray-100"></div>
                <p className="text-xs text-gray-500">Scan to Pay</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
