(() => {
  // Tema (Home): aplica preferência salva sem adicionar seletor
  const THEME_CLASSES = ['theme-a','theme-b','theme-c','theme-d','theme-e','theme-f','theme-g'];
  const themeMeta = document.querySelector('meta#themeColor');
  const THEME_COLOR = {
    'theme-a': '#F8FAFC',
    'theme-b': '#0A66C2',
    'theme-c': '#8B5E3C',
    'theme-d': '#0B1220',
    'theme-e': '#10B981',
    'theme-f': '#7F1D1D',
    'theme-g': '#111827'
  };
  function applyTheme(theme) {
    const b = document.body;
    THEME_CLASSES.forEach(t => b.classList.remove(t));
    if (THEME_CLASSES.includes(theme)) b.classList.add(theme);
    if (themeMeta && THEME_COLOR[theme]) themeMeta.setAttribute('content', THEME_COLOR[theme]);
  }
  try {
    const saved = localStorage.getItem('ui.theme');
    if (saved && THEME_CLASSES.includes(saved)) applyTheme(saved);
  } catch {}

  // ====== Aplicar Site Config (conteúdo/ordem/cores) ======
  async function applySiteConfig() {
    try {
      const res = await fetch('/admin/site-config');
      if (!res.ok) return;
      const cfg = await res.json();
      // Títulos/branding
      if (cfg.brandingTitle) {
        const brand = document.querySelector('.brand div div:first-child');
        if (brand) brand.textContent = cfg.brandingTitle;
      }
      if (cfg.heroTitle) {
        const el = document.querySelector('.hero-section h1');
        if (el) el.textContent = cfg.heroTitle;
      }
      if (cfg.heroSubtitle) {
        const el = document.querySelector('.hero-section p');
        if (el) el.textContent = cfg.heroSubtitle;
      }
      if (cfg.aboutText) {
        const about = document.querySelector('#sobre')?.parentElement?.querySelector('p');
        if (about) about.textContent = cfg.aboutText;
      }
      // Cor de destaque
      if (cfg.accentColor) {
        document.documentElement.style.setProperty('--accent', cfg.accentColor);
      }
      // Tema
      if (cfg.theme) {
        applyTheme(cfg.theme);
        try { localStorage.setItem('ui.theme', cfg.theme); } catch {}
      }
      // Visibilidade
      const mapIds = { hero: '.hero-section', sobre: '#sobre', areas: '#areas', contato: '#contato', formulario: '#formulario', secretaria: '#secretaria' };
      if (cfg.visibility) {
        Object.entries(mapIds).forEach(([k, sel]) => {
          const el = document.querySelector(sel);
          if (el) el.style.display = cfg.visibility[k] ? '' : 'none';
        });
      }
      // Ordem das seções (top-level)
      if (Array.isArray(cfg.sectionsOrder)) {
        const order = cfg.sectionsOrder;
        const mapSel = { hero: '.hero-section', sobre: '#sobre', areas: '#areas', contato: '#contato', formulario: '#formulario', secretaria: '#secretaria' };
        const nodes = order.map(key => document.querySelector(mapSel[key])?.closest('section') || document.querySelector(mapSel[key])).filter(Boolean);
        const parent = document.body;
        nodes.forEach(n => { if (n && n.parentElement) n.parentElement.appendChild(n); });
      }
    } catch (e) {
      // silencioso
    }
  }
  applySiteConfig();
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
