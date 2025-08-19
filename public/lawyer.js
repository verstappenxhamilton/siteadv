import { getMediaWithFallback, explainGetUserMediaError, isPotentiallyInsecureContext } from './media.js';

(() => {
  const info = document.getElementById('info');
  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  const incoming = document.getElementById('incoming');
  const acceptBtn = document.getElementById('acceptBtn');
  const rejectBtn = document.getElementById('rejectBtn');
  const hangupBtn = document.getElementById('hangupBtn');

  const socket = io();
  socket.emit('identify', { role: 'lawyer' });

  let pc = null; // RTCPeerConnection
  let localStream = null;
  let currentClientId = null;

  function setInfo(text) { info.textContent = text; }

  let pendingClientId = null;
  socket.on('incoming-call', ({ clientId }) => {
    pendingClientId = clientId;
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
      const res = await getMediaWithFallback();
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
})();
