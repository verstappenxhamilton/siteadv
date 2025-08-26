const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('crypto').randomUUID ? { v4: () => crypto.randomUUID() } : require('uuid');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const pdf = require('pdf-parse');
const html_to_docx = require('html-to-docx');
const html_pdf = require('html-pdf-node');

const app = express();
const port = 3000;

// =============================================================
// GERENCIAMENTO DE MÚLTIPLAS API KEYS (config.json)
// =============================================================
const configPath = path.join(__dirname, 'config.json');
let API_KEYS = { openrouter: '', openai: '', gemini: '', deepseek: '' };

function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      API_KEYS = { ...API_KEYS, ...data };
    }
  } catch (err) { console.error('Falha ao ler config.json:', err); }
}

function saveConfig() {
  try {
    fs.writeFileSync(configPath, JSON.stringify(API_KEYS, null, 2));
  } catch (err) { console.error('Falha ao salvar config.json:', err); }
}

loadConfig();

// --- Middlewares ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Configuração do Banco de Dados ---
const dbPath = path.join(__dirname, 'relatorios.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Conectado ao banco de dados relatorios.db.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS clientReports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reportId TEXT UNIQUE,
    timestamp TEXT,
    chatHistory TEXT,
    summary TEXT,
    status TEXT,
    attachments TEXT,
    legalPiece TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reportId TEXT UNIQUE,
    timestamp TEXT,
    chatHistory TEXT,
    summary TEXT,
    status TEXT,
    legalPiece TEXT,
    FOREIGN KEY(reportId) REFERENCES clientReports(reportId) ON DELETE CASCADE
  )`, (err) => {
    if (err) {
        console.error('Erro ao criar tabela de anexos:', err.message);
    } else {
        console.log('Tabela de anexos pronta.');
    }
  });

  // --- Migração automática de colunas ausentes ---
  function ensureColumn(table, column, type='TEXT') {
    db.get(`PRAGMA table_info(${table});`, (err, row) => {
      if (err) { console.error('PRAGMA error', err); return; }
    });
    db.all(`PRAGMA table_info(${table});`, (err, rows) => {
      if (err) { console.error('PRAGMA error', err); return; }
      const hasCol = rows.some(r => r.name === column);
      if (!hasCol) {
        console.log(`Adicionando coluna faltante '${column}' na tabela ${table}`);
        db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
      }
    });
  }

  ['chatHistory','summary','status','attachments','legalPiece'].forEach(col => ensureColumn('clientReports', col));
});

// --- Configuração do Multer para Upload ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'));
  }
});
const upload = multer({ storage: storage });

// =================================================================
// --- CONFIG & HELPERS ---
// =================================================================

// Carrega as chaves de API do config.json
let apiKeys = {};
function loadApiKeys() {
    try {
        const configPath = path.join(__dirname, 'config.json');
        if (fs.existsSync(configPath)) {
            apiKeys = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            console.log("Chaves de API carregadas de config.json");
        } else {
            console.error("Arquivo config.json não encontrado!");
            apiKeys = {}; // Garante que apiKeys não seja undefined
        }
    } catch (error) {
        console.error("Erro ao carregar ou parsear config.json:", error);
        apiKeys = {};
    }
}
loadApiKeys(); // Carrega na inicialização

// Helper para padronizar o histórico para diferentes provedores
function formatMessages(messages, prompt) {
    return [{ "role": "system", "content": prompt }, ...messages];
}

// Função central para chamadas de IA
async function getAICompletion(provider, messages, prompt) {
    // --- Tratamento Especial para a API Nativa do Gemini ---
    if (provider === 'gemini') {
        const apiKey = apiKeys[provider];
        if (!apiKey) throw new Error(`Chave de API para ${provider} não encontrada.`);

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

        // Converte as mensagens para o formato do Gemini, que usa "model" em vez de "assistant"
        // e não tem um papel "system" formal.
        const geminiContents = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // O prompt do sistema é inserido no início da conversa como uma troca de mensagens.
        if (prompt) {
            geminiContents.unshift(
                { role: 'user', parts: [{ text: prompt }] },
                { role: 'model', parts: [{ text: "Ok, entendi. Pode começar." }] }
            );
        }

        const body = JSON.stringify({ contents: geminiContents });

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Erro da API Gemini (Status: ${response.status}):`, errorData.error);
                throw new Error(errorData.error?.message || `Erro desconhecido do Gemini - Status ${response.status}`);
            }

            const data = await response.json();

            // Padroniza a resposta para o formato que o frontend espera (similar ao OpenAI/OpenRouter)
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return {
                choices: [{ message: { content: responseText } }]
            };
        } catch (error) {
            console.error("Falha na chamada ao Gemini:", error);
            throw error;
        }
    }

    // --- Lógica Padrão para Outros Provedores (OpenRouter, OpenAI, etc.) ---
    const modelMap = {
        openrouter: 'mistralai/mistral-7b-instruct:free',
        openai: 'gpt-3.5-turbo',
        deepseek: 'deepseek/chat',
    };

    const endpointMap = {
        openrouter: 'https://openrouter.ai/api/v1/chat/completions',
        openai: 'https://api.openai.com/v1/chat/completions',
        deepseek: 'https://api.deepseek.com/chat/completions',
    };
    
    const apiKey = apiKeys[provider];
    const model = modelMap[provider];
    const endpoint = endpointMap[provider];

    if (!apiKey || !model || !endpoint) {
        throw new Error(`Provedor '${provider}' não configurado ou inválido.`);
    }

    const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
    };
    
    // Adicionar cabeçalho específico do OpenRouter se necessário
    if (provider === 'openrouter') {
         headers['HTTP-Referer'] = 'http://localhost'; // ou seu site
         headers['X-Title'] = 'Advocacia Inteligente'; // ou seu app
    }

    const body = JSON.stringify({
        model: model,
        messages: formatMessages(messages, prompt)
    });

    const response = await fetch(endpoint, { method: "POST", headers, body });

    if (!response.ok) {
        const errorData = await response.json();
        console.error(`Erro da API (${provider}):`, errorData);
        throw new Error(`Falha na comunicação com a IA (${provider}): ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
}


// =================================================================
// --- ROTAS DA API ---
// =================================================================

// Rota de Chat com a IA
app.post('/api/chat', async (req, res) => {
    const { messages, prompt } = req.body;
    const provider = req.headers['x-provider'] || 'openrouter'; // Pega o provedor do header

    try {
        const data = await getAICompletion(provider, messages, prompt);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: { message: err.message } });
    }
});

// Criar/Atualizar um relatório
app.post('/api/relatorios', async (req, res) => {
    const { reportId, chatHistory = [], systemPrompt = '' } = req.body;
    const provider = req.headers['x-provider'] || 'openrouter';

    const skipSummary = chatHistory.length === 0 || systemPrompt === '__SKIP__';
    const historyText = getChatHistoryText(chatHistory);
    const prompt = skipSummary ? '' : systemPrompt
        .replace('{{ID_DO_RELATORIO}}', reportId)
        .replace('{{DATA_ATUAL}}', new Date().toLocaleDateString('pt-BR'));

    try {
        let summary = '';
        if (!skipSummary) {
          try{
             const data = await getAICompletion(provider, [{ role: "user", content: historyText }], prompt);
             summary = data.choices[0].message.content || '';
          }catch(aiErr){
             console.error('Falha ao gerar resumo IA:', aiErr.message);
          }
        }

        const status = skipSummary ? 'Em andamento' : 'Finalizado';

        const stmt = `INSERT INTO clientReports (reportId, timestamp, chatHistory, summary, status, attachments) 
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON CONFLICT(reportId) DO UPDATE SET
                    chatHistory = excluded.chatHistory,
                    summary = excluded.summary,
                    status = excluded.status`;

        const existingRow = await new Promise((resolve, reject) => {
            db.get('SELECT attachments FROM clientReports WHERE reportId = ?', [reportId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        let attachments = '[]';
        if (existingRow && typeof existingRow.attachments !== 'undefined' && existingRow.attachments !== null) {
            attachments = existingRow.attachments;
        }

        db.run(stmt, [reportId, new Date().toISOString(), JSON.stringify(chatHistory), summary, status, attachments], (err) => {
            if (err) {
                console.error('Erro ao inserir/atualizar clientReports:', err);
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ reportId, summary });
        });
    } catch (err) {
        res.status(500).json({ error: { message: err.message } });
    }
});

// Excluir relatório
app.delete('/api/relatorios/:id', (req, res) => {
  const reportId = req.params.id;
  db.run('DELETE FROM clientReports WHERE reportId = ?', [reportId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Listar todos os relatórios
app.get('/api/relatorios', (req, res) => {
  db.all('SELECT reportId, timestamp, status FROM clientReports ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Obter um relatório específico
app.get('/api/relatorios/:id', (req, res) => {
  const reportId = req.params.id;
  db.get('SELECT * FROM clientReports WHERE reportId = ?', [reportId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Relatório não encontrado' });

    try {
        row.attachments = JSON.parse(row.attachments || '[]');
    } catch (e) {
        row.attachments = [];
    }
    res.json(row);
  });
});

// Upload de arquivo e vincular ao relatório
app.post('/api/relatorios/:id/attachments', upload.single('file'), async (req, res) => {
  const fileUrl = `/uploads/${req.file.filename}`;
  let fileContent = '';
  if (req.file.mimetype === 'application/pdf') {
    const dataBuffer = fs.readFileSync(req.file.path);
    try {
        const data = await pdf(dataBuffer);
        fileContent = data.text;
    } catch (pdfError) {
        console.error("Error parsing PDF:", pdfError);
        fileContent = "Erro ao ler o conteúdo do PDF.";
    }
  } else {
    fileContent = fs.readFileSync(req.file.path, 'utf-8');
  }
  const snippet = fileContent.slice(0, 500);

  db.get('SELECT attachments, status FROM clientReports WHERE reportId = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    let arr = [];
    const newAttachment = {
      url: fileUrl,
      name: req.file.originalname,
      snippet: snippet,
      fullText: fileContent
    };
    if (!row) {
      arr.push(newAttachment);
      db.run(`INSERT INTO clientReports (reportId, timestamp, status, attachments) VALUES (?, ?, ?, ?)`, [req.params.id, new Date().toISOString(), 'Em andamento', JSON.stringify(arr)], (errIns) => {
        if (errIns) return res.status(500).json({ error: errIns.message });
        return res.json({ success: true, snippet: snippet, fileName: req.file.originalname });
      });
    } else {
      if (row.attachments) {
        try { arr = JSON.parse(row.attachments); } catch {}
      }
      arr.push(newAttachment);
      db.run('UPDATE clientReports SET attachments = ? WHERE reportId = ?', [JSON.stringify(arr), req.params.id], (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ success: true, snippet: snippet, fileName: req.file.originalname });
      });
    }
  });
});


// Gerar minuta da petição
app.post('/api/relatorios/:id/gerar-peticao', async (req, res) => {
  const reportId = req.params.id;
  const provider = req.headers['x-provider'] || 'openrouter'; // Permite que o cliente escolha, com fallback

  try {
    const row = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM clientReports WHERE reportId = ?', [reportId], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (!row) return res.status(404).json({ error: 'Relatório não encontrado' });
    
    row.attachments = JSON.parse(row.attachments || '[]');

    const prompt = await gerarMinutaPrompt(row);
    
    // Usa a nova função centralizada
    const data = await getAICompletion(provider, [{ role: "user", content: prompt }], "Você é um advogado perito em redação de petições.");
    const legalPiece = data.choices[0].message.content;

    db.run('UPDATE clientReports SET legalPiece = ? WHERE reportId = ?', [legalPiece, reportId], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({error: "Falha ao salvar a minuta no banco."})
        };
        res.json({ success: true, legalPiece });
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Salvar/Atualizar Chave de API
app.post('/api/config/apikey', (req, res) => {
    const { provider, apiKey } = req.body;
    if (!provider || !apiKey) {
        return res.status(400).json({ error: 'Provedor e chave são obrigatórios.' });
    }
    try {
        const configPath = path.join(__dirname, 'config.json');
        let config = {};
        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath));
        }
        config[provider] = apiKey;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        loadApiKeys(); // Recarrega as chaves no servidor
        res.json({ success: true, message: `Chave para ${provider} salva.` });
    } catch (error) {
        res.status(500).json({ error: 'Falha ao salvar a chave no servidor.' });
    }
});

app.get('/api/config/apikey', (req, res) => {
     try {
        const configPath = path.join(__dirname, 'config.json');
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath));
            // Não envie as chaves para o cliente, apenas confirme que elas existem
            const keysStatus = {
                openrouter: !!config.openrouter,
                openai: !!config.openai,
                gemini: !!config.gemini,
                deepseek: !!config.deepseek,
            };
            res.json({ keys: config }); // Enviando chaves para preencher o input
        } else {
            res.json({ keys: {} });
        }
    } catch (error) {
        res.status(500).json({ error: 'Falha ao ler configuração.' });
    }
});


// Exportar para PDF ou DOCX
app.post('/api/relatorios/:id/export/:format', async (req, res) => {
    const { htmlContent } = req.body;
    if (!htmlContent) {
        return res.status(400).json({ error: 'Conteúdo HTML é necessário.' });
    }
    let fileBuffer;
    try {
        if (req.params.format === 'docx') {
            fileBuffer = await html_to_docx(htmlContent, null, {
                table: { row: { cantSplit: true } },
                footer: true,
                pageNumber: true,
            });
            res.setHeader('Content-Disposition', 'attachment; filename=minuta.docx');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        } else if (req.params.format === 'pdf') {
            const options = { format: 'A4' };
            const file = { content: `<html><head><meta charset="UTF-8"></head><body>${htmlContent}</body></html>` };
            fileBuffer = await html_pdf.generatePdf(file, options);
            res.setHeader('Content-Disposition', 'attachment; filename=minuta.pdf');
            res.setHeader('Content-Type', 'application/pdf');
        } else {
            return res.status(400).json({ error: 'Formato de exportação inválido.' });
        }
        res.send(fileBuffer);
    } catch (error) {
        console.error(`Erro ao gerar ${req.params.format.toUpperCase()}:`, error);
        res.status(500).json({ error: `Falha ao gerar o arquivo ${req.params.format.toUpperCase()}.` });
    }
});

// --- ROTA FALLBACK PARA A SPA ---
// Esta deve ser a ÚLTIMA rota.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'painel.html'));
});


// --- Funções Auxiliares ---
function getChatHistoryText(chatHistory) {
  return chatHistory.map(m => `${m.role === 'user' ? 'Cliente' : 'Analista'}: ${m.content}`).join('\n');
}

async function gerarMinutaPrompt(relatorio) {
  const { summary, attachments = [] } = relatorio;
  const conteudoDocs = attachments.map((att, i) => `--- INÍCIO DOC ${i + 1}: ${att.name} ---\n${att.fullText}\n--- FIM DOC ${i + 1} ---`).join('\n\n');
  const prompt = `Você é um "Advogado Sênior e Especialista em Redação Jurídica", com vasta experiência na elaboração de peças processuais complexas e persuasivas.

 **Sua Tarefa:**
 Com base no "Relatório de Análise Preliminar" e no conteúdo integral dos documentos fornecidos, redija uma minuta completa e robusta de uma **Petição Inicial**.

 **Estrutura Mandatória da Petição:**
 1.  **Endereçamento:** (Ex: EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA ___ VARA CÍVEL DA COMARCA DE __________)
 2.  **Qualificação Completa das Partes:** (Autor e Réu, com todos os dados disponíveis no relatório).
 3.  **Nome da Ação:** (Com base na classificação do caso).
 4.  **Dos Fatos:** (Uma narrativa coesa e cronológica, utilizando as informações do resumo dos fatos).
 5.  **Do Direito:** (Fundamentação jurídica sólida. Use os pontos da "Análise Preliminar da IA" como ponto de partida, mas expanda com artigos de lei, jurisprudência pertinente e doutrina. **CITE DIRETAMENTE trechos e informações dos documentos anexados** para fortalecer os argumentos. Ex: "Conforme cláusula 5ª do contrato anexo (Doc. 1)...", "O valor cobrado indevidamente, conforme fatura (Doc. 2), foi de R$ ...").
 6.  **Da Tutela de Urgência (se aplicável):** (Analise se o caso requer uma medida de urgência e, se sim, redija o tópico com os requisitos - fumus boni iuris e periculum in mora).
 7.  **Dos Pedidos:** (Liste todos os pedidos de forma clara e específica, incluindo a citação do réu, a procedência da ação, a condenação, a tutela de urgência, etc.).
 8.  **Do Valor da Causa:** (Atribua um valor à causa).
 9.  **Fechamento:** (Termos em que, pede deferimento. Local, data, advogado, OAB).

 **Dados para a Petição:**

 --- INÍCIO DO RELATÓRIO DE ANÁLISE ---
 ${summary}
 --- FIM DO RELATÓRIO DE ANÁLISE ---

 --- CONTEÚDO DOS DOCUMENTOS ANEXADOS ---
 ${conteudoDocs || "Nenhum documento foi anexado."}
 --- FIM DOS DOCUMENTOS ---

 **Instrução Final:** Produza a petição em formato **Markdown**, pronta para ser usada. Seja formal, técnico e persuasivo.`;
  return prompt;
}

// --- Inicialização do Servidor ---
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
}); 