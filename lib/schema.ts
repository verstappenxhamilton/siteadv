import { z } from 'zod';

export const triageSchema = z.object({
  identification: z.object({
    name: z.string().min(1),
    email: z.string().email()
  }),
  case: z.object({
    description: z.string().min(1)
  }),
  deadlines: z.object({
    hasDeadline: z.boolean(),
    date: z.string().optional(),
    risk: z.enum(['alto', 'medio', 'baixo'])
  }),
  documents: z.array(z.string()).optional()
});

export type TriageData = z.infer<typeof triageSchema>;
