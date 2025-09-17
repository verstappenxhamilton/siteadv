module.exports = (io, sessions, reports, intakes, lawyerSocket, busyWithClientId) => {
  function broadcastLawyerStatus() {
    io.emit('lawyer-status', {
      online: !!lawyerSocket,
      busy: !!busyWithClientId
    });
  }

  io.on('connection', (socket) => {
    // Identificação de papel (advogado ou cliente)
    socket.on('identify', (payload) => {
      const role = payload && payload.role;
      if (role === 'lawyer') {
        lawyerSocket = socket;
        busyWithClientId = null;
        broadcastLawyerStatus();
      } else {
        // cliente que acabou de conectar recebe status atual
        socket.emit('lawyer-status', {
          online: !!lawyerSocket,
          busy: !!busyWithClientId
        });
      }
    });

    // Cliente pede para iniciar uma chamada
    socket.on('request-call', ({ mode }) => {
      if (!lawyerSocket) {
        socket.emit('call-unavailable', { reason: 'offline' });
        return;
      }
      if (busyWithClientId) {
        socket.emit('call-unavailable', { reason: 'busy' });
        return;
      }
      busyWithClientId = socket.id;
      broadcastLawyerStatus();
      lawyerSocket.emit('incoming-call', { clientId: socket.id, mode });
    });

    // Advogado aceita a chamada
    socket.on('accept-call', ({ clientId }) => {
      if (!lawyerSocket || socket.id !== lawyerSocket.id) return;
      if (!clientId || busyWithClientId !== clientId) return;
      io.to(clientId).emit('call-accepted', { lawyerId: socket.id });
    });

    // Advogado recusa a chamada
    socket.on('reject-call', ({ clientId }) => {
      if (!lawyerSocket || socket.id !== lawyerSocket.id) return;
      if (clientId && busyWithClientId === clientId) {
        io.to(clientId).emit('call-rejected');
        busyWithClientId = null;
        broadcastLawyerStatus();
      }
    });

    // Encerrar chamada a partir de qualquer lado
    socket.on('end-call', ({ targetId }) => {
      if (targetId) io.to(targetId).emit('call-ended');
      if (socket.id === busyWithClientId || targetId === busyWithClientId) {
        busyWithClientId = null;
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
      if (lawyerSocket && socket.id === lawyerSocket.id) {
        if (targetId) io.to(targetId).emit('chat-message', { from: 'lawyer', message });
      } else {
        if (lawyerSocket) lawyerSocket.emit('chat-message', { from: socket.id, message });
      }
    });

    socket.on('disconnect', () => {
      // Se o advogado desconectar
      if (lawyerSocket && socket.id === lawyerSocket.id) {
        // Se estava em chamada, avisar o cliente
        if (busyWithClientId) {
          io.to(busyWithClientId).emit('call-ended');
        }
        lawyerSocket = null;
        busyWithClientId = null;
        broadcastLawyerStatus();
        return;
      }
      // Se o cliente em chamada desconectar
      if (socket.id === busyWithClientId && lawyerSocket) {
        lawyerSocket.emit('call-ended');
        busyWithClientId = null;
        broadcastLawyerStatus();
      }
    });
  });
}
