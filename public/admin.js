async function loadConfig() {
  const res = await fetch('/api/admin/config');
  const cfg = await res.json();
  document.getElementById('provider').value = cfg.provider || 'openai';
  document.getElementById('maxTokens').value = cfg.params?.max_output_tokens || '';
  document.getElementById('temperature').value = cfg.params?.temperature || '';
}

document.getElementById('configForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const provider = document.getElementById('provider').value;
  const apiKey = document.getElementById('apiKey').value;
  const maxTokens = parseInt(document.getElementById('maxTokens').value, 10);
  const temperature = parseFloat(document.getElementById('temperature').value);
  const body = {
    provider,
    [provider]: { apiKey },
    params: { max_output_tokens: maxTokens, temperature }
  };
  await fetch('/api/admin/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  alert('Configuração salva');
});

loadConfig();
