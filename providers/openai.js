async function generate(cfg, messages) {
  const apiKey = cfg.openai.apiKey;
  const url = 'https://api.openai.com/v1/responses';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: cfg.model || 'gpt-4.1-mini',
      messages,
      max_output_tokens: cfg.params?.max_output_tokens,
      temperature: cfg.params?.temperature,
      top_p: cfg.params?.top_p,
      stop_sequences: cfg.params?.stop_sequences
    })
  });
  const data = await res.json();
  let text = '';
  if (data.output && Array.isArray(data.output)) {
    text = data.output[0]?.content?.[0]?.text || '';
  }
  if (data.output_text) text = data.output_text;
  return { text, raw: data };
}

module.exports = { generate };
