import { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useInvoiceStore } from '../../store/invoiceStore';
import { useUiStore } from '../../store/uiStore';
import { exportInvoiceToPdf } from '../../lib/pdfExport';
import Button from '../../components/ui/Button';

export default function PDFButton() {
  const invoice = useInvoiceStore((state) => state.invoice);
  const addToast = useUiStore((state) => state.addToast);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');

  const handleExport = async () => {
    // Find the template element in the preview
    const previewContainer = document.querySelector('[data-invoice-preview]');
    
    if (!previewContainer) {
      addToast('Preview not found. Please try again.', 'error');
      return;
    }

    const templateElement = previewContainer.querySelector('[data-template]') as HTMLElement;
    
    if (!templateElement) {
      addToast('Template not loaded. Please wait and try again.', 'error');
      return;
    }

    // Basic validation
    if (!invoice.business.name) {
      addToast('Please enter your business name before exporting', 'error');
      return;
    }

    if (!invoice.client.name) {
      addToast('Please enter client name before exporting', 'error');
      return;
    }

    if (invoice.items.length === 0 || !invoice.items[0].description) {
      addToast('Please add at least one item before exporting', 'error');
      return;
    }

    setIsGenerating(true);
    setProgress('Preparing...');

    try {
      const result = await exportInvoiceToPdf(invoice, templateElement, {
        onProgress: (message) => {
          setProgress(message);
        },
        timeout: 15000,
      });

      if (result.success) {
        addToast(`PDF downloaded: ${result.filename}`, 'success');
      } else {
        addToast(`Export failed: ${result.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addToast(`Export failed: ${errorMessage}`, 'error');
      console.error('PDF export error:', error);
    } finally {
      setIsGenerating(false);
      setProgress('');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleExport}
        disabled={isGenerating}
        loading={isGenerating}
        size="lg"
        className="w-full sm:w-auto"
      >
        <ArrowDownTrayIcon className="h-5 w-5" />
        {isGenerating ? progress || 'Generating PDF...' : 'Download PDF'}
      </Button>
      {isGenerating && (
        <p className="text-xs text-text-secondary text-center">
          This may take a few seconds...
        </p>
      )}
    </div>
  );
}
