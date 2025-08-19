import { getMediaWithFallback, explainGetUserMediaError, isPotentiallyInsecureContext } from './media.js';

(() => {
  const statusBadge = document.getElementById('statusBadge');
  const info = document.getElementById('info');
  const callBtn = document.getElementById('callBtn');
  const endBtn = document.getElementById('endBtn');
  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');

  const socket = io();
  socket.emit('identify', { role: 'client' });

  let pc = null; // RTCPeerConnection
  let localStream = null;
  let currentLawyerId = null;

  function setInfo(text) { info.textContent = text; }

  function setStatusOnline(online, busy) {
    if (online && !busy) {
      statusBadge.className = 'badge online';
      statusBadge.textContent = 'Advogado online';
      callBtn.disabled = false;
    } else if (online && busy) {
      statusBadge.className = 'badge busy';
      statusBadge.textContent = 'Advogado em chamada';
      callBtn.disabled = true;
    } else {
      statusBadge.className = 'badge';
      statusBadge.textContent = 'Advogado offline';
      callBtn.disabled = true;
    }
  }

  socket.on('lawyer-status', ({ online, busy }) => setStatusOnline(online, busy));

  callBtn.addEventListener('click', async () => {
    callBtn.disabled = true;
    setInfo('Chamando o advogado...');
    socket.emit('request-call');
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
      const res = await getMediaWithFallback();
      localStream = res.stream;
      localVideo.srcObject = localStream;

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
})();
