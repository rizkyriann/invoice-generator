import { z } from 'zod';

export const discountSchema = z.object({
  mode: z.enum(['percentage', 'fixed']),
  value: z.number().min(0, 'Discount cannot be negative'),
});

export const taxSchema = z.object({
  label: z.string().min(1, 'Tax label is required'),
  rate: z.number().min(0, 'Tax rate cannot be negative').max(100, 'Tax rate cannot exceed 100%'),
});

export const itemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  discount: discountSchema.optional(),
  tax: taxSchema.optional(),
  total: z.number(),
});

export type ItemFormData = z.infer<typeof itemSchema>;
