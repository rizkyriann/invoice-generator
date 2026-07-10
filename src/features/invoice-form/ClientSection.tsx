import { useEffect, useState } from 'react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { Input, TextArea } from '../../components/ui';

export default function ClientSection() {
  const client = useInvoiceStore((state) => state.invoice.client);
  const updateClient = useInvoiceStore((state) => state.updateClient);

  const [localClient, setLocalClient] = useState(client);

  useEffect(() => {
    const handler = setTimeout(() => {
      updateClient(localClient);
    }, 300);
    return () => clearTimeout(handler);
  }, [localClient, updateClient]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text">Client Information</h2>

      <Input
        label="Client Name"
        value={localClient.name}
        onChange={(e) => setLocalClient({ ...localClient, name: e.target.value })}
        placeholder="Client Name"
      />

      <Input
        label="Company (optional)"
        value={localClient.company || ''}
        onChange={(e) => setLocalClient({ ...localClient, company: e.target.value })}
        placeholder="Company Name"
      />

      <Input
        label="Email (optional)"
        type="email"
        value={localClient.email || ''}
        onChange={(e) => setLocalClient({ ...localClient, email: e.target.value })}
        placeholder="client@email.com"
      />

      <Input
        label="Phone (optional)"
        type="tel"
        value={localClient.phone || ''}
        onChange={(e) => setLocalClient({ ...localClient, phone: e.target.value })}
        placeholder="+62 812 3456 7890"
      />

      <TextArea
        label="Address (optional)"
        value={localClient.address || ''}
        onChange={(e) => setLocalClient({ ...localClient, address: e.target.value })}
        placeholder="Street address, city, postal code"
        rows={3}
      />
    </div>
  );
}
