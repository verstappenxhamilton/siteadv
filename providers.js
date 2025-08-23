const fetch = require('node-fetch');

async function openaiGenerate(apiKey, messages, params) {
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: params.model || 'gpt-4o-mini',
      input: messages,
      max_output_tokens: params.max_output_tokens,
      temperature: params.temperature,
      top_p: params.top_p,
      stop: params.stop_sequences
    })
  });
  const data = await res.json();
  if (data.output && data.output.length) {
    return data.output[0].content[0].text;
  }
  return data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || '';
}

async function anthropicGenerate(apiKey, messages, params) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: params.model || 'claude-3-haiku-20240307',
      max_tokens: params.max_output_tokens,
      temperature: params.temperature,
      top_p: params.top_p,
      stop_sequences: params.stop_sequences,
      messages
    })
  });
  const data = await res.json();
  if (data.content && data.content.length) {
    return data.content[0].text;
  }
  return '';
}

async function groqGenerate(apiKey, messages, params) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: params.model || 'mixtral-8x7b-32768',
      messages,
      max_tokens: params.max_output_tokens,
      temperature: params.temperature,
      top_p: params.top_p,
      stop: params.stop_sequences
    })
  });
  const data = await res.json();
  if (data.choices && data.choices.length) {
    return data.choices[0].message.content;
  }
  return '';
}

async function geminiGenerate(apiKey, messages, params) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${params.model || 'gemini-pro'}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.content }]
      })),
      generationConfig: {
        maxOutputTokens: params.max_output_tokens,
        temperature: params.temperature,
        topP: params.top_p,
        stopSequences: params.stop_sequences
      }
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error && data.error.message ? data.error.message : 'gemini_error');
  }
  return data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text || '';
}

async function generate(provider, apiKey, messages, params) {
  switch (provider) {
    case 'anthropic':
      return anthropicGenerate(apiKey, messages, params);
    case 'gemini':
      return geminiGenerate(apiKey, messages, params);
    case 'groq':
      return groqGenerate(apiKey, messages, params);
    case 'openai':
    default:
      return openaiGenerate(apiKey, messages, params);
  }
}

module.exports = { generate };
