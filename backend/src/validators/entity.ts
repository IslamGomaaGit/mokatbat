import { z } from 'zod';

export const createEntitySchema = z.object({
  name_ar: z.string().min(1).max(200),
  name_en: z.string().min(1).max(200),
  type: z.enum(['subsidiary', 'presidency', 'government', 'external']),
  contact_person: z.string().max(200).optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().max(50).optional(),
  address: z.string().optional(),
});

export const updateEntitySchema = z.object({
  name_ar: z.string().min(1).max(200).optional(),
  name_en: z.string().min(1).max(200).optional(),
  type: z.enum(['subsidiary', 'presidency', 'government', 'external']).optional(),
  contact_person: z.string().max(200).optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().max(50).optional(),
  address: z.string().optional(),
  is_active: z.boolean().optional(),
});

