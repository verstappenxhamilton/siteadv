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

  const socket = io();
  socket.emit('identify', { role: 'lawyer' });

  let pc = null; // RTCPeerConnection
  let localStream = null;
  let currentClientId = null;
  let pendingMode = 'video';
  let currentChatClientId = null;

    const configForm = document.getElementById('configForm');
    const keyForm = document.getElementById('keyForm');

    async function postAdmin(path, data) {
    await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
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

    function updateKeyVisibility() {
      if (!configForm || !keyForm) return;
      const selected = configForm.querySelector('input[name="provider"]:checked').value;
      keyForm.querySelectorAll('label.key-field').forEach(l => {
        l.style.display = l.dataset.provider === selected ? 'block' : 'none';
      });
    }

    loadConfig().then(updateKeyVisibility);
    loadKeys();

    if (configForm) {
      configForm.addEventListener('change', (e) => {
        if (e.target.name === 'provider') updateKeyVisibility();
      });
      configForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(configForm);
        const data = {
          provider: fd.get('provider'),
          parameters: {
          max_output_tokens: Number(fd.get('max_output_tokens')),
          temperature: Number(fd.get('temperature')),
          top_p: Number(fd.get('top_p'))
        },
        prompt: fd.get('prompt')
      };
      await postAdmin('/admin/config', data);
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

  async function loadReports() {
    try {
      const res = await fetch('/admin/reports');
      const list = await res.json();
      if (!reportsList) return;
      reportsList.innerHTML = '';
      list.forEach(r => {
        const li = document.createElement('li');
        const date = new Date(r.timestamp).toLocaleString();
        li.textContent = `${date}: ${r.text}`;
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
})();
