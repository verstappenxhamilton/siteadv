import { io } from 'socket.io-client';
import { getMediaWithFallback, explainGetUserMediaError, isPotentiallyInsecureContext } from './media.js';

(() => {
  // Elementos da UI
  const statusBadge = document.getElementById('statusBadge');
  const heroContactBtn = document.getElementById('heroContactBtn');
  const info = document.getElementById('info');
  const callBtn = document.getElementById('callBtn');
  const endBtn = document.getElementById('endBtn');
  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  const videoContainer = document.getElementById('videoContainer');
  const chatContainer = document.getElementById('chatContainer');
  const messages = document.getElementById('messages');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const testBtn = document.getElementById('testBtn');
  const modeRadios = document.querySelectorAll('input[name="mode"]');
  const actions = document.querySelector('.call-actions');
  const backBtn = document.getElementById('backBtn');

  // VariÃ¡veis de estado
  let currentMode = 'video';
  let lastOnline = false;
  let lastBusy = false;
  let pc = null; // RTCPeerConnection
  let localStream = null;
  let currentLawyerId = null;

  // ConexÃ£o com o servidor
  const socket = io();
  socket.emit('identify', { role: 'client' });

  function setInfo(text) {
    if(info) info.textContent = text;
  }

  // FunÃ§Ã£o central para atualizar a UI baseada no status do advogado
  function setStatusOnline(online, busy) {
    lastOnline = online;
    lastBusy = busy;

    if (online && !busy) {
      statusBadge.textContent = 'Advogado Online';
      statusBadge.classList.remove('bg-secondary', 'bg-warning', 'text-dark');
      statusBadge.classList.add('bg-success');
      if (heroContactBtn) heroContactBtn.classList.remove('disabled');
    } else if (online && busy) {
      statusBadge.textContent = 'Advogado em Chamada';
      statusBadge.classList.remove('bg-secondary', 'bg-success');
      statusBadge.classList.add('bg-warning', 'text-dark');
      if (heroContactBtn) heroContactBtn.classList.add('disabled');
    } else {
      statusBadge.textContent = 'Advogado Offline';
      statusBadge.classList.remove('bg-success', 'bg-warning', 'text-dark');
      statusBadge.classList.add('bg-secondary');
      if (heroContactBtn) heroContactBtn.classList.add('disabled');
    }

    if (callBtn) callBtn.disabled = !(online && !busy);
    if (sendBtn && currentMode === 'chat') sendBtn.disabled = !online;
  }

  socket.on('lawyer-status', ({ online, busy }) => setStatusOnline(online, busy));

  // LÃ³gica para o modal de contato
  modeRadios.forEach(r => r.addEventListener('change', () => {
    currentMode = document.querySelector('input[name="mode"]:checked').value;
    const isChatMode = currentMode === 'chat';
    const videoColumn = document.getElementById('video-column');
    const controlsColumn = document.getElementById('controls-column');

    if (videoColumn) videoColumn.classList.toggle('d-none', isChatMode);
    if (actions) actions.classList.toggle('d-none', isChatMode);
    if (chatContainer) chatContainer.classList.toggle('d-none', !isChatMode);

    if (controlsColumn) {
      controlsColumn.classList.toggle('col-lg-4', !isChatMode);
      controlsColumn.classList.toggle('col-lg-12', isChatMode);
    }

    if (isChatMode) {
      setInfo('Converse por texto com o advogado.');
      sendBtn.disabled = !lastOnline;
    } else {
      setInfo('Aguardando...');
      sendBtn.disabled = true;
      callBtn.disabled = !(lastOnline && !lastBusy);
    }
  }));

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      const videoRadio = document.querySelector('input[name="mode"][value="video"]');
      if (videoRadio) videoRadio.click();
    });
  }

  // LÃ³gica WebRTC
  callBtn.addEventListener('click', async () => {
    callBtn.disabled = true;
    setInfo('Chamando o advogado...');
    socket.emit('request-call', { mode: 'video' });
  });

  endBtn.addEventListener('click', async () => {
    endCall('VocÃª encerrou a chamada.');
    if (currentLawyerId) socket.emit('end-call', { targetId: currentLawyerId });
  });

  socket.on('call-unavailable', ({ reason }) => {
    const map = { offline: 'O advogado estÃ¡ offline.', busy: 'O advogado estÃ¡ em outra chamada.' };
    setInfo(map[reason] || 'Chamada indisponÃ­vel.');
    callBtn.disabled = false;
  });

  socket.on('call-accepted', async ({ lawyerId }) => {
    currentLawyerId = lawyerId;
    setInfo('Chamada aceita. Iniciando mÃ­dia...');
    try {
      const res = await getMediaWithFallback('video');
      localStream = res.stream;
      localVideo.srcObject = localStream;
      document.querySelector('#localTile .video-placeholder')?.classList.add('d-none');
      pc = createPeerConnection(lawyerId);
      localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('webrtc-offer', { targetId: lawyerId, sdp: offer });
      setInfo('Conectando...');
      endBtn.disabled = false;
    } catch (e) {
      console.error(e);
      setInfo(explainGetUserMediaError(e));
      callBtn.disabled = false;
    }
  });

  socket.on('call-rejected', () => { setInfo('Chamada recusada.'); callBtn.disabled = false; });
  socket.on('call-ended', () => { endCall('Chamada encerrada.'); });

  socket.on('webrtc-answer', async ({ sdp }) => {
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    setInfo('Conectado.');
  });

  socket.on('webrtc-ice-candidate', async ({ candidate }) => {
    try {
      if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) { console.warn('ICE add error', e); }
  });

  function createPeerConnection(targetId) {
    const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    peer.onicecandidate = (e) => {
      if (e.candidate) socket.emit('webrtc-ice-candidate', { targetId, candidate: e.candidate });
    };
    peer.ontrack = (e) => {
      remoteVideo.srcObject = e.streams[0];
      document.querySelector('#remoteTile .video-placeholder')?.classList.add('d-none');
    };
    peer.onconnectionstatechange = () => {
      if (['failed', 'disconnected', 'closed'].includes(peer.connectionState)) endCall('ConexÃ£o encerrada.');
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
    document.querySelectorAll('.video-placeholder').forEach(p => p.classList.remove('d-none'));
    endBtn.disabled = true;
    callBtn.disabled = false;
    setInfo(message || 'Aguardando...');
  }

  // Chat dentro do Modal
  function appendMessage(sender, text) {
    const div = document.createElement('div');
    div.classList.add('msg', sender === 'VocÃª' ? 'user' : 'client');
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function sendChat() {
    const msg = chatInput.value.trim();
    if (!msg) return;
    appendMessage('VocÃª', msg);
    socket.emit('chat-message', { message: msg });
    chatInput.value = '';
  }

  sendBtn.addEventListener('click', sendChat);
  chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendChat(); } });

  socket.on('chat-message', ({ from, message }) => {
    const sender = from === 'lawyer' ? 'Advogado' : 'Cliente';
    appendMessage(sender, message);
  });

  // Teste de MÃ­dia
  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      try {
        const res = await getMediaWithFallback(currentMode);
        setInfo('Teste: ' + res.note);
        const tmp = res.stream;
        localVideo.srcObject = tmp;
        setTimeout(() => {
          tmp.getTracks().forEach(t => t.stop());
          if (localStream) localVideo.srcObject = localStream; else localVideo.srcObject = null;
          setInfo('Teste concluÃ­do.');
        }, 3000);
      } catch (e) { setInfo(explainGetUserMediaError(e)); }
    });
  }

  // Aviso de Contexto Inseguro
  if (isPotentiallyInsecureContext()) {
    setInfo('Aviso: contexto inseguro pode bloquear cÃ¢mera/microfone. Use localhost ou HTTPS.');
  }
  const contactModalEl = document.getElementById('contactModal');
  if (contactModalEl) {
    contactModalEl.addEventListener('hidden.bs.modal', () => {
      try { endCall('Aguardando...'); } catch {}
      const videoRadio = document.querySelector('input[name="mode"][value="video"]');
      if (videoRadio) {
        videoRadio.checked = true;
        videoRadio.dispatchEvent(new Event('change'));
      }
    });
    contactModalEl.addEventListener('shown.bs.modal', () => {
      callBtn.disabled = !(lastOnline && !lastBusy);
      if (currentMode === 'chat') { sendBtn.disabled = !lastOnline; }
      setInfo('Aguardando...');
    });
  }
})();

