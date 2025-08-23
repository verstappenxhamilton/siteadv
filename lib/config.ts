export type ProviderName = 'openai' | 'anthropic' | 'groq';

export interface ProviderConfig {
  provider: ProviderName;
  apiKey: string;
  maxOutputTokens: number;
  temperature: number;
  topP: number;
  stopSequences: string[];
  sessionMessageLimit: number;
  prompt: string;
}

export const defaultConfig: ProviderConfig = {
  provider: 'openai',
  apiKey: '',
  maxOutputTokens: 500,
  temperature: 0,
  topP: 1,
  stopSequences: [],
  sessionMessageLimit: 20,
  prompt:
    'Você é uma secretária jurídica especialista em triagem. ' +
    'Conduza a conversa em blocos curtos, usando select/radio/date/file quando necessário. ' +
    'Seja objetivo, máximo 5 bullets por resposta. Priorize 1) prazos, 2) fatos essenciais, 3) documentos faltantes. ' +
    'Quando tudo estiver completo, pergunte se pode encerrar. Se sim, entregue resumo factual (5 bullets curtos), ' +
    'checklist de pendências e JSON final com todos os campos coletados.'
};

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export let currentConfig: ProviderConfig = { ...defaultConfig };
