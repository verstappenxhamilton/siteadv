import { getMediaWithFallback, explainGetUserMediaError, isPotentiallyInsecureContext } from './media.js';

(() => {
  const info = document.getElementById('info');
  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  const incoming = document.getElementById('incoming');
  const acceptBtn = document.getElementById('acceptBtn');
  const rejectBtn = document.getElementById('rejectBtn');
  const hangupBtn = document.getElementById('hangupBtn');
  const messages = document.getElementById('messages');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const aiMessages = document.getElementById('aiMessages');
  const aiInput = document.getElementById('aiInput');
  const aiSendBtn = document.getElementById('aiSendBtn');
  const reportsList = document.getElementById('reportsList');
  const refreshReports = document.getElementById('refreshReports');
  const themeSelect = document.getElementById('themeSelect');
  // Editor
  const siteEditor = document.getElementById('siteEditor');
  const editorStatus = document.getElementById('editorStatus');
  const sectionsList = document.getElementById('sectionsList');
  const saveSiteBtn = document.getElementById('saveSite');
  const previewSiteBtn = document.getElementById('previewSite');
  const resetSiteBtn = document.getElementById('resetSite');

  const socket = io();
  socket.emit('identify', { role: 'lawyer' });

  let pc = null; // RTCPeerConnection
  let localStream = null;
  let currentClientId = null;
  let pendingMode = 'video';
  let currentChatClientId = null;

    const configForm = document.getElementById('configForm');
    const keyForm = document.getElementById('keyForm');
    const defaultModels = {
      openai: 'gpt-4o-mini',
      anthropic: 'claude-3-haiku-20240307',
      groq: 'mixtral-8x7b-32768',
      gemini: 'gemini-2.0-flash'
    };

    async function postAdmin(path, data) {
    await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

    let saveTimer;

    async function saveConfig() {
      if (!configForm) return;
      const fd = new FormData(configForm);
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
      await postAdmin('/admin/config', data);
    }

    async function loadConfig() {
      try {
        const res = await fetch('/admin/config');
        const data = await res.json();
        if (configForm) {
          const prov = configForm.querySelector(`input[name="provider"][value="${data.provider}"]`);
          if (prov) prov.checked = true;
          configForm.querySelector('input[name="max_output_tokens"]').value = data.parameters.max_output_tokens;
          configForm.querySelector('input[name="temperature"]').value = data.parameters.temperature;
          configForm.querySelector('input[name="top_p"]').value = data.parameters.top_p;
          configForm.querySelector('textarea[name="prompt"]').value = data.prompt;
          const modelInput = configForm.querySelector('input[name="model"]');
          if (modelInput) modelInput.value = data.parameters.model || defaultModels[data.provider];
        }
      } catch (e) {
        console.error('config load error', e);
      }
    }

    async function loadKeys() {
      try {
        const res = await fetch('/admin/keys');
        const data = await res.json();
        if (keyForm) {
          ['openai','anthropic','groq','gemini'].forEach(k => {
            const inp = keyForm.querySelector(`input[name="${k}"]`);
            if (inp) inp.value = data[k] || '';
          });
        }
      } catch (e) {
        console.error('key load error', e);
      }
    }

    function updateProviderSettings({ skipModel } = {}) {
      if (!configForm || !keyForm) return;
      const selected = configForm.querySelector('input[name="provider"]:checked').value;
      keyForm.querySelectorAll('label.key-field').forEach(l => {
        l.style.display = l.dataset.provider === selected ? 'block' : 'none';
      });
      if (!skipModel) {
        const modelInput = configForm.querySelector('input[name="model"]');
        if (modelInput) modelInput.value = defaultModels[selected];
      }
      // Visual: destacar provider selecionado
      configForm.querySelectorAll('.provider-option').forEach(label => {
        const inp = label.querySelector('input[type="radio"]');
        if (inp) label.classList.toggle('selected', inp.checked);
      });
    }

    loadConfig().then(() => {
      updateProviderSettings({ skipModel: true });
      saveConfig();
    });
    loadKeys();

    if (configForm) {
      configForm.addEventListener('change', (e) => {
        if (e.target.name === 'provider') updateProviderSettings();
        clearTimeout(saveTimer); saveTimer = setTimeout(saveConfig, 300);
      });
      configForm.addEventListener('input', () => {
        clearTimeout(saveTimer); saveTimer = setTimeout(saveConfig, 300);
      });
      configForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveConfig();
        alert('ConfiguraÃ§Ã£o salva');
      });
    }

    if (keyForm) {
      keyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(keyForm);
        const data = {
          openai: fd.get('openai'),
        anthropic: fd.get('anthropic'),
        groq: fd.get('groq'),
        gemini: fd.get('gemini')
      };
        await postAdmin('/admin/keys', data);
        alert('Chaves salvas');
      });
    }

  function setInfo(text) { info.textContent = text; }

  let pendingClientId = null;
  socket.on('incoming-call', ({ clientId, mode }) => {
    pendingClientId = clientId;
    pendingMode = mode || 'video';
    incoming.style.display = 'flex';
  });

  rejectBtn.addEventListener('click', () => {
    incoming.style.display = 'none';
    if (pendingClientId) socket.emit('reject-call', { clientId: pendingClientId });
    pendingClientId = null;
  });

  acceptBtn.addEventListener('click', async () => {
    if (!pendingClientId) return;
    currentClientId = pendingClientId;
    pendingClientId = null;
    incoming.style.display = 'none';
    setInfo('Preparando mÃ­dia...');
    try {
      const res = await getMediaWithFallback(pendingMode);
      localStream = res.stream;
      localVideo.srcObject = localStream;
      pc = createPeerConnection(currentClientId);
      localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
      socket.emit('accept-call', { clientId: currentClientId });
      hangupBtn.disabled = false;
      setInfo('Aguardando oferta do cliente...');
    } catch (e) {
      console.error(e);
      setInfo(explainGetUserMediaError(e));
      socket.emit('reject-call', { clientId: currentClientId });
      currentClientId = null;
    }
  });

  hangupBtn.addEventListener('click', () => {
    if (currentClientId) socket.emit('end-call', { targetId: currentClientId });
    endCall('VocÃª encerrou a chamada.');
  });

  // Chat
  function appendMessage(container, role, text) {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function sendChat() {
    const msg = chatInput.value.trim();
    if (!msg || !currentChatClientId) return;
    appendMessage(messages, 'you', `VocÃª: ${msg}`);
    socket.emit('chat-message', { targetId: currentChatClientId, message: msg });
    chatInput.value = '';
  }

  sendBtn.addEventListener('click', sendChat);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); sendChat(); }
  });

  async function askAi(sessionId, msg) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message: msg })
    });
    return res.json();
  }

  socket.on('chat-message', ({ from, message }) => {
    currentChatClientId = from;
    appendMessage(messages, 'client', `Cliente: ${message}`);
    sendBtn.disabled = false;
    askAi(from, message).then(data => {
      if (data.reply) {
        appendMessage(aiMessages, 'ai', `SugestÃ£o: ${data.reply}`);
      } else if (data.error) {
        const map = {
          missing_api_key: 'Chave de API ausente.',
          limit_reached: 'Limite de uso atingido.',
          msg_too_long: 'Mensagem muito longa.',
          session_closed: 'SessÃ£o encerrada.'
        };
        appendMessage(aiMessages, 'error', `Erro IA: ${map[data.error] || data.message || data.error}`);
      }
    }).catch(e => {
      console.error('AI error', e);
      appendMessage(aiMessages, 'error', 'Erro IA inesperado.');
    });
  });

  socket.on('webrtc-offer', async ({ from, sdp }) => {
    if (!pc || from !== currentClientId) return;
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('webrtc-answer', { targetId: from, sdp: answer });
      setInfo('Conectado.');
    } catch (e) { console.error(e); }
  });

  socket.on('webrtc-ice-candidate', async ({ from, candidate }) => {
    try {
      if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) { console.warn('ICE add error', e); }
  });

  socket.on('call-ended', () => {
    endCall('Cliente encerrou a chamada.');
  });

  function createPeerConnection(targetId) {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });
    peer.onicecandidate = (e) => {
      if (e.candidate) socket.emit('webrtc-ice-candidate', { targetId, candidate: e.candidate });
    };
    peer.ontrack = (e) => {
      remoteVideo.srcObject = e.streams[0];
    };
    peer.onconnectionstatechange = () => {
      if (['failed', 'disconnected', 'closed'].includes(peer.connectionState)) {
        endCall('ConexÃ£o encerrada.');
      }
    };
    return peer;
  }

  function endCall(message) {
    if (pc) {
      pc.getSenders().forEach(s => { try { s.track && s.track.stop(); } catch {} });
      pc.close();
      pc = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      localStream = null;
    }
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    hangupBtn.disabled = true;
    currentClientId = null;
    setInfo(message || 'Aguardando chamadas...');
  }

  // Teste manual de mÃ­dia
  const testBtn = document.getElementById('testBtn');
  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      try {
        const res = await getMediaWithFallback();
        setInfo('Teste: ' + res.note);
        const tmp = res.stream;
        localVideo.srcObject = tmp;
        setTimeout(() => {
          tmp.getTracks().forEach(t => t.stop());
          if (localStream) localVideo.srcObject = localStream; else localVideo.srcObject = null;
          setInfo('Teste concluÃ­do.');
        }, 3000);
      } catch (e) {
        setInfo(explainGetUserMediaError(e));
      }
    });
  }

  // Aviso de contexto inseguro
  if (isPotentiallyInsecureContext()) {
    setInfo('Aviso: contexto inseguro pode bloquear cÃ¢mera/microfone. Use localhost ou HTTPS.');
  }

  document.querySelectorAll('.quick-reply').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.dataset.msg;
      if (!msg || !currentChatClientId) return;
      appendMessage(messages, 'you', `VocÃª: ${msg}`);
      socket.emit('chat-message', { targetId: currentChatClientId, message: msg });
    });
  });

  function sendAi() {
    const msg = aiInput.value.trim();
    if (!msg) return;
    appendMessage(aiMessages, 'you', `VocÃª: ${msg}`);
    aiInput.value = '';
    askAi('lawyer-assistant', msg).then(data => {
      if (data.reply) {
        appendMessage(aiMessages, 'ai', `IA: ${data.reply}`);
      } else if (data.error) {
        const map = {
          missing_api_key: 'Chave de API ausente.',
          limit_reached: 'Limite de uso atingido.',
          msg_too_long: 'Mensagem muito longa.',
          session_closed: 'SessÃ£o encerrada.'
        };
        appendMessage(aiMessages, 'error', `Erro IA: ${map[data.error] || data.message || data.error}`);
      }
    }).catch(e => {
      console.error('AI error', e);
      appendMessage(aiMessages, 'error', 'Erro IA inesperado.');
    });
  }

  if (aiSendBtn) {
    aiSendBtn.addEventListener('click', sendAi);
    aiInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendAi(); } });
  }

  async function loadReports() {
    try {
      const res = await fetch('/admin/reports');
      const list = await res.json();
      if (!reportsList) return;
      reportsList.innerHTML = '';
      list.forEach(r => {
        const li = document.createElement('li');
        const date = new Date(r.timestamp).toLocaleString();
        const contact = r.name ? ` - ${r.name} (${r.contact || ''})` : '';
        li.textContent = `${date}${contact}: ${r.text}`;
        reportsList.appendChild(li);
      });
    } catch (e) {
      console.error('report load error', e);
    }
  }

  if (refreshReports) {
    refreshReports.addEventListener('click', loadReports);
    loadReports();
  }

  // ====== Tema visual (seletor) ======
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
  // Inicializa com localStorage ou classe atual
  try {
    const saved = localStorage.getItem('ui.theme');
    const initial = saved && THEME_CLASSES.includes(saved)
      ? saved
      : (THEME_CLASSES.find(t => document.body.classList.contains(t)) || 'theme-d');
    applyTheme(initial);
    if (themeSelect) themeSelect.value = initial;
  } catch {}
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      const t = e.target.value;
      applyTheme(t);
      try { localStorage.setItem('ui.theme', t); } catch {}
    });
  }

  // ====== Editor de Site (Home) ======
  async function fetchSiteConfig() {
    const res = await fetch('/admin/site-config');
    return res.json();
  }
  function renderSectionsOrder(order) {
    if (!sectionsList) return;
    sectionsList.innerHTML = '';
    const labels = { hero:'Hero', sobre:'Sobre', areas:'Ãreas', contato:'Contato', formulario:'FormulÃ¡rio', secretaria:'SecretÃ¡ria' };
    order.forEach((key, idx) => {
      const wrap = document.createElement('div');
      wrap.style.display = 'flex'; wrap.style.alignItems = 'center'; wrap.style.gap = '6px';
      wrap.style.border = '1px solid rgba(148,163,184,0.35)'; wrap.style.borderRadius = '8px'; wrap.style.padding = '6px 8px';
      wrap.dataset.key = key;
      const span = document.createElement('span'); span.textContent = labels[key] || key;
      const up = document.createElement('button'); up.type='button'; up.className='secondary'; up.textContent='â†‘'; up.style.padding='4px 8px';
      const down = document.createElement('button'); down.type='button'; down.className='secondary'; down.textContent='â†“'; down.style.padding='4px 8px';
      up.addEventListener('click', ()=> moveSection(key, -1));
      down.addEventListener('click', ()=> moveSection(key, +1));
      wrap.appendChild(span); wrap.appendChild(up); wrap.appendChild(down);
      sectionsList.appendChild(wrap);
    });
  }
  function moveSection(key, delta) {
    const order = getCurrentOrder();
    const i = order.indexOf(key);
    if (i === -1) return;
    const j = i + delta;
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    renderSectionsOrder(order);
  }
  function getCurrentOrder() {
    return Array.from(sectionsList.querySelectorAll('[data-key]')).map(el=>el.dataset.key);
  }
  function fillEditor(cfg) {
    if (!siteEditor) return;
    siteEditor.querySelector('input[name="brandingTitle"]').value = cfg.brandingTitle || '';
    siteEditor.querySelector('input[name="accentColor"]').value = cfg.accentColor || '#22c55e';
    siteEditor.querySelector('input[name="heroTitle"]').value = cfg.heroTitle || '';
    siteEditor.querySelector('input[name="heroSubtitle"]').value = cfg.heroSubtitle || '';
    siteEditor.querySelector('textarea[name="aboutText"]').value = cfg.aboutText || '';
    const vis = cfg.visibility || {};
    siteEditor.querySelector('input[name="vis_hero"]').checked = !!vis.hero;
    siteEditor.querySelector('input[name="vis_sobre"]').checked = !!vis.sobre;
    siteEditor.querySelector('input[name="vis_areas"]').checked = !!vis.areas;
    siteEditor.querySelector('input[name="vis_contato"]').checked = !!vis.contato;
    siteEditor.querySelector('input[name="vis_formulario"]').checked = !!vis.formulario;
    siteEditor.querySelector('input[name="vis_secretaria"]').checked = !!vis.secretaria;
    renderSectionsOrder(cfg.sectionsOrder || ['hero','sobre','areas','contato','formulario','secretaria']);
  }
  async function loadSiteConfig() {
    try {
      const cfg = await fetchSiteConfig();
      fillEditor(cfg);
      if (cfg.theme) { try { applyTheme(cfg.theme); if (themeSelect) themeSelect.value = cfg.theme; localStorage.setItem('ui.theme', cfg.theme); } catch {} }
    } catch (e) { console.warn('site-config load error', e); }
  }
  loadSiteConfig();

  async function saveSiteConfig() {
    if (!siteEditor) return;
    const body = {
      brandingTitle: siteEditor.querySelector("input[name=\"brandingTitle\"]").value.trim() || null,
      accentColor: siteEditor.querySelector("input[name=\"accentColor\"]").value || null,
      heroTitle: siteEditor.querySelector("input[name=\"heroTitle\"]").value.trim() || null,
      heroSubtitle: siteEditor.querySelector("input[name=\"heroSubtitle\"]").value.trim() || null,
      aboutText: siteEditor.querySelector("textarea[name=\"aboutText\"]").value.trim() || null,
      sectionsOrder: getCurrentOrder(),
      visibility: {
        hero: siteEditor.querySelector("input[name=\"vis_hero\"]").checked,
        sobre: siteEditor.querySelector("input[name=\"vis_sobre\"]").checked,
        areas: siteEditor.querySelector("input[name=\"vis_areas\"]").checked,
        contato: siteEditor.querySelector("input[name=\"vis_contato\"]").checked,
        formulario: siteEditor.querySelector("input[name=\"vis_formulario\"]").checked,
        secretaria: siteEditor.querySelector("input[name=\"vis_secretaria\"]").checked,
      },
      theme: (typeof themeSelect !== 'undefined' && themeSelect) ? themeSelect.value : null
    };
    try {
      const res = await fetch('/admin/site-config', {
        method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body)
      });
      const resp = await res.json();
      editorStatus.textContent = res.ok ? 'Configurações salvas.' : (`Erro: ${resp.error || 'desconhecido'}`);
    } catch (e) {
      editorStatus.textContent = 'Erro ao salvar.';
    }
  }

  if (saveSiteBtn) saveSiteBtn.addEventListener('click', saveSiteConfig);
  if (previewSiteBtn) previewSiteBtn.addEventListener('click', () => {
    // Apenas abre a Home; as configs sÃ£o aplicadas ao carregar
    window.open('/', '_blank');
  });
  if (resetSiteBtn) resetSiteBtn.addEventListener('click', async () => {
    await fetch('/admin/site-config', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      brandingTitle:null, heroTitle:null, heroSubtitle:null, aboutText:null, accentColor:null,
      sectionsOrder: ['hero','sobre','areas','contato','formulario','secretaria'],
      visibility: { hero:true, sobre:true, areas:true, contato:true, formulario:true, secretaria:true }
    })});
    loadSiteConfig(); editorStatus.textContent='Revertido.';
  });
})();

