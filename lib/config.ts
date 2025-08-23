import * as openai from '@/lib/adapters/openai';
import * as anthropic from '@/lib/adapters/anthropic';
import * as groq from '@/lib/adapters/groq';

export type Provider = 'openai' | 'anthropic' | 'groq';

interface Config {
  provider: Provider;
  max_output_tokens: number;
  temperature: number;
  top_p: number;
  stop_sequences: string[];
  prompt: string;
  enableUpload: boolean;
  enableOCR: boolean;
}

const config: Config = {
  provider: 'openai',
  max_output_tokens: 500,
  temperature: 0.7,
  top_p: 1,
  stop_sequences: [],
  prompt: 'Você é uma secretária jurídica especialista em triagem.',
  enableUpload: true,
  enableOCR: false
};

export function getAdapter() {
  switch (config.provider) {
    case 'anthropic':
      return anthropic;
    case 'groq':
      return groq;
    default:
      return openai;
  }
}

export function getConfig() {
  return config;
}

export function updateConfig(partial: Partial<Config>) {
  Object.assign(config, partial);
}
