module.exports = (io, state) => {
  const { realtime } = state;
  function broadcastLawyerStatus() {
    io.emit('lawyer-status', {
      online: !!realtime.lawyerSocket,
      busy: !!realtime.busyWithClientId
    });
  }

  io.on('connection', (socket) => {
    // Identificação de papel (advogado ou cliente)
    socket.on('identify', (payload) => {
      const role = payload && payload.role;
      if (role === 'lawyer') {
        realtime.lawyerSocket = socket;
        realtime.busyWithClientId = null;
        broadcastLawyerStatus();
      } else {
        // cliente que acabou de conectar recebe status atual
        socket.emit('lawyer-status', {
          online: !!realtime.lawyerSocket,
          busy: !!realtime.busyWithClientId
        });
      }
    });

    // Cliente pede para iniciar uma chamada
    socket.on('request-call', ({ mode }) => {
      if (!realtime.lawyerSocket) {
        socket.emit('call-unavailable', { reason: 'offline' });
        return;
      }
      if (realtime.busyWithClientId) {
        socket.emit('call-unavailable', { reason: 'busy' });
        return;
      }
      realtime.busyWithClientId = socket.id;
      broadcastLawyerStatus();
      realtime.lawyerSocket.emit('incoming-call', { clientId: socket.id, mode });
    });

    // Advogado aceita a chamada
    socket.on('accept-call', ({ clientId }) => {
      if (!realtime.lawyerSocket || socket.id !== realtime.lawyerSocket.id) return;
      if (!clientId || realtime.busyWithClientId !== clientId) return;
      io.to(clientId).emit('call-accepted', { lawyerId: socket.id });
    });

    // Advogado recusa a chamada
    socket.on('reject-call', ({ clientId }) => {
      if (!realtime.lawyerSocket || socket.id !== realtime.lawyerSocket.id) return;
      if (clientId && realtime.busyWithClientId === clientId) {
        io.to(clientId).emit('call-rejected');
        realtime.busyWithClientId = null;
        broadcastLawyerStatus();
      }
    });

    // Encerrar chamada a partir de qualquer lado
    socket.on('end-call', ({ targetId }) => {
      if (targetId) io.to(targetId).emit('call-ended');
      if (socket.id === realtime.busyWithClientId || targetId === realtime.busyWithClientId) {
        realtime.busyWithClientId = null;
        broadcastLawyerStatus();
      }
    });

    // Sinalização WebRTC: oferta, resposta, ICE
    socket.on('webrtc-offer', ({ targetId, sdp }) => {
      if (targetId && sdp) io.to(targetId).emit('webrtc-offer', { from: socket.id, sdp });
    });
    socket.on('webrtc-answer', ({ targetId, sdp }) => {
      if (targetId && sdp) io.to(targetId).emit('webrtc-answer', { from: socket.id, sdp });
    });
    socket.on('webrtc-ice-candidate', ({ targetId, candidate }) => {
      if (targetId && candidate) io.to(targetId).emit('webrtc-ice-candidate', { from: socket.id, candidate });
    });

    // Mensagens de chat de texto
    socket.on('chat-message', ({ targetId, message }) => {
      if (!message) return;
      if (realtime.lawyerSocket && socket.id === realtime.lawyerSocket.id) {
        if (targetId) io.to(targetId).emit('chat-message', { from: 'lawyer', message });
      } else {
        if (realtime.lawyerSocket) realtime.lawyerSocket.emit('chat-message', { from: socket.id, message });
      }
    });

    socket.on('disconnect', () => {
      // Se o advogado desconectar
      if (realtime.lawyerSocket && socket.id === realtime.lawyerSocket.id) {
        // Se estava em chamada, avisar o cliente
        if (realtime.busyWithClientId) {
          io.to(realtime.busyWithClientId).emit('call-ended');
        }
        realtime.lawyerSocket = null;
        realtime.busyWithClientId = null;
        broadcastLawyerStatus();
        return;
      }
      // Se o cliente em chamada desconectar
      if (socket.id === realtime.busyWithClientId && realtime.lawyerSocket) {
        realtime.lawyerSocket.emit('call-ended');
        realtime.busyWithClientId = null;
        broadcastLawyerStatus();
      }
    });
  });
}
