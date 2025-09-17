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

const fsp = fs.promises;
const rootDir = path.resolve(__dirname, '..');
const serverPublicDir = path.join(__dirname, 'public');
const isProd = process.argv.includes('--prod') || process.argv.includes('--production') || process.env.NODE_ENV === 'production';

(async () => {
  const app = express();
  app.set('trust proxy', 1);

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
    } catch (error) {
      console.warn('Falha ao carregar certificados, usando HTTP:', error.message);
      server = http.createServer(app);
    }
  }

  if (!server) {
    server = http.createServer(app);
  }

  const io = new Server(server, {
    cors: { origin: '*' }
  });

  if (fs.existsSync(serverPublicDir)) {
    app.use(express.static(serverPublicDir));
  }

  app.use(express.json());

  const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false
  });

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

  const sessions = {};
  const reports = [];
  const intakes = {};

  app.post('/contact', (req, res) => {
    const { nome, email, mensagem } = req.body || {};
    console.log('Contato recebido:', nome, email, mensagem);
    res.sendStatus(200);
  });

  app.get('/api/content', async (req, res) => {
    try {
      const contentPath = path.join(serverPublicDir, 'content.json');
      const content = await fsp.readFile(contentPath, 'utf8');
      res.json(JSON.parse(content));
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.json({});
      }
      console.error('Error reading content.json:', error);
      res.status(500).json({ error: 'failed_to_read_content' });
    }
  });

  app.post('/api/content', async (req, res) => {
    const contentPath = path.join(serverPublicDir, 'content.json');
    const newContent = req.body;

    if (!newContent || typeof newContent !== 'object') {
      return res.status(400).json({ error: 'invalid_content' });
    }

    try {
      await fsp.mkdir(serverPublicDir, { recursive: true });
      await fsp.writeFile(contentPath, JSON.stringify(newContent, null, 2), 'utf8');
      res.json({ ok: true });
    } catch (error) {
      console.error('Error writing to content.json:', error);
      res.status(500).json({ error: 'failed_to_write_content' });
    }
  });

  app.get('/api/videos', async (req, res) => {
    try {
      const videosDir = path.join(serverPublicDir, 'videos');
      const files = await fsp.readdir(videosDir);
      const videoFiles = files.filter((file) => file.endsWith('.mp4')).sort();
      res.json(videoFiles.map((file) => `videos/${file}`));
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error reading videos directory:', error);
      }
      res.json([]);
    }
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
    cpf: z.string()
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

    session.count += 1;
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
        const intake = intakes[sessionId];
        if (intake) {
          intake.stage = 'done';
        }
        if (lawyerSocket) {
          lawyerSocket.emit('new-report', newReport);
        }
        session.done = true;
      }

      res.json({ reply: clientReply });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'provider_error', message: error.message });
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

      const reply = await generate(
        adminConfig.provider,
        apiKey,
        messages,
        { ...adminConfig.parameters, max_output_tokens: 1500 }
      );

      const cleaned = reply.replace(/```(json)?|```/gi, '').trim();
      let questionsData;
      try {
        questionsData = JSON.parse(cleaned);
        if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
          throw new Error('invalid_json_structure');
        }
      } catch (error) {
        console.warn('Invalid questions JSON from provider:', cleaned, error.message);
        questionsData = {
          questions: [
            { id: 'detalhes', text: 'Poderia fornecer mais detalhes sobre o seu caso?', type: 'textarea' }
          ]
        };
      }

      intakes[sessionId] = { summary, questions: questionsData.questions, stage: 'questions', interactionCount: 1 };
      res.json(questionsData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message || 'provider_error' });
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

    intake.interactionCount = (intake.interactionCount || 1) + 1;

    const apiKey = adminConfig.apiKeys[adminConfig.provider];
    if (!apiKey) {
      return res.status(400).json({ error: 'missing_api_key' });
    }

    try {
      const answersText = Object.entries(answers)
        .map(([key, value]) => {
          const question = intake.questions.find((q) => q.id === key);
          const label = question?.text || key;
          return `- ${label}: ${value}`;
        })
        .join('\n');

      if (!intake.allAnswers) intake.allAnswers = [];
      intake.allAnswers.push(answersText);

      if (!intake.allQuestions) intake.allQuestions = [];
      intake.allQuestions.push(...intake.questions);

      let userText;
      const isChecklistStage = intake.interactionCount === 2;

      if (isChecklistStage) {
        userText = `O cliente respondeu às perguntas iniciais. Com base no resumo do caso ("${intake.summary}") e nas respostas, sua única tarefa agora é gerar uma lista de documentos necessários. A resposta DEVE ser APENAS um JSON válido, nada mais.

Exemplo de resposta válida:
{"questions":[{"id":"documentos","text":"Por favor, marque os documentos que você já possui:","type":"checklist","options":["RG","CPF","Comprovante de Residência"]}]}`;
      } else {
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
        const cleanedReply = reply.replace(/```(json)?|```/gi, '').trim();
        try {
          const jsonResponse = JSON.parse(cleanedReply);
          if (jsonResponse.questions && Array.isArray(jsonResponse.questions)) {
            intake.questions = jsonResponse.questions;
            return res.json(jsonResponse);
          }
          throw new Error('Invalid JSON structure on first try.');
        } catch (error) {
          console.warn('First attempt to get checklist JSON failed. Retrying...', error.message);
          const retryPrompt = 'Sua resposta anterior não foi um JSON válido. Responda APENAS com um JSON válido para uma checklist de documentos. Exemplo: {"questions":[{"id":"documentos","text":"Marque os documentos que possui:","type":"checklist","options":["RG","CPF"]}]}';
          const retryMessages = [{ role: 'user', content: retryPrompt }];
          const retryReply = await generate(adminConfig.provider, apiKey, retryMessages, adminConfig.parameters);
          const cleanedRetryReply = retryReply.replace(/```(json)?|```/gi, '').trim();
          try {
            const jsonResponse = JSON.parse(cleanedRetryReply);
            if (jsonResponse.questions && Array.isArray(jsonResponse.questions)) {
              intake.questions = jsonResponse.questions;
              return res.json(jsonResponse);
            }
            throw new Error('Invalid JSON structure on second try.');
          } catch (error2) {
            console.error('AI failed on second attempt. Ending gracefully.', error2.message);
            return res.json({
              reply: 'Obrigado pelas respostas. Não foi possível gerar a lista de documentos. Por favor, preencha seus dados para finalizarmos.',
              action: 'collect_contact_info'
            });
          }
        }
      }

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
        clientReply = 'Obrigado por suas respostas. Estamos gerando seu relatório.';
        const reportText = `Resumo: ${intake.summary}\nRespostas: ${intake.allAnswers.join('\n')}`;
        const newReport = { sessionId, text: reportText, timestamp: Date.now() };
        reports.push(newReport);
        if (lawyerSocket) lawyerSocket.emit('new-report', newReport);
        intake.stage = 'done';
      }

      res.json({ reply: clientReply, action: 'collect_contact_info' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'provider_error', message: error.message });
    }
  });

  app.post('/api/report-contact', (req, res) => {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'invalid_request' });

    const { sessionId, name, email, phone, cpf } = parsed.data;
    const report = reports.find((item) => item.sessionId === sessionId);
    if (report) {
      report.name = name;
      report.contact = `Email: ${email}, Telefone: ${phone}, CPF: ${cpf}`;
    }

    res.json({ ok: true });
  });

  const configSchema = z.object({
    provider: z.enum(['openai', 'anthropic', 'groq', 'gemini']).optional(),
    parameters: z
      .object({
        model: z.string().optional(),
        max_output_tokens: z.number().optional(),
        temperature: z.number().optional(),
        top_p: z.number().optional(),
        stop_sequences: z.array(z.string()).optional()
      })
      .partial()
      .optional(),
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

  let lawyerSocket = null;
  let busyWithClientId = null;

  function broadcastLawyerStatus() {
    io.emit('lawyer-status', {
      online: !!lawyerSocket,
      busy: !!busyWithClientId
    });
  }

  io.on('connection', (socket) => {
    socket.on('identify', (payload) => {
      const role = payload && payload.role;
      if (role === 'lawyer') {
        lawyerSocket = socket;
        busyWithClientId = null;
        broadcastLawyerStatus();
      } else {
        socket.emit('lawyer-status', {
          online: !!lawyerSocket,
          busy: !!busyWithClientId
        });
      }
    });

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

    socket.on('accept-call', ({ clientId }) => {
      if (!lawyerSocket || socket.id !== lawyerSocket.id) return;
      if (!clientId || busyWithClientId !== clientId) return;
      io.to(clientId).emit('call-accepted', { lawyerId: socket.id });
    });

    socket.on('reject-call', ({ clientId }) => {
      if (!lawyerSocket || socket.id !== lawyerSocket.id) return;
      if (clientId && busyWithClientId === clientId) {
        io.to(clientId).emit('call-rejected');
        busyWithClientId = null;
        broadcastLawyerStatus();
      }
    });

    socket.on('end-call', ({ targetId }) => {
      if (targetId) io.to(targetId).emit('call-ended');
      if (socket.id === busyWithClientId || targetId === busyWithClientId) {
        busyWithClientId = null;
        broadcastLawyerStatus();
      }
    });

    socket.on('webrtc-offer', ({ targetId, sdp }) => {
      if (targetId && sdp) io.to(targetId).emit('webrtc-offer', { from: socket.id, sdp });
    });

    socket.on('webrtc-answer', ({ targetId, sdp }) => {
      if (targetId && sdp) io.to(targetId).emit('webrtc-answer', { from: socket.id, sdp });
    });

    socket.on('webrtc-ice-candidate', ({ targetId, candidate }) => {
      if (targetId && candidate) io.to(targetId).emit('webrtc-ice-candidate', { from: socket.id, candidate });
    });

    socket.on('chat-message', ({ targetId, message }) => {
      if (!message) return;
      if (lawyerSocket && socket.id === lawyerSocket.id) {
        if (targetId) io.to(targetId).emit('chat-message', { from: 'lawyer', message });
      } else {
        if (lawyerSocket) lawyerSocket.emit('chat-message', { from: socket.id, message });
      }
    });

    socket.on('disconnect', () => {
      if (lawyerSocket && socket.id === lawyerSocket.id) {
        if (busyWithClientId) {
          io.to(busyWithClientId).emit('call-ended');
        }
        lawyerSocket = null;
        busyWithClientId = null;
        broadcastLawyerStatus();
        return;
      }

      if (socket.id === busyWithClientId && lawyerSocket) {
        lawyerSocket.emit('call-ended');
        busyWithClientId = null;
        broadcastLawyerStatus();
      }
    });
  });

  if (isProd) {
    const distPath = path.join(rootDir, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.use('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      console.warn('Diretório dist/ não encontrado. Execute "npm run build" antes de iniciar em modo de produção.');
    }
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: rootDir,
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || (isProd ? 4173 : 5173);
  const HOST = process.env.HOST || '0.0.0.0';
  server.listen(PORT, HOST, () => {
    const scheme = usingHttps ? 'https' : 'http';
    console.log(`Servidor iniciado em ${scheme}://localhost:${PORT}`);
    console.log(`Acesse via IP local: ${scheme}://${HOST === '0.0.0.0' ? '<SEU_IP_LOCAL>' : HOST}:${PORT}`);
    if (!usingHttps) {
      console.log('Aviso: HTTP em IP (ex.: 192.168.x.x) pode bloquear câmera/microfone. Configure HTTPS local.');
    }
    if (isProd) {
      console.log('Servindo build de dist/.');
    } else {
      console.log('Vite middleware habilitado. Frontend em modo desenvolvimento.');
    }
  });
})().catch((error) => {
  console.error('Falha ao iniciar o servidor:', error);
  process.exit(1);
});
