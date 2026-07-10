import type { Invoice } from '../types/invoice.types';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/dateFormat';
import { useInvoiceTotals } from '../hooks/useInvoiceTotals';

interface TemplateModernProps {
  invoice: Invoice;
}

export default function TemplateModern({ invoice }: TemplateModernProps) {
  const totals = useInvoiceTotals();

  return (
    <div className="mx-auto w-full max-w-[794px] bg-white text-gray-900">
      {/* Header - Bold with purple accent */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-12 text-white">
        <div className="flex items-start justify-between">
          <div>
            {invoice.business.logoDataUrl && (
              <img
                src={invoice.business.logoDataUrl}
                alt={invoice.business.name}
                className="mb-4 h-14 object-contain object-left brightness-0 invert"
              />
            )}
            <h1 className="text-3xl font-bold">{invoice.business.name}</h1>
            <div className="mt-3 space-y-1 text-sm text-purple-100">
              {invoice.business.email && <p>{invoice.business.email}</p>}
              {invoice.business.phone && <p>{invoice.business.phone}</p>}
              {invoice.business.website && <p>{invoice.business.website}</p>}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black">INVOICE</h2>
            <p className="mt-3 text-xl font-bold">#{invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>

      <div className="p-12">
        {/* Dates and Bill To - Side by side */}
        <div className="mb-10 grid grid-cols-2 gap-8">
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Invoice Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Issue Date:</span>
                <span className="ml-2 text-gray-900">{formatDate(invoice.issueDate)}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Due Date:</span>
                <span className="ml-2 text-gray-900">{formatDate(invoice.dueDate)}</span>
              </div>
              {invoice.paymentTerms && (
                <div>
                  <span className="font-semibold text-gray-700">Terms:</span>
                  <span className="ml-2 text-gray-900">{invoice.paymentTerms}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Bill To</h3>
            <div className="text-sm">
              <p className="text-lg font-bold text-gray-900">{invoice.client.name}</p>
              {invoice.client.company && <p className="font-medium text-gray-700">{invoice.client.company}</p>}
              {invoice.client.email && <p className="text-gray-600">{invoice.client.email}</p>}
              {invoice.client.phone && <p className="text-gray-600">{invoice.client.phone}</p>}
              {invoice.client.address && (
                <p className="mt-2 whitespace-pre-line text-gray-600">{invoice.client.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Line Items - Bold headers */}
        <div className="mb-10">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                  Item
                </th>
                <th className="p-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700">
                  Qty
                </th>
                <th className="p-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700">
                  Rate
                </th>
                <th className="p-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {totals.items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 text-sm">
                    <div className="font-semibold text-gray-900">{item.description}</div>
                    {item.discount && (
                      <div className="text-xs text-purple-600">
                        Discount: {item.discount.mode === 'percentage' ? `${item.discount.value}%` : formatCurrency(item.discount.value, invoice.currency)}
                      </div>
                    )}
                    {item.tax && (
                      <div className="text-xs text-gray-500">
                        {item.tax.label}: {item.tax.rate}%
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-right text-sm text-gray-700">{item.quantity}</td>
                  <td className="p-3 text-right text-sm text-gray-700">
                    {formatCurrency(item.unitPrice, invoice.currency)}
                  </td>
                  <td className="p-3 text-right text-sm font-semibold text-gray-900">
                    {formatCurrency(item.total, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals - Colored block on right */}
        <div className="mb-10 flex justify-end">
          <div className="w-96 overflow-hidden rounded-lg border-2 border-purple-200">
            <div className="space-y-3 p-6">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(totals.subtotal, invoice.currency)}</span>
              </div>

              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    Discount {invoice.totals.discount?.mode === 'percentage' ? `(${invoice.totals.discount.value}%)` : ''}
                  </span>
                  <span className="text-red-600">-{formatCurrency(totals.discountAmount, invoice.currency)}</span>
                </div>
              )}

              {totals.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {invoice.totals.tax?.label || 'Tax'} ({invoice.totals.tax?.rate}%)
                  </span>
                  <span className="text-gray-900">{formatCurrency(totals.taxAmount, invoice.currency)}</span>
                </div>
              )}

              {totals.shipping > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">Shipping</span>
                  <span className="text-gray-900">{formatCurrency(totals.shipping, invoice.currency)}</span>
                </div>
              )}
            </div>

            <div className="bg-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">TOTAL DUE</span>
                <span className="text-3xl font-black">{formatCurrency(totals.grandTotal, invoice.currency)}</span>
              </div>
            </div>

            {totals.amountPaid > 0 && (
              <div className="space-y-3 p-6">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">Amount Paid</span>
                  <span className="text-gray-900">{formatCurrency(totals.amountPaid, invoice.currency)}</span>
                </div>
                <div className="flex justify-between border-t-2 border-purple-200 pt-3">
                  <span className="text-lg font-bold text-gray-900">Balance Due</span>
                  <span className="text-2xl font-bold text-red-600">{formatCurrency(totals.remainingBalance, invoice.currency)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-6 border-t-2 border-gray-200 pt-8">
          {invoice.notes && (
            <div>
              <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-700">Notes</h4>
              <p className="whitespace-pre-line text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}

          {invoice.termsAndConditions && (
            <div>
              <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-700">Terms & Conditions</h4>
              <p className="whitespace-pre-line text-sm text-gray-600">{invoice.termsAndConditions}</p>
            </div>
          )}

          {(invoice.extras?.signatureDataUrl || invoice.extras?.qrCodePayload) && (
            <div className="flex items-end justify-between pt-6">
              {invoice.extras.signatureDataUrl && (
                <div>
                  <img src={invoice.extras.signatureDataUrl} alt="Signature" className="mb-2 h-16 object-contain" />
                  <div className="h-px w-48 bg-gray-300"></div>
                  <p className="mt-1 text-xs font-medium text-gray-500">AUTHORIZED SIGNATURE</p>
                </div>
              )}
              {invoice.extras.qrCodePayload && (
                <div className="text-center">
                  <div className="mb-2 inline-block h-24 w-24 rounded bg-gray-100"></div>
                  <p className="text-xs font-medium text-gray-500">SCAN TO PAY</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
