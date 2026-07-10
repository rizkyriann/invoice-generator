import { TrashIcon, DocumentDuplicateIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import type { InvoiceItem } from '../../types/invoice.types';
import { Input } from '../../components/ui';
import { calculateItemTotal } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currency';
import { useInvoiceStore } from '../../store/invoiceStore';

interface InvoiceItemRowProps {
  item: InvoiceItem;
  index: number;
  totalItems: number;
  currency: { code: string; symbol: string; locale: string };
}

export default function InvoiceItemRow({ item, index, totalItems, currency }: InvoiceItemRowProps) {
  const updateItem = useInvoiceStore((state) => state.updateItem);
  const removeItem = useInvoiceStore((state) => state.removeItem);
  const duplicateItem = useInvoiceStore((state) => state.duplicateItem);
  const reorderItems = useInvoiceStore((state) => state.reorderItems);

  const handleUpdate = (updates: Partial<InvoiceItem>) => {
    const updated = { ...item, ...updates };
    updated.total = calculateItemTotal(updated);
    updateItem(item.id, updated);
  };

  const handleDelete = () => {
    if (totalItems > 1) {
      removeItem(item.id);
    }
  };

  const handleDuplicate = () => {
    duplicateItem(item.id);
  };

  const handleMoveUp = () => {
    if (index > 0) {
      reorderItems(index, index - 1);
    }
  };

  const handleMoveDown = () => {
    if (index < totalItems - 1) {
      reorderItems(index, index + 1);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">Item #{index + 1}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleMoveUp}
            disabled={index === 0}
            className="rounded p-1 text-text-secondary hover:bg-surface-tertiary hover:text-text disabled:opacity-30"
            title="Move up"
          >
            <ChevronUpIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleMoveDown}
            disabled={index === totalItems - 1}
            className="rounded p-1 text-text-secondary hover:bg-surface-tertiary hover:text-text disabled:opacity-30"
            title="Move down"
          >
            <ChevronDownIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleDuplicate}
            className="rounded p-1 text-text-secondary hover:bg-surface-tertiary hover:text-text"
            title="Duplicate"
          >
            <DocumentDuplicateIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={totalItems === 1}
            className="rounded p-1 text-danger hover:bg-danger-light disabled:opacity-30"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <Input
          label="Description"
          value={item.description}
          onChange={(e) => handleUpdate({ description: e.target.value })}
          placeholder="Item description"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Quantity"
            type="number"
            min="0"
            step="0.01"
            value={item.quantity}
            onChange={(e) => handleUpdate({ quantity: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="Unit Price"
            type="number"
            min="0"
            step="0.01"
            value={item.unitPrice}
            onChange={(e) => handleUpdate({ unitPrice: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-secondary">Discount</label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() =>
                  handleUpdate({
                    discount: item.discount ? { ...item.discount, mode: 'percentage' } : { mode: 'percentage', value: 0 },
                  })
                }
                className={`rounded px-2 py-1 text-xs ${
                  item.discount?.mode === 'percentage'
                    ? 'bg-primary text-white'
                    : 'bg-surface-tertiary text-text-secondary'
                }`}
              >
                %
              </button>
              <button
                type="button"
                onClick={() =>
                  handleUpdate({
                    discount: item.discount ? { ...item.discount, mode: 'fixed' } : { mode: 'fixed', value: 0 },
                  })
                }
                className={`rounded px-2 py-1 text-xs ${
                  item.discount?.mode === 'fixed'
                    ? 'bg-primary text-white'
                    : 'bg-surface-tertiary text-text-secondary'
                }`}
              >
                {currency.symbol}
              </button>
            </div>
          </div>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={item.discount?.value || 0}
            onChange={(e) =>
              handleUpdate({
                discount: {
                  mode: item.discount?.mode || 'percentage',
                  value: parseFloat(e.target.value) || 0,
                },
              })
            }
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Tax (%)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={item.tax?.rate || 0}
            onChange={(e) =>
              handleUpdate({
                tax: {
                  label: item.tax?.label || 'Tax',
                  rate: parseFloat(e.target.value) || 0,
                },
              })
            }
            placeholder="0"
          />
        </div>

        <div className="rounded-lg bg-surface-secondary p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">Item Total</span>
            <span className="text-lg font-semibold text-text">
              {formatCurrency(item.total, currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
