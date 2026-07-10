import { useEffect } from 'react';
import { useInvoiceStore } from '../store/invoiceStore';

/**
 * Hook to handle keyboard shortcuts
 */
export function useKeyboardShortcuts(onExportPdf?: () => void) {
  const undo = useInvoiceStore((state) => (state as any).undo);
  const redo = useInvoiceStore((state) => (state as any).redo);
  const canUndo = useInvoiceStore((state) => (state as any).canUndo);
  const canRedo = useInvoiceStore((state) => (state as any).canRedo);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + S: Save draft (prevent default browser save)
      if (cmdOrCtrl && e.key === 's') {
        e.preventDefault();
        // Draft is auto-saved via persist middleware, just show a toast
        console.log('Draft saved (auto-saved via persist middleware)');
      }

      // Ctrl/Cmd + P: Export PDF
      if (cmdOrCtrl && e.key === 'p' && onExportPdf) {
        e.preventDefault();
        onExportPdf();
      }

      // Ctrl/Cmd + Z: Undo
      if (cmdOrCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (undo && canUndo && canUndo()) {
          undo();
        }
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if ((cmdOrCtrl && e.shiftKey && e.key === 'z') || (cmdOrCtrl && e.key === 'y')) {
        e.preventDefault();
        if (redo && canRedo && canRedo()) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo, onExportPdf]);
}
