import { useEffect, useState } from 'react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { Input, TextArea, Select, DatePicker } from '../../components/ui';
import { CURRENCIES } from '../../constants/currencies';
import { PAYMENT_TERM_PRESETS, calculateDueDate } from '../../utils/dateFormat';

export default function InvoiceDetailsSection() {
  const invoice = useInvoiceStore((state) => state.invoice);
  const updateInvoiceDetails = useInvoiceStore((state) => state.updateInvoiceDetails);

  const [localDetails, setLocalDetails] = useState({
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    currency: invoice.currency,
    language: invoice.language,
    paymentTerms: invoice.paymentTerms,
    notes: invoice.notes || '',
    termsAndConditions: invoice.termsAndConditions || '',
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      updateInvoiceDetails(localDetails);
    }, 300);
    return () => clearTimeout(handler);
  }, [localDetails, updateInvoiceDetails]);

  const handlePaymentTermsPreset = (terms: string, days: number) => {
    const newDueDate = calculateDueDate(localDetails.issueDate, terms);
    setLocalDetails({
      ...localDetails,
      paymentTerms: terms,
      dueDate: newDueDate,
    });
  };

  const handleIssueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIssueDate = e.target.value;
    const newDueDate = calculateDueDate(newIssueDate, localDetails.paymentTerms);
    setLocalDetails({
      ...localDetails,
      issueDate: newIssueDate,
      dueDate: newDueDate,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text">Invoice Details</h2>

      <Input
        label="Invoice Number"
        value={localDetails.invoiceNumber}
        onChange={(e) =>
          setLocalDetails({ ...localDetails, invoiceNumber: e.target.value })
        }
        placeholder="INV-2026-0001"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DatePicker
          label="Issue Date"
          value={localDetails.issueDate}
          onChange={handleIssueDateChange}
        />

        <DatePicker
          label="Due Date"
          value={localDetails.dueDate}
          onChange={(e) =>
            setLocalDetails({ ...localDetails, dueDate: e.target.value })
          }
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-text-secondary">
          Payment Terms Quick Select
        </label>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_TERM_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handlePaymentTermsPreset(preset.value, preset.days)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                localDetails.paymentTerms === preset.value
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-surface text-text hover:border-primary'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Payment Terms"
        value={localDetails.paymentTerms}
        onChange={(e) =>
          setLocalDetails({ ...localDetails, paymentTerms: e.target.value })
        }
        placeholder="Net 30"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Currency"
          value={localDetails.currency.code}
          onChange={(e) => {
            const selectedCurrency = CURRENCIES.find(
              (c) => c.code === e.target.value
            );
            if (selectedCurrency) {
              setLocalDetails({ ...localDetails, currency: selectedCurrency });
            }
          }}
          options={CURRENCIES.map((c) => ({
            value: c.code,
            label: `${c.code} (${c.symbol})`,
          }))}
        />

        <Select
          label="Language"
          value={localDetails.language}
          onChange={(e) =>
            setLocalDetails({
              ...localDetails,
              language: e.target.value as 'en' | 'id',
            })
          }
          options={[
            { value: 'en', label: 'English' },
            { value: 'id', label: 'Bahasa Indonesia' },
          ]}
        />
      </div>

      <TextArea
        label="Notes (optional)"
        value={localDetails.notes}
        onChange={(e) => setLocalDetails({ ...localDetails, notes: e.target.value })}
        placeholder="Additional notes or payment instructions..."
        rows={3}
      />

      <TextArea
        label="Terms & Conditions (optional)"
        value={localDetails.termsAndConditions}
        onChange={(e) =>
          setLocalDetails({ ...localDetails, termsAndConditions: e.target.value })
        }
        placeholder="Payment terms, refund policy, etc..."
        rows={4}
      />
    </div>
  );
}
