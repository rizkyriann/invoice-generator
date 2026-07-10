import { useInvoiceStore } from '../../store/invoiceStore';
import { TEMPLATE_METADATA } from '../../templates/registry';

export default function TemplateSelector() {
  const templateId = useInvoiceStore((state) => state.invoice.templateId);
  const setTemplate = useInvoiceStore((state) => state.setTemplate);

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-text">Choose Template</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TEMPLATE_METADATA.map((template) => (
          <button
            key={template.id}
            onClick={() => setTemplate(template.id)}
            className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
              templateId === template.id
                ? 'border-primary shadow-lg'
                : 'border-border hover:border-primary hover:shadow-md'
            }`}
          >
            <div
              className="h-32 bg-gradient-to-br from-gray-100 to-gray-200"
              style={{
                background: `linear-gradient(135deg, ${template.accentColor}15 0%, ${template.accentColor}05 100%)`,
              }}
            >
              <div className="flex h-full items-center justify-center">
                <div
                  className="h-16 w-16 rounded-full"
                  style={{ backgroundColor: template.accentColor }}
                ></div>
              </div>
            </div>
            <div className="bg-surface p-3 text-left">
              <h3 className="font-semibold text-text">{template.name}</h3>
              <p className="text-xs text-text-secondary">{template.description}</p>
            </div>
            {templateId === template.id && (
              <div className="absolute right-2 top-2 rounded-full bg-primary p-1">
                <svg
                  className="h-4 w-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
