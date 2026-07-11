import { Suspense, useEffect, useState } from 'react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { TEMPLATE_COMPONENTS } from '../../templates/registry';
import type { TemplateComponent } from '../../templates/registry';

export default function InvoicePreview() {
  const invoice = useInvoiceStore((state) => state.invoice);
  const [TemplateComponent, setTemplateComponent] = useState<TemplateComponent | null>(null);

  useEffect(() => {
    const loader = TEMPLATE_COMPONENTS[invoice.templateId];
    if (loader) {
      loader().then((module) => {
        setTemplateComponent(() => module.default);
      });
    }
  }, [invoice.templateId]);

  if (!TemplateComponent) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-secondary">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-text-secondary">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-surface-secondary p-4" data-invoice-preview>
      <div className="mx-auto" data-template>
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          }
        >
          <TemplateComponent invoice={invoice} />
        </Suspense>
      </div>
    </div>
  );
}
