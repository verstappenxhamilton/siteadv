import { ConfigSchema } from './schema';
import { z } from 'zod';
import { callOpenAI } from './providers/openai';
import { callAnthropic } from './providers/anthropic';
import { callGroq } from './providers/groq';

export async function routePrompt(prompt: string, config: z.infer<typeof ConfigSchema>) {
  ConfigSchema.parse(config);
  const max = config.caps.max_output_tokens;
  for (const provider of config.provider_preferencias) {
    try {
      if (provider === 'openai') {
        return { provider, ...(await callOpenAI(prompt, max, config.keys.openai_api_key)) };
      }
      if (provider === 'anthropic') {
        return { provider, ...(await callAnthropic(prompt, max, config.keys.anthropic_api_key)) };
      }
      if (provider === 'groq') {
        return { provider, ...(await callGroq(prompt, max, config.keys.groq_api_key)) };
      }
    } catch {
      continue;
    }
  }
  return { provider: 'none', content: 'Serviço indisponível', usage: {}, model: 'none' };
}
