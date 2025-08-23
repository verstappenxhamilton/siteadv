import { Config } from '@/lib/schema';

export async function callOpenAI(_messages: { role: string; content: string }[], _config: Config) {
  return 'Resposta do OpenAI';
}
