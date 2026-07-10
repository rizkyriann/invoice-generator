import { PrinterIcon } from '@heroicons/react/24/outline';
import { useUiStore } from '../../store/uiStore';
import Button from '../../components/ui/Button';

export default function PrintButton() {
  const addToast = useUiStore((state) => state.addToast);

  const handlePrint = () => {
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

    // Create a temporary iframe for printing
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const printDocument = printFrame.contentDocument || printFrame.contentWindow?.document;
    
    if (!printDocument) {
      addToast('Print preparation failed', 'error');
      document.body.removeChild(printFrame);
      return;
    }

    // Copy the template content to print document
    printDocument.open();
    printDocument.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Invoice</title>
          <style>
            @page { margin: 0; size: A4; }
            body { margin: 0; padding: 0; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
          ${Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(el => el.outerHTML)
            .join('\n')}
        </head>
        <body>
          ${templateElement.outerHTML}
        </body>
      </html>
    `);
    printDocument.close();

    // Wait for content to load then print
    printFrame.contentWindow?.focus();
    setTimeout(() => {
      printFrame.contentWindow?.print();
      // Clean up after print
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 100);
    }, 500);
  };

  return (
    <Button
      onClick={handlePrint}
      variant="secondary"
      size="lg"
      className="w-full sm:w-auto"
    >
      <PrinterIcon className="h-5 w-5" />
      Print Invoice
    </Button>
  );
}
