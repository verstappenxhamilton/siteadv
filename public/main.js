(() => {
  // Reveal sections on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // Contact form submission
  const form = document.querySelector('.contact-form');
  const statusEl = document.getElementById('formStatus');
  if (form && statusEl) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      statusEl.textContent = 'Enviando...';
      statusEl.classList.remove('hidden', 'success', 'error');
      try {
        const data = Object.fromEntries(new FormData(form).entries());
        const res = await fetch('/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          statusEl.textContent = 'Mensagem enviada com sucesso!';
          statusEl.classList.add('success');
          form.reset();
        } else {
          throw new Error('Request failed');
        }
      } catch (err) {
        statusEl.textContent = 'Erro ao enviar. Tente novamente.';
        statusEl.classList.add('error');
      }
    });
  }
})();
