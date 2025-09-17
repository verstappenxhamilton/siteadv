const express = require('express');
const { z } = require('zod');
const { generate } = require('../../providers');

const router = express.Router();

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

module.exports = (sessions, reports, intakes, adminConfig, lawyerSocket) => {
  router.post('/chat', async (req, res) => {
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

  router.post('/questions', async (req, res) => {
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

  router.post('/answers', async (req, res) => {
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
          const reportText = `Resumo: ${intake.summary}\nRespostas: ${intake.allAnswers.join('\r\n')}`;
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

  router.post('/report-contact', (req, res) => {
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

  return router;
}
