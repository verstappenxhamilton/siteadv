import { Config } from '@/lib/schema';
import { callOpenAI } from './providers/openai';
import { callAnthropic } from './providers/anthropic';
import { callGroq } from './providers/groq';

export async function routeChat(messages: { role: string; content: string }[], config: Config): Promise<string> {
  for (const prov of config.provider_preferencias) {
    try {
      if (prov === 'openai') return await callOpenAI(messages, config);
      if (prov === 'anthropic') return await callAnthropic(messages, config);
      if (prov === 'groq') return await callGroq(messages, config);
    } catch (e) {
      console.error('erro provider', prov, e);
      continue;
    }
  }
  throw new Error('Nenhum provedor disponível');
}
