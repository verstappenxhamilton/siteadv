export async function callGroq(prompt: string, maxTokens: number, apiKey?: string) {
  if (!apiKey) throw new Error('missing groq_api_key');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) throw new Error('groq error');
  const json = await res.json();
  return {
    content: json.choices[0]?.message?.content || '',
    usage: json.usage,
    model: json.model,
  };
}
