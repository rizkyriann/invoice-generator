import { PlusIcon } from '@heroicons/react/24/outline';
import { useInvoiceStore } from '../../store/invoiceStore';
import InvoiceItemRow from './InvoiceItemRow';
import Button from '../../components/ui/Button';

export default function InvoiceItems() {
  const items = useInvoiceStore((state) => state.invoice.items);
  const currency = useInvoiceStore((state) => state.invoice.currency);
  const addItem = useInvoiceStore((state) => state.addItem);

  const handleAddItem = () => {
    const newItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    addItem(newItem);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">Invoice Items</h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleAddItem}
        >
          <PlusIcon className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <InvoiceItemRow
            key={item.id}
            item={item}
            index={index}
            totalItems={items.length}
            currency={currency}
          />
        ))}
      </div>

      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-surface-secondary p-8 text-center">
          <p className="mb-4 text-text-secondary">No items yet. Add your first item to get started.</p>
          <Button onClick={handleAddItem}>
            <PlusIcon className="h-4 w-4" />
            Add First Item
          </Button>
        </div>
      )}
    </div>
  );
}
