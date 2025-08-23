const form = document.getElementById('contactForm');
const statusEl = document.getElementById('contactStatus');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    statusEl.textContent = 'Enviando...';
    try {
      const resp = await fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (resp.ok) {
        form.reset();
        statusEl.textContent = 'Mensagem enviada com sucesso!';
      } else {
        statusEl.textContent = 'Erro ao enviar mensagem.';
      }
    } catch (err) {
      statusEl.textContent = 'Erro ao enviar mensagem.';
    }
  });
}
