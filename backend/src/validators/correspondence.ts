import { z } from 'zod';

export const createCorrespondenceSchema = z.object({
  type: z.enum(['incoming', 'outgoing']),
  subject: z.string().min(1).max(500),
  description: z.string().min(1),
  sender_entity_id: z.number().int().positive(),
  receiver_entity_id: z.number().int().positive(),
  correspondence_date: z.string().datetime().or(z.date()),
  current_status: z.enum(['draft', 'sent', 'received', 'under_review', 'replied', 'closed']).optional(),
});

export const updateCorrespondenceSchema = z.object({
  subject: z.string().min(1).max(500).optional(),
  description: z.string().min(1).optional(),
  sender_entity_id: z.number().int().positive().optional(),
  receiver_entity_id: z.number().int().positive().optional(),
  correspondence_date: z.string().datetime().or(z.date()).optional(),
  current_status: z.enum(['draft', 'sent', 'received', 'under_review', 'replied', 'closed']).optional(),
  review_status: z.enum(['reviewed', 'not_reviewed']).optional(),
});

export const replySchema = z.object({
  subject: z.string().min(1).max(500),
  body: z.string().min(1),
  parent_reply_id: z.number().int().positive().optional(),
});

export const statusUpdateSchema = z.object({
  status: z.enum(['draft', 'sent', 'received', 'under_review', 'replied', 'closed']),
  notes: z.string().optional(),
});

