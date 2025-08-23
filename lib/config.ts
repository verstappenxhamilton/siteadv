import { z } from 'zod';

export type Provider = 'openai' | 'anthropic' | 'groq';

export interface RuntimeConfig {
  provider: Provider;
  model: string;
  apiKeys: Partial<Record<Provider, string>>;
  maxOutputTokens: number;
  temperature: number;
  topP: number;
  stopSequences: string[];
  messageLimit: number;
  enableUpload: boolean;
  enableOCR: boolean;
  prompt: string;
}

export const runtimeConfig: RuntimeConfig = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKeys: {},
  maxOutputTokens: 512,
  temperature: 0.7,
  topP: 1,
  stopSequences: [],
  messageLimit: 20,
  enableUpload: true,
  enableOCR: false,
  prompt:
    'Você é uma secretária jurídica especialista em triagem. Conduza a conversa em blocos curtos, usando select/radio/date/file quando necessário. Seja objetivo, máximo 5 bullets por resposta. Priorize 1) prazos, 2) fatos essenciais, 3) documentos faltantes. Quando tudo estiver completo, pergunte se pode encerrar. Se sim, entregue resumo factual (5 bullets curtos), checklist de pendências e JSON final com todos os campos coletados.'
};

export function updateConfig(data: Partial<RuntimeConfig>) {
  Object.assign(runtimeConfig, data);
}

export function getConfig() {
  return runtimeConfig;
}

export const configSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'groq']),
  model: z.string(),
  apiKeys: z.object({ openai: z.string().optional(), anthropic: z.string().optional(), groq: z.string().optional() }),
  maxOutputTokens: z.number().min(1),
  temperature: z.number().min(0).max(1),
  topP: z.number().min(0).max(1),
  stopSequences: z.array(z.string()),
  messageLimit: z.number().min(1),
  enableUpload: z.boolean(),
  enableOCR: z.boolean(),
  prompt: z.string()
});
