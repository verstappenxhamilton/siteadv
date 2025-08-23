async function post(path, data) {
  const key = prompt('Chave admin?');
  await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
    body: JSON.stringify(data)
  });
}

const cfg = document.getElementById('lawyerConfigForm');
if (cfg) {
  cfg.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(cfg);
    const data = {
      provider: fd.get('provider'),
      parameters: {
        max_output_tokens: Number(fd.get('max_output_tokens')),
        temperature: Number(fd.get('temperature')),
        top_p: Number(fd.get('top_p'))
      },
      prompt: fd.get('prompt')
    };
    await post('/admin/config', data);
    alert('Configuração salva');
  });
}

const keys = document.getElementById('lawyerKeysForm');
if (keys) {
  keys.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(keys);
    const data = {
      openai: fd.get('openai'),
      anthropic: fd.get('anthropic'),
      groq: fd.get('groq')
    };
    await post('/admin/keys', data);
    alert('Chaves salvas');
  });
}
