import { useState } from 'react';
import BusinessSection from '../features/invoice-form/BusinessSection';
import ClientSection from '../features/invoice-form/ClientSection';
import InvoiceDetailsSection from '../features/invoice-form/InvoiceDetailsSection';
import InvoiceItems from '../features/invoice-form/InvoiceItems';
import TotalsSection from '../features/invoice-form/TotalsSection';
import ExtrasSection from '../features/invoice-form/ExtrasSection';
import DraftActions from '../features/invoice-form/DraftActions';
import TemplateSelector from '../features/template-selector/TemplateSelector';
import InvoicePreview from '../features/invoice-preview/InvoicePreview';
import PrintButton from '../features/pdf-export/PrintButton';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export default function InvoiceGeneratorPage() {
  const [showPreview, setShowPreview] = useState(false);

  useKeyboardShortcuts(() => {});

  return (
    <div className="flex h-screen flex-col bg-surface-secondary lg:flex-row">
      {/* Left Side - Form */}
      <div className={`w-full overflow-y-auto lg:w-1/2 ${showPreview ? 'hidden lg:block' : 'block'}`}>
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="mb-6 flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text">Create Invoice</h1>
              <p className="text-sm text-text-secondary">
                Fill in the details below. All data is saved locally on your device.
              </p>
            </div>
            <DraftActions />
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <BusinessSection />
            </div>

            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <ClientSection />
            </div>

            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <InvoiceDetailsSection />
            </div>

            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <InvoiceItems />
            </div>

            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <TotalsSection />
            </div>

            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <ExtrasSection />
            </div>

            {/* Mobile: Show Preview Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowPreview(true)}
                className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white hover:bg-primary-hover"
              >
                Show Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Template Selector + Preview */}
      <div className={`w-full overflow-y-auto border-l border-border bg-surface-secondary lg:w-1/2 ${showPreview ? 'block' : 'hidden lg:block'}`}>
        <div className="p-4">
          {/* Mobile: Back Button */}
          <div className="mb-4 lg:hidden">
            <button
              onClick={() => setShowPreview(false)}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Form
            </button>
          </div>

          <div className="space-y-4">
            <div className="nintendo-panel rounded-[var(--rounded-md)] p-[var(--spacing-md)]">
              <h2 className="nintendo-ui-label text-[var(--ink)] mb-[var(--spacing-md)]">EXPORT</h2>
              <div className="flex flex-col gap-[var(--spacing-md)] sm:flex-row">
                <PrintButton />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <TemplateSelector />
          </div>

          <div className="mt-6 rounded-xl border border-border bg-surface shadow-sm">
              <div className="border-b border-border bg-surface-secondary px-6 py-4">
                <h2 className="text-lg font-semibold text-text">Live Preview</h2>
                <p className="text-xs text-text-secondary">
                  Your invoice updates in real-time as you edit
                </p>
              </div>
              <InvoicePreview />
            </div>
          </div>
        </div>
    </div>
  );
}
