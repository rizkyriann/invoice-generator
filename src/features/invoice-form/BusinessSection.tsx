import { useEffect, useState } from 'react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { Input, TextArea, FileDropzone } from '../../components/ui';

export default function BusinessSection() {
  const business = useInvoiceStore((state) => state.invoice.business);
  const updateBusiness = useInvoiceStore((state) => state.updateBusiness);

  const [localBusiness, setLocalBusiness] = useState(business);

  useEffect(() => {
    const handler = setTimeout(() => {
      updateBusiness(localBusiness);
    }, 300);
    return () => clearTimeout(handler);
  }, [localBusiness, updateBusiness]);

  const handleLogoUpload = async (file: File) => {
    try {
      const { resizeImage, IMAGE_PRESETS } = await import('../../utils/imageResize');
      const dataUrl = await resizeImage(file, IMAGE_PRESETS.logo);
      setLocalBusiness({ ...localBusiness, logoDataUrl: dataUrl });
    } catch (error) {
      console.error('Logo upload failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text">Business Information</h2>

      <Input
        label="Business Name"
        value={localBusiness.name}
        onChange={(e) => setLocalBusiness({ ...localBusiness, name: e.target.value })}
        placeholder="Your Company Name"
      />

      <FileDropzone
        label="Logo"
        accept="image/*"
        onDrop={handleLogoUpload}
        preview={localBusiness.logoDataUrl}
      />

      <Input
        label="Email"
        type="email"
        value={localBusiness.email || ''}
        onChange={(e) => setLocalBusiness({ ...localBusiness, email: e.target.value })}
        placeholder="your@email.com"
      />

      <Input
        label="Phone"
        type="tel"
        value={localBusiness.phone || ''}
        onChange={(e) => setLocalBusiness({ ...localBusiness, phone: e.target.value })}
        placeholder="+62 812 3456 7890"
      />

      <Input
        label="Website"
        type="url"
        value={localBusiness.website || ''}
        onChange={(e) => setLocalBusiness({ ...localBusiness, website: e.target.value })}
        placeholder="https://example.com"
      />

      <TextArea
        label="Address"
        value={localBusiness.address || ''}
        onChange={(e) => setLocalBusiness({ ...localBusiness, address: e.target.value })}
        placeholder="Street address, city, postal code"
        rows={3}
      />
    </div>
  );
}
