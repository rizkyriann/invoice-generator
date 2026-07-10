import { z } from 'zod';

export const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  logoDataUrl: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  address: z.string().optional(),
});

export type BusinessFormData = z.infer<typeof businessSchema>;
