import { Provider } from '../config';
import * as openai from './openai';
import * as anthropic from './anthropic';
import * as groq from './groq';

export function getAdapter(provider: Provider) {
  switch (provider) {
    case 'anthropic':
      return anthropic;
    case 'groq':
      return groq;
    default:
      return openai;
  }
}
