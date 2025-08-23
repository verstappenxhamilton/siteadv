async function generate(cfg, messages) {
  const apiKey = cfg.groq.apiKey;
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: cfg.model || 'mixtral-8x7b',
      messages,
      max_tokens: cfg.params?.max_output_tokens,
      temperature: cfg.params?.temperature,
      top_p: cfg.params?.top_p,
      stop: cfg.params?.stop_sequences
    })
  });
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  return { text, raw: data };
}

module.exports = { generate };
