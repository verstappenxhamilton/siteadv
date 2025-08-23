import { ChatMessage, ProviderConfig } from '../config';

export async function generate(
  messages: ChatMessage[],
  config: ProviderConfig
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      input: messages,
      max_output_tokens: config.maxOutputTokens,
      temperature: config.temperature,
      top_p: config.topP,
      stop: config.stopSequences
    })
  });
  const data = await response.json();
  const output = data.output?.[0]?.content?.[0]?.text;
  return output || '';
}
