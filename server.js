const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');

const app = express();

// Detectar certificados locais para HTTPS
let server;
let usingHttps = false;
const certKeyPath = process.env.SSL_KEY || path.join(__dirname, 'cert', 'server.key');
const certCrtPath = process.env.SSL_CERT || path.join(__dirname, 'cert', 'server.crt');
if (fs.existsSync(certKeyPath) && fs.existsSync(certCrtPath)) {
  try {
    const creds = {
      key: fs.readFileSync(certKeyPath),
      cert: fs.readFileSync(certCrtPath)
    };
    server = https.createServer(creds, app);
    usingHttps = true;
  } catch (e) {
    console.warn('Falha ao carregar certificados, usando HTTP:', e.message);
    server = http.createServer(app);
  }
} else {
  server = http.createServer(app);
}

const io = new Server(server, {
  cors: { origin: '*' }
});

// Servir arquivos estáticos
app.use(express.static('public'));

let lawyerSocket = null; // socket do advogado
let busyWithClientId = null; // se estiver em ligação, guarda o id do cliente

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
  socket.on('request-call', () => {
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
    lawyerSocket.emit('incoming-call', { clientId: socket.id });
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

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
server.listen(PORT, HOST, () => {
  const scheme = usingHttps ? 'https' : 'http';
  console.log(`Servidor iniciado em ${scheme}://localhost:${PORT}`);
  console.log(`Acesse via IP local: ${scheme}://<SEU_IP_LOCAL>:${PORT}`);
  if (!usingHttps) {
    console.log('Aviso: HTTP em IP (ex.: 192.168.x.x) pode bloquear câmera/microfone. Configure HTTPS local.');
  }
});
