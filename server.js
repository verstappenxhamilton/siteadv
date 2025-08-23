const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { generate } = require('./providers');

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

// Middleware
app.use(express.static('public'));
app.use(express.json());
const chatLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

const adminConfig = {
  provider: 'openai',
  parameters: {
    model: 'gpt-4o-mini',
    max_output_tokens: 200,
    temperature: 0.7,
    top_p: 1,
    stop_sequences: []
  },
  prompt: 'Você é um advogado profissional. Responda de forma curta, clara e educada em português.',
  limits: { maxMessages: 20, maxChars: 1000 },
  features: { upload: false, ocr: false },
  apiKeys: {
    openai: process.env.OPENAI_API_KEY || '',
    anthropic: process.env.ANTHROPIC_API_KEY || '',
    groq: process.env.GROQ_API_KEY || '',
    gemini: process.env.GEMINI_API_KEY || ''
  }
};

const sessions = {};

// Endpoint simples para formulário de contato
app.post('/contact', (req, res) => {
  const { nome, email, mensagem } = req.body || {};
  console.log('Contato recebido:', nome, email, mensagem);
  res.sendStatus(200);
});

const messageSchema = z.object({
  sessionId: z.string(),
  message: z.string().min(1)
});

app.post('/api/chat', chatLimiter, async (req, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_request' });
  }
  const { sessionId, message } = parsed.data;
  if (message.length > adminConfig.limits.maxChars) {
    return res.status(400).json({ error: 'msg_too_long' });
  }
  const session = sessions[sessionId] || { count: 0, messages: [] };
  if (session.count >= adminConfig.limits.maxMessages) {
    return res.status(400).json({ error: 'limit_reached' });
  }
  session.count++;
  session.messages.push({ role: 'user', content: message });
  sessions[sessionId] = session;
  const apiKey = adminConfig.apiKeys[adminConfig.provider];
  if (!apiKey) {
    return res.status(400).json({ error: 'missing_api_key' });
  }
  try {
    const aiMessages = [{ role: 'system', content: adminConfig.prompt }, ...session.messages];
    const reply = await generate(adminConfig.provider, apiKey, aiMessages, adminConfig.parameters);
    session.messages.push({ role: 'assistant', content: reply });
    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'provider_error', message: e.message });
  }
});

const adminKey = process.env.ADMIN_KEY || 'secret';

const configSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'groq', 'gemini']).optional(),
  parameters: z.object({
    model: z.string().optional(),
    max_output_tokens: z.number().optional(),
    temperature: z.number().optional(),
    top_p: z.number().optional(),
    stop_sequences: z.array(z.string()).optional()
  }).partial().optional(),
  prompt: z.string().optional(),
  features: z.object({ upload: z.boolean().optional(), ocr: z.boolean().optional() }).partial().optional(),
  limits: z.object({ maxMessages: z.number().optional(), maxChars: z.number().optional() }).partial().optional()
});

const keySchema = z.object({
  openai: z.string().optional(),
  anthropic: z.string().optional(),
  groq: z.string().optional(),
  gemini: z.string().optional()
});

app.use('/admin', (req, res, next) => {
  if (req.headers['x-admin-key'] !== adminKey) return res.sendStatus(401);
  next();
});

app.get('/admin/config', (req, res) => {
  const safe = { ...adminConfig };
  delete safe.apiKeys;
  res.json(safe);
});

app.post('/admin/config', (req, res) => {
  const parsed = configSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_config' });
  Object.assign(adminConfig, parsed.data);
  res.json({ ok: true });
});

app.post('/admin/keys', (req, res) => {
  const parsed = keySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_keys' });
  adminConfig.apiKeys = { ...adminConfig.apiKeys, ...parsed.data };
  res.json({ ok: true });
});

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
