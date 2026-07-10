import { z } from 'zod';
import { businessSchema } from './businessSchema';
import { clientSchema } from './clientSchema';
import { itemSchema, discountSchema, taxSchema } from './itemSchema';

const currencySchema = z.object({
  code: z.string(),
  symbol: z.string(),
  locale: z.string(),
});

const totalsInputsSchema = z.object({
  discount: discountSchema.optional(),
  tax: taxSchema.optional(),
  shipping: z.number().optional(),
  otherFees: z
    .array(
      z.object({
        label: z.string(),
        amount: z.number(),
      })
    )
    .optional(),
  amountPaid: z.number().optional(),
});

export const invoiceSchema = z.object({
  id: z.string(),
  schemaVersion: z.number(),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  issueDate: z.string(),
  dueDate: z.string(),
  currency: currencySchema,
  language: z.enum(['en', 'id']),
  paymentTerms: z.string(),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  business: businessSchema,
  client: clientSchema,
  items: z.array(itemSchema).min(1, 'At least one item is required'),
  totals: totalsInputsSchema,
  templateId: z.string(),
  extras: z
    .object({
      qrCodePayload: z.string().optional(),
      signatureDataUrl: z.string().optional(),
      stampDataUrl: z.string().optional(),
      watermarkText: z.string().optional(),
    })
    .optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
