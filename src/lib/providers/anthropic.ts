import { Config } from '@/lib/schema';

export async function callAnthropic(_messages: { role: string; content: string }[], _config: Config) {
  return 'Resposta da Anthropic';
}
