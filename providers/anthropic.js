async function generate(cfg, messages) {
  const apiKey = cfg.anthropic.apiKey;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: cfg.model || 'claude-3-haiku-20240307',
      max_tokens: cfg.params?.max_output_tokens,
      temperature: cfg.params?.temperature,
      top_p: cfg.params?.top_p,
      stop_sequences: cfg.params?.stop_sequences,
      messages
    })
  });
  const data = await res.json();
  const text = data.content?.[0]?.text || '';
  return { text, raw: data };
}

module.exports = { generate };
