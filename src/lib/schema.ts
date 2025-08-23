import { z } from 'zod';

export const ConfigSchema = z.object({
  provider_preferencias: z.array(z.enum(['openai', 'anthropic', 'groq'])),
  keys: z.object({
    openai_api_key: z.string().optional(),
    anthropic_api_key: z.string().optional(),
    groq_api_key: z.string().optional(),
  }),
  caps: z.object({
    max_output_tokens: z.number().min(32).max(2048),
    max_turns_por_sessao: z.number().min(1).max(30),
    temperature: z.number().min(0).max(2),
    top_p: z.number().min(0).max(1),
    stop_sequences: z.array(z.string()).default([]),
  }),
  limites_upload: z.object({
    tipos: z.array(z.enum(['pdf', 'jpg', 'png'])).default(['pdf', 'jpg', 'png']),
    tam_mb: z.number().min(1).max(50),
    max_arquivos: z.number().min(1).max(20),
  }),
  prompt_operacional: z.enum(['consumidor', 'civel', 'familia', 'previdenciario', 'imobiliario']),
  prompt_custom: z.string().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

export const defaultConfig: Config = {
  provider_preferencias: ['openai', 'groq', 'anthropic'],
  keys: {},
  caps: {
    max_output_tokens: 160,
    max_turns_por_sessao: 10,
    temperature: 0.4,
    top_p: 0.9,
    stop_sequences: ['\n\nFIM'],
  },
  limites_upload: { tipos: ['pdf', 'jpg', 'png'], tam_mb: 20, max_arquivos: 8 },
  prompt_operacional: 'consumidor',
  prompt_custom: '',
};

// pacote final schema minimal
export const LinhaTempoSchema = z.object({ data: z.string(), fato: z.string() });
export const PacoteSchema = z.object({
  cliente: z.object({
    nome: z.string(),
    email: z.string(),
    telefone: z.string(),
    cidade: z.string(),
    UF: z.string(),
  }),
  area: z.string(),
  parte_contraria: z.string(),
  tipo_relacao: z.string(),
  descricao_fatos: z.string(),
  linha_do_tempo: z.array(LinhaTempoSchema),
});
export type Pacote = z.infer<typeof PacoteSchema>;
