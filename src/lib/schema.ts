import { z } from 'zod';

export const ConfigSchema = z.object({
  provider_preferencias: z.array(z.enum(['openai', 'anthropic', 'groq'])),
  keys: z.object({
    openai_api_key: z.string().optional(),
    anthropic_api_key: z.string().optional(),
    groq_api_key: z.string().optional()
  }),
  caps: z.object({
    max_output_tokens: z.number().min(32).max(2048),
    max_turns_por_sessao: z.number().min(1).max(30),
    temperature: z.number().min(0).max(2),
    top_p: z.number().min(0).max(1),
    stop_sequences: z.array(z.string()).default([])
  }),
  limites_upload: z.object({
    tipos: z.array(z.enum(['pdf', 'jpg', 'png'])).default(['pdf', 'jpg', 'png']),
    tam_mb: z.number().min(1).max(50),
    max_arquivos: z.number().min(1).max(20)
  }),
  prompt_operacional: z.enum(['consumidor', 'civel', 'familia', 'previdenciario', 'imobiliario']),
  prompt_custom: z.string().optional()
});

export const LinhaDoTempoSchema = z.object({ data: z.string(), fato: z.string() });

export const PacoteFinalSchema = z.object({
  cliente: z.object({
    nome: z.string().optional(),
    email: z.string().optional(),
    telefone: z.string().optional(),
    cidade: z.string().optional(),
    UF: z.string().optional()
  }),
  area: z.string().optional(),
  parte_contraria: z.string().optional(),
  tipo_relacao: z.string().optional(),
  descricao_fatos: z.string().optional(),
  linha_do_tempo: z.array(LinhaDoTempoSchema).default([]),
  provas_ja_existentes: z.array(z.string()).default([]),
  objetivo_cliente: z.array(z.string()).default([]),
  prazo_urgente: z.object({ existe: z.boolean(), data: z.string().nullable() }),
  processo_em_andamento: z.object({
    existe: z.boolean(),
    numero: z.string().nullable(),
    foro: z.string().nullable(),
    fase: z.string().nullable()
  }),
  documentos_recebidos: z.array(z.object({ nome: z.string(), tipo: z.string(), ok_legibilidade: z.boolean() })).default([]),
  documentos_pendentes: z.array(z.string()).default([]),
  preferencia_contato: z.string().optional(),
  observacoes: z.string().optional()
});
