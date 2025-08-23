export async function callAnthropic(prompt: string, maxTokens: number, apiKey?: string) {
  if (!apiKey) throw new Error('missing anthropic_api_key');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error('anthropic error');
  const json = await res.json();
  return {
    content: json.content?.[0]?.text || '',
    usage: json.usage,
    model: json.model,
  };
}
