import { Config } from '@/lib/schema';

export async function callGroq(_messages: { role: string; content: string }[], _config: Config) {
  return 'Resposta da Groq';
}
