import type { Invoice } from '../types/invoice.types';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/dateFormat';
import { useInvoiceTotals } from '../hooks/useInvoiceTotals';

interface TemplateCorporateProps {
  invoice: Invoice;
}

export default function TemplateCorporate({ invoice }: TemplateCorporateProps) {
  const totals = useInvoiceTotals();

  return (
    <div className="mx-auto w-full max-w-[794px] bg-white text-gray-900">
      {/* Header - Structured with blue accent */}
      <div className="border-b-4 border-blue-600 bg-gray-50 p-12">
        <div className="mb-6 grid grid-cols-2 gap-8">
          <div>
            {invoice.business.logoDataUrl && (
              <img
                src={invoice.business.logoDataUrl}
                alt={invoice.business.name}
                className="mb-4 h-12 object-contain object-left"
              />
            )}
            <h1 className="text-2xl font-semibold text-gray-900">{invoice.business.name}</h1>
            <div className="mt-3 space-y-1 text-xs text-gray-600">
              {invoice.business.address && (
                <p className="whitespace-pre-line">{invoice.business.address}</p>
              )}
              {invoice.business.email && <p>{invoice.business.email}</p>}
              {invoice.business.phone && <p>{invoice.business.phone}</p>}
              {invoice.business.website && <p>{invoice.business.website}</p>}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold uppercase tracking-wide text-blue-600">Invoice</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold text-gray-700">Invoice Number:</span>
                <span className="text-gray-900">{invoice.invoiceNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold text-gray-700">Issue Date:</span>
                <span className="text-gray-900">{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-semibold text-gray-700">Due Date:</span>
                <span className="text-gray-900">{formatDate(invoice.dueDate)}</span>
              </div>
              {invoice.paymentTerms && (
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-semibold text-gray-700">Terms:</span>
                  <span className="text-gray-900">{invoice.paymentTerms}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-12">
        {/* Bill To - Clean box */}
        <div className="mb-8 rounded border border-gray-300 bg-gray-50 p-6">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-600">Bill To</h3>
          <div className="text-sm">
            <p className="text-base font-semibold text-gray-900">{invoice.client.name}</p>
            {invoice.client.company && <p className="text-gray-700">{invoice.client.company}</p>}
            {invoice.client.address && (
              <p className="mt-2 whitespace-pre-line text-gray-600">{invoice.client.address}</p>
            )}
            {invoice.client.email && <p className="mt-2 text-gray-600">{invoice.client.email}</p>}
            {invoice.client.phone && <p className="text-gray-600">{invoice.client.phone}</p>}
          </div>
        </div>

        {/* Line Items - Structured table */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border-r border-blue-500 p-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Description
                </th>
                <th className="border-r border-blue-500 p-3 text-center text-xs font-semibold uppercase tracking-wide">
                  Quantity
                </th>
                <th className="border-r border-blue-500 p-3 text-right text-xs font-semibold uppercase tracking-wide">
                  Unit Price
                </th>
                <th className="p-3 text-right text-xs font-semibold uppercase tracking-wide">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {totals.items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border-b border-r border-gray-300 p-3 text-sm">
                    <div className="font-medium text-gray-900">{item.description}</div>
                    {item.discount && (
                      <div className="text-xs text-blue-600">
                        Discount: {item.discount.mode === 'percentage' ? `${item.discount.value}%` : formatCurrency(item.discount.value, invoice.currency)}
                      </div>
                    )}
                    {item.tax && (
                      <div className="text-xs text-gray-600">
                        {item.tax.label}: {item.tax.rate}%
                      </div>
                    )}
                  </td>
                  <td className="border-b border-r border-gray-300 p-3 text-center text-sm text-gray-700">
                    {item.quantity}
                  </td>
                  <td className="border-b border-r border-gray-300 p-3 text-right text-sm text-gray-700">
                    {formatCurrency(item.unitPrice, invoice.currency)}
                  </td>
                  <td className="border-b border-gray-300 p-3 text-right text-sm font-semibold text-gray-900">
                    {formatCurrency(item.total, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals - Structured grid */}
        <div className="mb-8 flex justify-end">
          <div className="w-96">
            <div className="rounded border border-gray-300">
              <div className="space-y-0">
                <div className="flex justify-between border-b border-gray-300 bg-gray-50 p-3">
                  <span className="text-sm font-semibold text-gray-700">Subtotal</span>
                  <span className="text-sm text-gray-900">{formatCurrency(totals.subtotal, invoice.currency)}</span>
                </div>

                {totals.discountAmount > 0 && (
                  <div className="flex justify-between border-b border-gray-300 bg-white p-3">
                    <span className="text-sm text-gray-700">
                      Discount {invoice.totals.discount?.mode === 'percentage' ? `(${invoice.totals.discount.value}%)` : ''}
                    </span>
                    <span className="text-sm text-red-600">-{formatCurrency(totals.discountAmount, invoice.currency)}</span>
                  </div>
                )}

                {totals.taxAmount > 0 && (
                  <div className="flex justify-between border-b border-gray-300 bg-white p-3">
                    <span className="text-sm text-gray-700">
                      {invoice.totals.tax?.label || 'Tax'} ({invoice.totals.tax?.rate}%)
                    </span>
                    <span className="text-sm text-gray-900">{formatCurrency(totals.taxAmount, invoice.currency)}</span>
                  </div>
                )}

                {totals.shipping > 0 && (
                  <div className="flex justify-between border-b border-gray-300 bg-white p-3">
                    <span className="text-sm text-gray-700">Shipping</span>
                    <span className="text-sm text-gray-900">{formatCurrency(totals.shipping, invoice.currency)}</span>
                  </div>
                )}

                <div className="flex justify-between bg-blue-600 p-4 text-white">
                  <span className="text-base font-bold uppercase">Total</span>
                  <span className="text-xl font-bold">{formatCurrency(totals.grandTotal, invoice.currency)}</span>
                </div>

                {totals.amountPaid > 0 && (
                  <>
                    <div className="flex justify-between border-b border-gray-300 bg-gray-50 p-3">
                      <span className="text-sm font-semibold text-gray-700">Amount Paid</span>
                      <span className="text-sm text-gray-900">{formatCurrency(totals.amountPaid, invoice.currency)}</span>
                    </div>
                    <div className="flex justify-between bg-red-50 p-4">
                      <span className="text-base font-bold text-gray-900">Balance Due</span>
                      <span className="text-xl font-bold text-red-600">{formatCurrency(totals.remainingBalance, invoice.currency)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Formal sections */}
        <div className="space-y-6">
          {invoice.notes && (
            <div className="rounded border border-gray-300 bg-gray-50 p-4">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">Notes</h4>
              <p className="whitespace-pre-line text-sm text-gray-700">{invoice.notes}</p>
            </div>
          )}

          {invoice.termsAndConditions && (
            <div className="rounded border border-gray-300 bg-gray-50 p-4">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">Terms & Conditions</h4>
              <p className="whitespace-pre-line text-sm text-gray-700">{invoice.termsAndConditions}</p>
            </div>
          )}

          {(invoice.extras?.signatureDataUrl || invoice.extras?.qrCodePayload) && (
            <div className="flex items-end justify-between border-t-2 border-gray-300 pt-6">
              {invoice.extras.signatureDataUrl && (
                <div>
                  <img src={invoice.extras.signatureDataUrl} alt="Signature" className="mb-3 h-16 object-contain" />
                  <div className="h-px w-48 bg-gray-400"></div>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-600">Authorized Signature</p>
                </div>
              )}
              {invoice.extras.qrCodePayload && (
                <div className="text-center">
                  <div className="mb-2 inline-block h-24 w-24 rounded border-2 border-gray-300 bg-gray-100"></div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Payment QR Code</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
