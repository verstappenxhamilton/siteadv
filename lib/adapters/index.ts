import { ProviderName } from '../config';
import { generate as openai } from './openai';
import { generate as anthropic } from './anthropic';
import { generate as groq } from './groq';

export function getAdapter(provider: ProviderName) {
  switch (provider) {
    case 'anthropic':
      return anthropic;
    case 'groq':
      return groq;
    default:
      return openai;
  }
}
