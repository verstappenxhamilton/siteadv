export async function callOpenAI(prompt: string, maxTokens: number, apiKey?: string) {
  if (!apiKey) throw new Error('missing openai_api_key');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) throw new Error('openai error');
  const json = await res.json();
  return {
    content: json.choices[0]?.message?.content || '',
    usage: json.usage,
    model: json.model,
  };
}
