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
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const videoPanel = document.getElementById('videoPanel');

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
        alert('Configuração salva');
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
    setInfo('Preparando mídia...');
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
    endCall('Você encerrou a chamada.');
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
    appendMessage(messages, 'you', `Você: ${msg}`);
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
        appendMessage(aiMessages, 'ai', `Sugestão: ${data.reply}`);
      } else if (data.error) {
        const map = {
          missing_api_key: 'Chave de API ausente.',
          limit_reached: 'Limite de uso atingido.',
          msg_too_long: 'Mensagem muito longa.',
          session_closed: 'Sessão encerrada.'
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
        endCall('Conexão encerrada.');
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

  // Teste manual de mídia
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
          setInfo('Teste concluído.');
        }, 3000);
      } catch (e) {
        setInfo(explainGetUserMediaError(e));
      }
    });
  }

  // Aviso de contexto inseguro
  if (isPotentiallyInsecureContext()) {
    setInfo('Aviso: contexto inseguro pode bloquear câmera/microfone. Use localhost ou HTTPS.');
  }

  document.querySelectorAll('.quick-reply').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.dataset.msg;
      if (!msg || !currentChatClientId) return;
      appendMessage(messages, 'you', `Você: ${msg}`);
      socket.emit('chat-message', { targetId: currentChatClientId, message: msg });
    });
  });

  function sendAi() {
    const msg = aiInput.value.trim();
    if (!msg) return;
    appendMessage(aiMessages, 'you', `Você: ${msg}`);
    aiInput.value = '';
    askAi('lawyer-assistant', msg).then(data => {
      if (data.reply) {
        appendMessage(aiMessages, 'ai', `IA: ${data.reply}`);
      } else if (data.error) {
        const map = {
          missing_api_key: 'Chave de API ausente.',
          limit_reached: 'Limite de uso atingido.',
          msg_too_long: 'Mensagem muito longa.',
          session_closed: 'Sessão encerrada.'
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

  function appendReport(r) {
    if (!reportsList) return;
    const li = document.createElement('li');
    const date = new Date(r.timestamp).toLocaleString();
    const contact = r.name ? ` - ${r.name} (${r.contact || ''})` : '';
    li.textContent = `${date}${contact}: ${r.text}`;
    reportsList.prepend(li); // Adiciona no topo
  }

  async function loadReports() {
    try {
      const res = await fetch('/admin/reports');
      const list = await res.json();
      if (!reportsList) return;
      reportsList.innerHTML = ''; // Limpa a lista antes de recarregar
      list.sort((a, b) => b.timestamp - a.timestamp).forEach(appendReport);
    } catch (e) {
      console.error('report load error', e);
    }
  }

  socket.on('new-report', appendReport);

  if (refreshReports) {
    refreshReports.addEventListener('click', loadReports);
    loadReports();
  }

  // ====== Tema visual (seletor) ======
  const THEME_CLASSES = ['theme-a','theme-b','theme-c','theme-d', 'theme-e', 'theme-f', 'theme-g'];
  const themeMeta = document.querySelector('meta#themeColor');
  const THEME_COLOR = {
    'theme-a': '#F8FAFC',
    'theme-b': '#0A66C2',
    'theme-c': '#8B5E3C',
    'theme-d': '#0B1220',
    'theme-e': '#F0FDFA',
    'theme-f': '#1C1917',
    'theme-g': '#FFFBEB'
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

  // Content Editor
const contentForm = document.getElementById('contentForm');
const areasItems = document.getElementById('areas-items');
const addArea = document.getElementById('addArea');
const socialLinks = document.getElementById('social-links');
const addSocial = document.getElementById('addSocial');
const iconPickerModal = document.getElementById('iconPickerModal');
const iconPicker = document.querySelector('.icon-picker');
const closeIconPicker = document.querySelector('.close-icon-picker');

let currentContent = {};
let currentAreaIndex = 0;

const predefinedIcons = [
  "M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z",
  "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z",
  "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
];

async function loadContent() {
    try {
        const res = await fetch('/api/content');
        currentContent = await res.json();
        populateForm(currentContent);
    } catch (e) {
        console.error('Failed to load content', e);
    }
}

function populateForm(content) {
    if (!contentForm) return;
    contentForm.querySelector('[name="hero.title"]').value = content.hero.title;
    contentForm.querySelector('[name="hero.subtitle"]').value = content.hero.subtitle;
    contentForm.querySelector('[name="hero.button.text"]').value = content.hero.button.text;
    contentForm.querySelector('[name="hero.button.link"]').value = content.hero.button.link;
    contentForm.querySelector('[name="about.title"]').value = content.about.title;
    contentForm.querySelector('[name="about.text"]').value = content.about.text;
    contentForm.querySelector('[name="areas.title"]').value = content.areas.title;
    contentForm.querySelector('[name="footer.text"]').value = content.footer.text;

    renderAreas(content.areas.items);
    renderSocial(content.footer.social);
}

function renderAreas(items = []) {
    if (!areasItems) return;
    areasItems.innerHTML = '';
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'area-item';
        div.innerHTML = `
            <label>Título: <input type="text" value="${item.title}" data-index="${index}" name="area-title"></label>
            <input type="hidden" value="${item.icon}" data-index="${index}" name="area-icon">
            <button type="button" class="choose-icon secondary" data-index="${index}">Escolher Ícone</button>
            <button type="button" class="remove-area secondary" data-index="${index}">Remover</button>
        `;
        areasItems.appendChild(div);
    });
}

function renderSocial(items = []) {
    if (!socialLinks) return;
    socialLinks.innerHTML = '';
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'social-item';
        div.innerHTML = `
            <label>Nome: <input type="text" value="${item.name}" data-index="${index}" name="social-name"></label>
            <label>Link: <input type="text" value="${item.link}" data-index="${index}" name="social-link"></label>
            <label>Ícone (SVG Path): <input type="text" value="${item.icon}" data-index="${index}" name="social-icon"></label>
            <button type="button" class="remove-social secondary" data-index="${index}">Remover</button>
        `;
        socialLinks.appendChild(div);
    });
}

function openIconPicker(areaIndex) {
    currentAreaIndex = areaIndex;
    iconPicker.innerHTML = '';
    predefinedIcons.forEach(iconPath => {
        const iconOption = document.createElement('div');
        iconOption.className = 'icon-option';
        iconOption.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="icon"><path stroke-linecap="round" stroke-linejoin="round" d="${iconPath}"/></svg>`;
        iconOption.addEventListener('click', () => {
            const iconInput = document.querySelector(`input[name="area-icon"][data-index="${currentAreaIndex}"]`);
            iconInput.value = iconPath;
            iconPickerModal.style.display = 'none';
        });
        iconPicker.appendChild(iconOption);
    });
    iconPickerModal.style.display = 'block';
}

if (contentForm) {
    addArea.addEventListener('click', () => {
        const newArea = { title: 'Nova Área', icon: '' };
        currentContent.areas.items.push(newArea);
        renderAreas(currentContent.areas.items);
    });

    addSocial.addEventListener('click', () => {
        const newSocial = { name: 'Nova Rede', link: '#', icon: '' };
        currentContent.footer.social.push(newSocial);
        renderSocial(currentContent.footer.social);
    });

    areasItems.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-area')) {
            const index = e.target.dataset.index;
            currentContent.areas.items.splice(index, 1);
            renderAreas(currentContent.areas.items);
        } else if (e.target.classList.contains('choose-icon')) {
            const index = e.target.dataset.index;
            openIconPicker(index);
        }
    });

    socialLinks.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-social')) {
            const index = e.target.dataset.index;
            currentContent.footer.social.splice(index, 1);
            renderSocial(currentContent.footer.social);
        }
    });

    closeIconPicker.addEventListener('click', () => {
        iconPickerModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target == iconPickerModal) {
            iconPickerModal.style.display = 'none';
        }
    });

    contentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(contentForm);
        const updatedContent = {
            hero: {
                title: formData.get('hero.title'),
                subtitle: formData.get('hero.subtitle'),
                button: {
                    text: formData.get('hero.button.text'),
                    link: formData.get('hero.button.link'),
                }
            },
            about: {
                title: formData.get('about.title'),
                text: formData.get('about.text'),
            },
            areas: {
                title: formData.get('areas.title'),
                items: []
            },
            footer: {
                text: formData.get('footer.text'),
                social: []
            }
        };

        const areaTitles = document.querySelectorAll('[name="area-title"]');
        const areaIcons = document.querySelectorAll('[name="area-icon"]');
        areaTitles.forEach((input, index) => {
            updatedContent.areas.items.push({
                title: input.value,
                icon: areaIcons[index].value
            });
        });

        const socialNames = document.querySelectorAll('[name="social-name"]');
        const socialLinksInputs = document.querySelectorAll('[name="social-link"]');
        const socialIcons = document.querySelectorAll('[name="social-icon"]');
        socialNames.forEach((input, index) => {
            updatedContent.footer.social.push({
                name: input.value,
                link: socialLinksInputs[index].value,
                icon: socialIcons[index].value
            });
        });

        try {
            await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedContent)
            });
            alert('Conteúdo salvo com sucesso!');
        } catch (e) {
            console.error('Failed to save content', e);
            alert('Erro ao salvar o conteúdo.');
        }
    });

    loadContent();
}

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoPanel.requestFullscreen();
      }
    });
  }
})();
