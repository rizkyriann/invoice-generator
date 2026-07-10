import { useEffect, useState } from 'react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { Input, TextArea, FileDropzone } from '../../components/ui';
import { resizeImage, IMAGE_PRESETS } from '../../utils/imageResize';

export default function ExtrasSection() {
  const extras = useInvoiceStore((state) => state.invoice.extras);
  const updateExtras = useInvoiceStore((state) => state.updateExtras);

  const [localExtras, setLocalExtras] = useState(extras || {});

  useEffect(() => {
    const handler = setTimeout(() => {
      updateExtras(localExtras);
    }, 300);
    return () => clearTimeout(handler);
  }, [localExtras, updateExtras]);

  const handleSignatureUpload = async (file: File) => {
    try {
      const dataUrl = await resizeImage(file, IMAGE_PRESETS.signature);
      setLocalExtras({ ...localExtras, signatureDataUrl: dataUrl });
    } catch (error) {
      console.error('Signature upload failed:', error);
    }
  };

  const handleStampUpload = async (file: File) => {
    try {
      const dataUrl = await resizeImage(file, IMAGE_PRESETS.stamp);
      setLocalExtras({ ...localExtras, stampDataUrl: dataUrl });
    } catch (error) {
      console.error('Stamp upload failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text">Additional Options</h2>

      <FileDropzone
        label="Signature Image (optional)"
        accept="image/*"
        onDrop={handleSignatureUpload}
        preview={localExtras.signatureDataUrl}
      />

      <FileDropzone
        label="Stamp Image (optional)"
        accept="image/*"
        onDrop={handleStampUpload}
        preview={localExtras.stampDataUrl}
      />

      <Input
        label="Watermark Text (optional)"
        value={localExtras.watermarkText || ''}
        onChange={(e) =>
          setLocalExtras({ ...localExtras, watermarkText: e.target.value })
        }
        placeholder="e.g., PAID, DRAFT"
      />

      <TextArea
        label="QR Code Payload (optional)"
        value={localExtras.qrCodePayload || ''}
        onChange={(e) =>
          setLocalExtras({ ...localExtras, qrCodePayload: e.target.value })
        }
        placeholder="Payment link or bank details for QR code"
        rows={2}
      />
    </div>
  );
}
