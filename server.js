require('dotenv').config();
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
app.use(express.static('public'));
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
  prompt: 'Você é um advogado virtual do escritório. Responda em português formal e de maneira breve. Ao receber o resumo do cliente, gere perguntas objetivas para coletar dados e verificar documentos, incluindo opções como usucapião judicial ou extrajudicial com seus respectivos custos no TJMG quando cabível. Depois das respostas do cliente, forneça uma orientação final e encerre com uma linha "RELATORIO:" resumindo as informações para o advogado.',
  limits: { maxMessages: 20, maxChars: 2000 },
  features: { upload: false, ocr: false },
  apiKeys: {
    openai: process.env.OPENAI_API_KEY || '',
    anthropic: process.env.ANTHROPIC_API_KEY || '',
    groq: process.env.GROQ_API_KEY || '',
    gemini: process.env.GEMINI_API_KEY || ''
  }
};

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
  const contentPath = path.join(__dirname, 'public', 'content.json');
  fs.readFile(contentPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading content.json:', err);
      return res.status(500).json({ error: 'failed_to_read_content' });
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/content', (req, res) => {
  const contentPath = path.join(__dirname, 'public', 'content.json');
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
  contact: z.string()
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
    const sys = `Você gera um formulário em JSON. Responda **apenas com o JSON**. O JSON deve ter uma chave 'questions', que é um array de objetos. Cada objeto representa uma pergunta e tem os seguintes campos:
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

    let userText;
    // Check if interaction limit is reached
    if (intake.interactionCount >= 3) {
      userText = `O cliente forneceu as seguintes respostas para o resumo "${intake.summary}":
${answersText}

Esta é a última interação. Você DEVE fornecer uma orientação final concisa e profissional com base em todas as informações coletadas. NÃO faça mais perguntas. Finalize com a linha "RELATORIO:" e um resumo estruturado de todas as informações.`;
    } else {
      userText = `O cliente forneceu as seguintes respostas para o resumo "${intake.summary}":
${answersText}

Sua tarefa é analisar as respostas. Existem duas possibilidades:
1.  **Informações Suficientes**: Se você tiver todos os dados para dar uma orientação final, escreva essa orientação e, em seguida, adicione a linha "RELATORIO:" com o resumo completo.
2.  **Informações Insuficientes**: Se você precisar de mais informações, gere um novo formulário de perguntas em JSON. A resposta DEVE ser **APENAS o JSON**, sem nenhum outro texto antes ou depois. O formato do JSON deve ser o mesmo de antes: { "questions": [ ... ] }.

Analise e responda.`;
    }

    const messages = [
      { role: 'system', content: adminConfig.prompt },
      { role: 'user', content: userText }
    ];

    const reply = await generate(adminConfig.provider, apiKey, messages, adminConfig.parameters);

    try {
      // Tenta extrair um bloco JSON da resposta
      const jsonMatch = reply.match(/\{.*\}/s);

      if (jsonMatch && intake.interactionCount < 3) {
        const jsonString = jsonMatch[0];
        const newQuestions = JSON.parse(jsonString);
        if (newQuestions.questions && Array.isArray(newQuestions.questions)) {
          intake.questions = newQuestions.questions;
          return res.json(newQuestions);
        }
      }

      // Se não encontrou JSON, o JSON é inválido, ou o limite de interações foi atingido, trata como resposta final
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
      } else {
        // Se o relatório não foi gerado, mas o limite foi atingido, nós o forçamos.
        if (intake.interactionCount >= 3) {
            clientReply = "Obrigado por suas respostas. Estamos gerando seu relatório.";
            const reportText = `Resumo: ${intake.summary}
Respostas: ${answersText}`;
            const newReport = { sessionId, text: reportText, timestamp: Date.now() };
            reports.push(newReport);
            if (lawyerSocket) {
                lawyerSocket.emit('new-report', newReport);
            }
            intake.stage = 'done';
        } else {
            console.warn(`RELATORIO separator not found for session ${sessionId}.`);
        }
      }
      return res.json({ reply: clientReply });

    } catch (e) {
      // Se o parsing do JSON extraído falhar, ou outro erro ocorrer
      console.error('Error processing AI response:', e);
      console.error('Original reply was:', reply);
      // Envia uma mensagem de erro amigável para o cliente
      return res.status(500).json({ reply: 'Ocorreu um erro ao processar a resposta da IA. Por favor, tente novamente.' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'provider_error', message: e.message });
  }
});

app.post('/api/report-contact', (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_request' });
  const { sessionId, name, contact } = parsed.data;
  const rpt = reports.find(r => r.sessionId === sessionId);
  if (rpt) {
    rpt.name = name;
    rpt.contact = contact;
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
  Object.assign(adminConfig, parsed.data);
  res.json({ ok: true });
});

app.post('/admin/keys', (req, res) => {
  const parsed = keySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_keys' });
  adminConfig.apiKeys = { ...adminConfig.apiKeys, ...parsed.data };
  res.json({ ok: true });
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
