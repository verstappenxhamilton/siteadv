import { ChatMessage, ProviderConfig } from '../config';

export async function generate(
  messages: ChatMessage[],
  config: ProviderConfig
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      messages,
      max_tokens: config.maxOutputTokens,
      temperature: config.temperature,
      top_p: config.topP,
      stop_sequences: config.stopSequences
    })
  });
  const data = await response.json();
  return data.content?.[0]?.text || '';
}
