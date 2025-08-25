import { getMediaWithFallback, explainGetUserMediaError, isPotentiallyInsecureContext } from './media.js';

(() => {
  const statusBadge = document.getElementById('statusBadge');
  const info = document.getElementById('info');
  const callBtn = document.getElementById('callBtn');
  const endBtn = document.getElementById('endBtn');
  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  const callInterface = document.getElementById('callInterface');
  const contactSection = document.getElementById('contato');
  const contactLink = document.getElementById('contactLink');
  const videoContainer = document.getElementById('videoContainer');
  const chatContainer = document.getElementById('chatContainer');
  const messages = document.getElementById('messages');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const testBtn = document.getElementById('testBtn');
  const modeRadios = document.querySelectorAll('input[name="mode"]');
  const modeBar = document.querySelector('.mode-bar');
  const actions = document.querySelector('.call-actions');
  const backBtn = document.getElementById('backBtn');

  let currentMode = 'video';
  let lastOnline = false;
  let lastBusy = false;

  const socket = io();
  socket.emit('identify', { role: 'client' });

  let pc = null; // RTCPeerConnection
  let localStream = null;
  let currentLawyerId = null;

  function setInfo(text) { info.textContent = text; }

  function setStatusOnline(online, busy) {
    lastOnline = online;
    lastBusy = busy;
    if (online && !busy) {
      statusBadge.className = 'badge online';
      statusBadge.textContent = 'Advogado online';
    } else if (online && busy) {
      statusBadge.className = 'badge busy';
      statusBadge.textContent = 'Advogado em chamada';
    } else {
      statusBadge.className = 'badge offline';
      statusBadge.textContent = 'Advogado offline';
    }
    callBtn.disabled = !(online && !busy) || currentMode === 'chat';
    if (online) {
      callInterface.classList.remove('hidden');
      contactSection.classList.remove('hidden');
      contactLink.classList.remove('hidden');
    } else {
      callInterface.classList.add('hidden');
      contactSection.classList.add('hidden');
      contactLink.classList.add('hidden');
    }
    if (currentMode === 'chat') {
      sendBtn.disabled = !online;
    }
  }

  socket.on('lawyer-status', ({ online, busy }) => setStatusOnline(online, busy));

  modeRadios.forEach(r => r.addEventListener('change', () => {
    currentMode = document.querySelector('input[name="mode"]:checked').value;
    if (currentMode === 'chat') {
      videoContainer.classList.add('hidden');
      chatContainer.classList.remove('hidden');
      callBtn.classList.add('hidden');
      endBtn.classList.add('hidden');
      testBtn.classList.add('hidden');
      actions.classList.add('hidden');
      setInfo('Converse por texto com o advogado.');
      callInterface.classList.add('chat-mode');
      sendBtn.disabled = !lastOnline;
    } else {
      chatContainer.classList.add('hidden');
      actions.classList.remove('hidden');
      callBtn.classList.remove('hidden');
      endBtn.classList.remove('hidden');
      testBtn.classList.remove('hidden');
      videoContainer.classList.remove('hidden');
      callBtn.textContent = 'Ligar agora';
      setInfo('Aguardando...');
      sendBtn.disabled = true;
      callInterface.classList.remove('chat-mode');
    }
    callBtn.disabled = !(lastOnline && !lastBusy) || currentMode === 'chat';
  }));

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      chatContainer.classList.add('hidden');
      actions.classList.remove('hidden');
      currentMode = 'video';
      document.querySelector('input[name="mode"][value="video"]').checked = true;
      videoContainer.classList.remove('hidden');
      callBtn.classList.remove('hidden');
      endBtn.classList.remove('hidden');
      testBtn.classList.remove('hidden');
      setInfo('Aguardando...');
      sendBtn.disabled = true;
      callBtn.disabled = !(lastOnline && !lastBusy);
    });
  }

  callBtn.addEventListener('click', async () => {
    callBtn.disabled = true;
    setInfo('Chamando o advogado...');
    socket.emit('request-call', { mode: 'video' });
  });

  endBtn.addEventListener('click', async () => {
    endCall('Você encerrou a chamada.');
    if (currentLawyerId) socket.emit('end-call', { targetId: currentLawyerId });
  });

  socket.on('call-unavailable', ({ reason }) => {
    const map = { offline: 'O advogado está offline.', busy: 'O advogado está em outra chamada.' };
    setInfo(map[reason] || 'Chamada indisponível.');
    callBtn.disabled = false;
  });

  socket.on('call-accepted', async ({ lawyerId }) => {
    currentLawyerId = lawyerId;
    setInfo('Chamada aceita. Iniciando mídia...');
    try {
      const res = await getMediaWithFallback('video');
      localStream = res.stream;
      localVideo.srcObject = localStream;
      applyLocalPrefs();
      applyRemotePrefs();
      updateTileButtons();

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

  socket.on('call-rejected', () => {
    setInfo('Chamada recusada.');
    callBtn.disabled = false;
  });

  socket.on('call-ended', () => {
    endCall('Chamada encerrada.');
  });

  socket.on('webrtc-answer', async ({ from, sdp }) => {
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    setInfo('Conectado.');
  });

  socket.on('webrtc-ice-candidate', async ({ from, candidate }) => {
    try {
      if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) { console.warn('ICE add error', e); }
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
    endBtn.disabled = true;
    callBtn.disabled = false;
    setInfo(message || 'Aguardando...');
  }

  // ====== Controles por tile (Vídeo/Áudio) ======
  const localVideoToggle = document.getElementById('localVideoToggle');
  const localAudioToggle = document.getElementById('localAudioToggle');
  const remoteVideoToggle = document.getElementById('remoteVideoToggle');
  const remoteAudioToggle = document.getElementById('remoteAudioToggle');
  const remoteTile = document.getElementById('remoteTile');
  let prefLocalVideo = true;
  let prefLocalAudio = true;
  let prefRemoteVideoVisible = true;
  let prefRemoteAudio = true;

  function applyLocalPrefs() {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(t => t.enabled = prefLocalVideo);
    localStream.getAudioTracks().forEach(t => t.enabled = prefLocalAudio);
    if (prefLocalAudio) {
      localVideo.muted = true; // evitar eco
    }
  }
  function applyRemotePrefs() {
    remoteVideo.muted = !prefRemoteAudio;
    remoteTile.classList.toggle('video-hidden', !prefRemoteVideoVisible);
  }
  function updateTileButtons() {
    if (localVideoToggle) localVideoToggle.classList.toggle('active', prefLocalVideo);
    if (localAudioToggle) localAudioToggle.classList.toggle('active', prefLocalAudio);
    if (remoteVideoToggle) remoteVideoToggle.classList.toggle('active', prefRemoteVideoVisible);
    if (remoteAudioToggle) remoteAudioToggle.classList.toggle('active', prefRemoteAudio);
  }
  if (localVideoToggle) localVideoToggle.addEventListener('click', () => { prefLocalVideo = !prefLocalVideo; applyLocalPrefs(); updateTileButtons(); });
  if (localAudioToggle) localAudioToggle.addEventListener('click', () => { prefLocalAudio = !prefLocalAudio; applyLocalPrefs(); updateTileButtons(); });
  if (remoteVideoToggle) remoteVideoToggle.addEventListener('click', () => { prefRemoteVideoVisible = !prefRemoteVideoVisible; applyRemotePrefs(); updateTileButtons(); });
  if (remoteAudioToggle) remoteAudioToggle.addEventListener('click', () => { prefRemoteAudio = !prefRemoteAudio; applyRemotePrefs(); updateTileButtons(); });

  // (prefs aplicadas logo após captura de mídia)

  // Chat
  function appendMessage(sender, text) {
    const div = document.createElement('div');
    div.textContent = `${sender}: ${text}`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function sendChat() {
    const msg = chatInput.value.trim();
    if (!msg) return;
    appendMessage('Você', msg);
    socket.emit('chat-message', { message: msg });
    chatInput.value = '';
  }

  sendBtn.addEventListener('click', sendChat);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); sendChat(); }
  });

  socket.on('chat-message', ({ from, message }) => {
    const sender = from === 'lawyer' ? 'Advogado' : 'Cliente';
    appendMessage(sender, message);
  });

  // Teste manual de mídia
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
})();
