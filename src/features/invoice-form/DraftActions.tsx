import { useState } from 'react';
import { TrashIcon, DocumentDuplicateIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon } from '@heroicons/react/24/outline';
import { useInvoiceStore } from '../../store/invoiceStore';
import { useUiStore } from '../../store/uiStore';
import { Button, Modal } from '../../components/ui';

export default function DraftActions() {
  const clearDraft = useInvoiceStore((state) => state.clearDraft);
  const duplicateInvoice = useInvoiceStore((state) => state.duplicateInvoice);
  const undo = useInvoiceStore((state) => (state as any).undo);
  const redo = useInvoiceStore((state) => (state as any).redo);
  const canUndo = useInvoiceStore((state) => (state as any).canUndo);
  const canRedo = useInvoiceStore((state) => (state as any).canRedo);
  const addToast = useUiStore((state) => state.addToast);

  const [showClearModal, setShowClearModal] = useState(false);

  const handleClearDraft = () => {
    clearDraft();
    setShowClearModal(false);
    addToast('Draft cleared', 'success');
  };

  const handleDuplicate = () => {
    duplicateInvoice();
    addToast('Invoice duplicated', 'success');
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => undo?.()}
          disabled={!canUndo || !canUndo()}
          title="Undo (Ctrl/Cmd+Z)"
        >
          <ArrowUturnLeftIcon className="h-4 w-4" />
          Undo
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => redo?.()}
          disabled={!canRedo || !canRedo()}
          title="Redo (Ctrl/Cmd+Shift+Z)"
        >
          <ArrowUturnRightIcon className="h-4 w-4" />
          Redo
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleDuplicate}
          title="Duplicate Invoice"
        >
          <DocumentDuplicateIcon className="h-4 w-4" />
          Duplicate
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={() => setShowClearModal(true)}
          title="Clear Draft"
        >
          <TrashIcon className="h-4 w-4" />
          Clear Draft
        </Button>
      </div>

      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear Draft?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            This will clear all invoice data and reset the form. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={handleClearDraft}
              className="flex-1"
            >
              Clear Draft
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowClearModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
