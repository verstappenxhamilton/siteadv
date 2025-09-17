// Tema (Admin): aplica preferência salva sem adicionar seletor
(function applySavedTheme(){
  const THEME_CLASSES = ['theme-a','theme-b','theme-c','theme-d'];
  const themeMeta = document.querySelector('meta#themeColor');
  const THEME_COLOR = {
    'theme-a': '#F8FAFC',
    'theme-b': '#0A66C2',
    'theme-c': '#8B5E3C',
    'theme-d': '#0B1220'
  };
  function applyTheme(theme){
    const b = document.body; THEME_CLASSES.forEach(t=>b.classList.remove(t));
    if (THEME_CLASSES.includes(theme)) b.classList.add(theme);
    if (themeMeta && THEME_COLOR[theme]) themeMeta.setAttribute('content', THEME_COLOR[theme]);
  }
  try { const saved = localStorage.getItem('ui.theme'); if (saved && THEME_CLASSES.includes(saved)) applyTheme(saved); } catch {}
})();

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
