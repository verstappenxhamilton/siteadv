import { z } from 'zod';

export const identificationSchema = z.object({
  fullName: z.string().min(1),
  contact: z.string().min(1)
});

export const caseSchema = z.object({
  description: z.string().min(1)
});

export const deadlineSchema = z.object({
  hasDeadline: z.boolean(),
  deadlineDate: z.string().optional(),
  risk: z.string().optional()
});

export const documentsSchema = z.object({
  documents: z.array(z.string()).optional()
});

export const triageSchema = identificationSchema
  .merge(caseSchema)
  .merge(deadlineSchema)
  .merge(documentsSchema);
