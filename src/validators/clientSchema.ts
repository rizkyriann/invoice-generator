import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  company: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
