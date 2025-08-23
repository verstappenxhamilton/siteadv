async function post(path, data) {
  await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

document.getElementById('configForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const params = {
    max_output_tokens: Number(fd.get('max_output_tokens')),
    temperature: Number(fd.get('temperature')),
    top_p: Number(fd.get('top_p'))
  };
  const model = fd.get('model').trim();
  if (model) params.model = model;
  const data = {
    provider: fd.get('provider'),
    parameters: params,
    prompt: fd.get('prompt')
  };
  await post('/admin/config', data);
  alert('Configuração salva');
});

document.getElementById('keyForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = {
    openai: fd.get('openai'),
    anthropic: fd.get('anthropic'),
    groq: fd.get('groq'),
    gemini: fd.get('gemini')
  };
  await post('/admin/keys', data);
  alert('Chaves salvas');
});
