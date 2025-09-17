require('dotenv').config();
const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const state = require('./state');

const app = express();
// Permitir que o Express confie nos cabeçalhos X-Forwarded-* quando estiver atrás de proxies
// evitando erros do express-rate-limit quando esses cabeçalhos forem adicionados.
app.set('trust proxy', 1);

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
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());
const chatLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

const adminConfig = {
  provider: 'openai',
  parameters: {
    model: 'gpt-4o-mini',
    max_output_tokens: 1024,
    temperature: 0.8,
    top_p: 1,
    stop_sequences: []
  },
  prompt: 'Você é um advogado virtual do escritório. Sua tarefa é fazer uma triagem inicial. **Faça perguntas essenciais e de alto nível primeiro.** Evite pedir detalhes específicos como números de documento ou apólice, a menos que seja absolutamente crítico. Por exemplo, em vez de pedir o número da apólice, pergunte apenas se existe seguro. Responda em português formal e de maneira breve. Ao receber o resumo do cliente, gere perguntas objetivas para coletar dados. Depois das respostas, forneça uma orientação final e encerre com "RELATORIO:" e um resumo. Importante: Não peça informações de contato (nome, telefone, email), o sistema fará isso.',
  limits: { maxMessages: 20, maxChars: 2000 },
  features: { upload: false, ocr: false },
  apiKeys: {
    openai: process.env.OPENAI_API_KEY || '',
    anthropic: process.env.ANTHROPIC_API_KEY || '',
    groq: process.env.GROQ_API_KEY || '',
    gemini: process.env.GEMINI_API_KEY || ''
  }
};

// Routes
const contentRoutes = require('./routes/content');
const chatRoutes = require('./routes/chat')(adminConfig, state);
const adminRoutes = require('./routes/admin')(adminConfig, state);

app.use('/api', contentRoutes);
app.use('/api', chatLimiter, chatRoutes);
app.use('/admin', adminRoutes);

// Socket.IO
require('./socket')(io, state);

// Endpoint simples para formulário de contato
app.post('/contact', (req, res) => {
  const { nome, email, mensagem } = req.body || {};
  console.log('Contato recebido:', nome, email, mensagem);
  res.sendStatus(200);
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
