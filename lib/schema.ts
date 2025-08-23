import { z } from 'zod';

export const identificationSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email().optional(),
  telefone: z.string().optional()
});

export const caseSchema = z.object({
  descricao: z.string().min(1),
});

export const deadlineSchema = z.object({
  prazo: z.string().optional(),
  risco: z.string().optional()
});

export const documentsSchema = z.object({
  documentos: z.array(z.string()).optional()
});

export const closureSchema = z.object({
  podeEncerrar: z.boolean().optional()
});

export const triageSchema = z.object({
  identificacao: identificationSchema,
  caso: caseSchema,
  prazoRisco: deadlineSchema,
  documentos: documentsSchema,
  fechamento: closureSchema
});
