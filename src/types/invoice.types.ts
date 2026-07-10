// types/invoice.types.ts
// Data models for the invoice generator application

export interface Business {
  name: string;
  logoDataUrl?: string; // base64, resized/compressed client-side
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
}

export interface Client {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export type DiscountMode = 'percentage' | 'fixed';

export interface Discount {
  mode: DiscountMode;
  value: number; // percentage (0-100) or fixed amount
}

export interface Tax {
  label: string; // e.g. "VAT", "PPN"
  rate: number; // percentage
}

export interface InvoiceItem {
  id: string; // uuid
  description: string;
  quantity: number;
  unitPrice: number; // in smallest currency unit-safe decimal
  discount?: Discount;
  tax?: Tax;
  total: number; // computed, cached for display
}

export interface Currency {
  code: string; // ISO 4217, e.g. "IDR"
  symbol: string; // e.g. "Rp"
  locale: string; // e.g. "id-ID"
}

export type ThemeMode = 'light' | 'dark';

export interface InvoiceTotalsInputs {
  discount?: Discount;
  tax?: Tax;
  shipping?: number;
  otherFees?: { label: string; amount: number }[];
  amountPaid?: number;
}

export interface Invoice {
  id: string; // uuid, local draft id
  schemaVersion: number;
  invoiceNumber: string;
  issueDate: string; // ISO date
  dueDate: string; // ISO date
  currency: Currency;
  language: 'en' | 'id';
  paymentTerms: string;
  notes?: string;
  termsAndConditions?: string;
  business: Business;
  client: Client;
  items: InvoiceItem[];
  totals: InvoiceTotalsInputs;
  templateId: string; // references templates/registry.ts
  extras?: {
    qrCodePayload?: string;
    signatureDataUrl?: string;
    stampDataUrl?: string;
    watermarkText?: string;
  };
}

export interface Settings {
  defaultCurrency: Currency;
  defaultLanguage: 'en' | 'id';
  defaultTaxRate?: number;
  theme: ThemeMode;
}

export interface TemplateMeta {
  id: string;
  name: string;
  accentColor: string;
  previewThumbnailUrl: string;
}
