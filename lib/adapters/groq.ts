import { ChatMessage, ProviderConfig } from '../config';

export async function generate(
  messages: ChatMessage[],
  config: ProviderConfig
): Promise<string> {
  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b',
        messages,
        max_tokens: config.maxOutputTokens,
        temperature: config.temperature,
        top_p: config.topP,
        stop: config.stopSequences
      })
    }
  );
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
