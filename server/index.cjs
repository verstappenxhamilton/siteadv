require('dotenv').config();
const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { generate } = require('./providers.cjs');

const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.join(projectRoot, 'server-data');
const videosDir = path.join(dataDir, 'videos');
const contentPath = path.join(dataDir, 'content.json');
const configPath = path.join(dataDir, 'admin-config.json');
const keysPath = path.join(dataDir, 'api-keys.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}
if (!fs.existsSync(contentPath)) {
  fs.writeFileSync(contentPath, JSON.stringify({}, null, 2), 'utf8');
}

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
const staticPublicDir = path.join(projectRoot, 'public');
if (fs.existsSync(staticPublicDir)) {
  app.use(express.static(staticPublicDir));
}
app.use('/videos', express.static(videosDir));
app.use(express.json({ limit: '2mb' }));
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

try {
  if (fs.existsSync(configPath)) {
    const storedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (storedConfig && typeof storedConfig === 'object') {
      if (storedConfig.provider) {
        adminConfig.provider = storedConfig.provider;
      }
      if (storedConfig.prompt) {
        adminConfig.prompt = storedConfig.prompt;
      }
      if (storedConfig.parameters && typeof storedConfig.parameters === 'object') {
        adminConfig.parameters = { ...adminConfig.parameters, ...storedConfig.parameters };
      }
      if (storedConfig.features && typeof storedConfig.features === 'object') {
        adminConfig.features = { ...adminConfig.features, ...storedConfig.features };
      }
      if (storedConfig.limits && typeof storedConfig.limits === 'object') {
        adminConfig.limits = { ...adminConfig.limits, ...storedConfig.limits };
      }
    }
  }
} catch (error) {
  console.warn('Falha ao carregar configuracao persistida:', error.message);
}

try {
  if (fs.existsSync(keysPath)) {
    const storedKeys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
    if (storedKeys && typeof storedKeys === 'object') {
      adminConfig.apiKeys = { ...adminConfig.apiKeys, ...storedKeys };
    }
  }
} catch (error) {
  console.warn('Falha ao carregar chaves persistidas:', error.message);
}

const sessions = {};
const reports = [];
const intakes = {};

// Endpoint simples para formulário de contato
app.post('/contact', (req, res) => {
  const { nome, email, mensagem } = req.body || {};
  console.log('Contato recebido:', nome, email, mensagem);
  res.sendStatus(200);
});

// Endpoints for content management
app.get('/api/content', (req, res) => {
  fs.readFile(contentPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading content.json:', err);
      return res.status(500).json({ error: 'failed_to_read_content' });
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/content', (req, res) => {
  const newContent = req.body;

  // Basic validation
  if (!newContent || typeof newContent !== 'object') {
    return res.status(400).json({ error: 'invalid_content' });
  }

  fs.writeFile(contentPath, JSON.stringify(newContent, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing to content.json:', err);
      return res.status(500).json({ error: 'failed_to_write_content' });
    }
    res.json({ ok: true });
  });
});

// New endpoint to list video files
app.get('/api/videos', (req, res) => {
  fs.readdir(videosDir, (err, files) => {
    if (err) {
      console.error('Error reading videos directory:', err);
      // If directory doesn't exist or is empty, return empty array
      return res.json([]);
    }
    const videoFiles = files.filter(file => file.endsWith('.mp4')).sort(); // Added .sort()
    res.json(videoFiles.map(file => `videos/${file}`)); // Return relative paths
  });
});

const messageSchema = z.object({
  sessionId: z.string(),
  message: z.string().min(1)
});

const summarySchema = z.object({
  sessionId: z.string(),
  summary: z.string().min(1)
});

const answersSchema = z.object({
  sessionId: z.string(),
  answers: z.record(z.string())
});

const contactSchema = z.object({
  sessionId: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  cpf: z.string(),
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
  const session = sessions[sessionId] || { count: 0, messages: [], done: false };
  if (session.done) {
    return res.status(400).json({ error: 'session_closed' });
  }
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
    let clientReply = reply;
    const idx = reply.indexOf('RELATORIO:');
    if (idx !== -1) {
      clientReply = reply.slice(0, idx).trim();
      const reportText = reply.slice(idx + 'RELATORIO:'.length).trim();
      const newReport = { sessionId, text: reportText, timestamp: Date.now() };
      reports.push(newReport);
      if (lawyerSocket) {
        lawyerSocket.emit('new-report', newReport);
      }
      intake.stage = 'done';
    }
    res.json({ reply: clientReply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'provider_error', message: e.message });
  }
});

app.post('/api/questions', chatLimiter, async (req, res) => {
  const parsed = summarySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_request' });
  }
  const { sessionId, summary } = parsed.data;
  if (summary.length > adminConfig.limits.maxChars) {
    return res.status(400).json({ error: 'msg_too_long' });
  }
  const apiKey = adminConfig.apiKeys[adminConfig.provider];
  if (!apiKey) {
    return res.status(400).json({ error: 'missing_api_key' });
  }
  try {
    const sys = `Você é um assistente que cria formulários JSON para uma triagem inicial de casos jurídicos. Sua tarefa é gerar um array de perguntas de alto nível e essenciais. **Use o tipo "buttons" ou "checklist" para TODAS as perguntas, exceto quando for absolutamente necessário um texto livre (como nomes ou descrições).** Não peça detalhes ou números de documentos inicialmente. A resposta deve ser **APENAS o JSON**. O JSON deve ter uma chave 'questions', que é um array de objetos. Cada objeto representa uma pergunta e tem os seguintes campos:
- 'id': um identificador único para a pergunta (string).
- 'text': o texto da pergunta (string).
- 'type': o tipo de input ('text', 'number', 'date', 'buttons', 'checklist').
- 'options' (opcional): um array de strings para 'type: "buttons"' ou 'type: "checklist"'.

Exemplo:
{
  "questions": [
    { "id": "nome", "text": "Qual é o seu nome?", "type": "text" },
    { "id": "valor", "text": "Qual o valor do imóvel?", "type": "number" },
    { "id": "data", "text": "Qual a data da posse?", "type": "date" },
    { "id": "tipo_usucapiao", "text": "O tipo de usucapião é judicial ou extrajudicial?", "type": "buttons", "options": ["Judicial", "Extrajudicial"] }
  ]
}`;
    const messages = [
      { role: 'system', content: sys },
      { role: 'user', content: `Resumo do cliente: ${summary}. Gere as perguntas.` }
    ];
    const reply = await generate(adminConfig.provider, apiKey, messages, { ...adminConfig.parameters, max_output_tokens: 1500 });
    const cleaned = reply.replace(/```(json)?|```/gi, '').trim();
    let questionsData;
    try {
      questionsData = JSON.parse(cleaned);
      if (!questionsData.questions || !Array.isArray(questionsData.questions)) throw new Error('invalid_json_structure');
    } catch (err) {
      console.warn('Invalid questions JSON from provider:', cleaned, err.message);
      // Fallback para uma pergunta simples em caso de erro de parsing
      questionsData = {
        questions: [
          { id: 'detalhes', text: 'Poderia fornecer mais detalhes sobre o seu caso?', type: 'textarea' }
        ]
      };
    }
    intakes[sessionId] = { summary, questions: questionsData.questions, stage: 'questions', interactionCount: 1 };
    res.json(questionsData);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'provider_error' });
  }
});

app.post('/api/answers', chatLimiter, async (req, res) => {
  const parsed = answersSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_request' });
  }
  const { sessionId, answers } = parsed.data;
  const intake = intakes[sessionId];
  if (!intake || intake.stage !== 'questions') {
    return res.status(400).json({ error: 'invalid_session' });
  }

  // Increment interaction count
  intake.interactionCount = (intake.interactionCount || 1) + 1;

  const apiKey = adminConfig.apiKeys[adminConfig.provider];
  if (!apiKey) {
    return res.status(400).json({ error: 'missing_api_key' });
  }

  try {
    const answersText = Object.entries(answers).map(([k, v]) => `- ${intake.questions.find(q => q.id === k)?.text || k}: ${v}`).join('\n');

    if (!intake.allAnswers) intake.allAnswers = [];
    intake.allAnswers.push(answersText);

    if (!intake.allQuestions) intake.allQuestions = [];
    intake.allQuestions.push(...intake.questions);

    let userText;
    let isChecklistStage = intake.interactionCount === 2;

    if (isChecklistStage) {
      userText = `O cliente respondeu às perguntas iniciais. Com base no resumo do caso ("${intake.summary}") e nas respostas, sua única tarefa agora é gerar uma lista de documentos necessários. A resposta DEVE ser APENAS um JSON válido, nada mais.
      
      Exemplo de resposta válida:
      {"questions":[{"id":"documentos","text":"Por favor, marque os documentos que você já possui:","type":"checklist","options":["RG","CPF","Comprovante de Residência"]}]}`;

    } else { // interactionCount >= 3
      const allPreviousAnswers = intake.allAnswers.slice(0, -1).join('\n');
      const documentAnswers = answersText;
      userText = `O cliente respondeu às perguntas iniciais e agora selecionou os documentos que possui. Com base em TODAS as informações, gere o relatório final.
      
      **Resumo do Caso:**
      ${intake.summary}

      **Respostas Iniciais:**
      ${allPreviousAnswers}

      **Documentos Selecionados:**
      ${documentAnswers}

      NÃO FAÇA MAIS PERGUNTAS. Forneça uma orientação final e depois finalize com "RELATORIO:" e um resumo em Markdown com as seções "### Resumo do Caso", "### Respostas Iniciais", "### Documentos" e "### Recomendação".`;
    }

    const messages = [
      { role: 'system', content: adminConfig.prompt },
      { role: 'user', content: userText }
    ];

    let reply = await generate(adminConfig.provider, apiKey, messages, adminConfig.parameters);

    if (isChecklistStage) {
      const cleanedReply = reply.replace(/```(json)?|```/gi, '').trim(); // Added cleaning
      try {
        const jsonResponse = JSON.parse(cleanedReply); // Use cleanedReply
        if (jsonResponse.questions && Array.isArray(jsonResponse.questions)) {
          intake.questions = jsonResponse.questions;
          return res.json(jsonResponse);
        }
        throw new Error("Invalid JSON structure on first try.");
      } catch (e) {
        console.warn("First attempt to get checklist JSON failed. Retrying...", e.message);
        const retryPrompt = `Sua resposta anterior não foi um JSON válido. Responda APENAS com um JSON válido para uma checklist de documentos. Exemplo: {"questions":[{"id":"documentos","text":"Marque os documentos que possui:","type":"checklist","options":["RG","CPF"]}]}`;
        const retryMessages = [{ role: 'user', content: retryPrompt }];
        let retryReply = await generate(adminConfig.provider, apiKey, retryMessages, adminConfig.parameters); // New variable for retry reply
        const cleanedRetryReply = retryReply.replace(/```(json)?|```/gi, '').trim(); // Clean retry reply
        try {
          const jsonResponse = JSON.parse(cleanedRetryReply); // Use cleanedRetryReply
          if (jsonResponse.questions && Array.isArray(jsonResponse.questions)) {
            intake.questions = jsonResponse.questions;
            return res.json(jsonResponse);
          }
          throw new Error("Invalid JSON structure on second try.");
        } catch (e2) {
          console.error("AI failed on second attempt. Ending gracefully.", e2.message);
          return res.json({ reply: "Obrigado pelas respostas. Não foi possível gerar a lista de documentos. Por favor, preencha seus dados para finalizarmos.", action: "collect_contact_info" });
        }
      }
    } else {
      // Final interaction, expecting a text reply with a report
      let clientReply = reply;
      const idx = reply.indexOf('RELATORIO:');
      if (idx !== -1) {
        clientReply = reply.slice(0, idx).trim();
        const reportText = reply.slice(idx + 'RELATORIO:'.length).trim();
        const newReport = { sessionId, text: reportText, timestamp: Date.now() };
        reports.push(newReport);
        if (lawyerSocket) lawyerSocket.emit('new-report', newReport);
        intake.stage = 'done';
      } else {
        clientReply = "Obrigado por suas respostas. Estamos gerando seu relatório.";
        const reportText = `Resumo: ${intake.summary}
Respostas: ${intake.allAnswers.join('\
')}`;
        const newReport = { sessionId, text: reportText, timestamp: Date.now() };
        reports.push(newReport);
        if (lawyerSocket) lawyerSocket.emit('new-report', newReport);
        intake.stage = 'done';
      }
      return res.json({ reply: clientReply, action: "collect_contact_info" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'provider_error', message: e.message });
  }
});

app.post('/api/report-contact', (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_request' });
  const { sessionId, name, email, phone, cpf } = parsed.data;
  const rpt = reports.find(r => r.sessionId === sessionId);
  if (rpt) {
    rpt.name = name;
    // Combine contact details into a single string for the report
    rpt.contact = `Email: ${email}, Telefone: ${phone}, CPF: ${cpf}`;
  }
  res.json({ ok: true });
});

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

app.get('/admin/config', (req, res) => {
  const safe = { ...adminConfig };
  delete safe.apiKeys;
  res.json(safe);
});

app.post('/admin/config', (req, res) => {
  const parsed = configSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_config' });

  const updates = parsed.data;
  if (updates.provider) {
    adminConfig.provider = updates.provider;
  }
  if (updates.prompt) {
    adminConfig.prompt = updates.prompt;
  }
  if (updates.parameters) {
    adminConfig.parameters = { ...adminConfig.parameters, ...updates.parameters };
  }
  if (updates.features) {
    adminConfig.features = { ...adminConfig.features, ...updates.features };
  }
  if (updates.limits) {
    adminConfig.limits = { ...adminConfig.limits, ...updates.limits };
  }

  try {
    const safeConfig = {
      provider: adminConfig.provider,
      parameters: adminConfig.parameters,
      prompt: adminConfig.prompt,
      features: adminConfig.features,
      limits: adminConfig.limits
    };
    fs.writeFileSync(configPath, JSON.stringify(safeConfig, null, 2), 'utf8');
    res.json({ ok: true });
  } catch (error) {
    console.error('Failed to persist config:', error);
    res.status(500).json({ error: 'persist_config_failed' });
  }
});

app.post('/admin/keys', (req, res) => {
  const parsed = keySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_keys' });
  adminConfig.apiKeys = { ...adminConfig.apiKeys, ...parsed.data };
  try {
    fs.writeFileSync(keysPath, JSON.stringify(adminConfig.apiKeys, null, 2), 'utf8');
    res.json({ ok: true });
  } catch (error) {
    console.error('Failed to persist API keys:', error);
    res.status(500).json({ error: 'persist_keys_failed' });
  }
});

app.get('/admin/keys', (req, res) => {
  res.json(adminConfig.apiKeys);
});

app.get('/admin/reports', (req, res) => {
  res.json(reports);
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

const cliArgs = new Set(process.argv.slice(2));
const isPreview = cliArgs.has('--preview');
const isProduction = cliArgs.has('--production') || isPreview || process.env.NODE_ENV === 'production';
const useViteDevServer = !isProduction;

async function startServer() {
  if (useViteDevServer) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: projectRoot,
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(projectRoot, 'dist');
    const indexHtmlPath = path.join(distPath, 'index.html');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }
    app.get('*', (req, res, next) => {
      if (req.method !== 'GET') return next();
      if (req.path.startsWith('/api') || req.path.startsWith('/admin') || req.path.startsWith('/videos') || req.path.startsWith('/socket.io') || req.path.startsWith('/contact')) {
        return next();
      }
      if (fs.existsSync(indexHtmlPath)) {
        res.sendFile(indexHtmlPath);
      } else {
        res.status(404).send('Not Found');
      }
    });
  }

  const PORT = Number(process.env.PORT) || 5173;
  const HOST = process.env.HOST || '0.0.0.0';
  server.listen(PORT, HOST, () => {
    const scheme = usingHttps ? 'https' : 'http';
    console.log(`Servidor iniciado em ${scheme}://localhost:${PORT}`);
    console.log(`Acesse via IP local: ${scheme}://<SEU_IP_LOCAL>:${PORT}`);
    if (!usingHttps) {
      console.log('Aviso: HTTP em IP (ex.: 192.168.x.x) pode bloquear câmera/microfone. Configure HTTPS local.');
    }
  });
}

startServer().catch((error) => {
  console.error('Falha ao iniciar servidor:', error);
  process.exit(1);
});
