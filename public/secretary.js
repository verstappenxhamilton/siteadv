const messagesEl = document.getElementById('aiMessages');
const inputEl = document.getElementById('aiInput');
const sendBtn = document.getElementById('aiSend');
const sessionId = crypto.randomUUID();
let stage = 'summary';
let currentQuestions = [];

function append(role, text) {
  const div = document.createElement('div');
  div.className = 'msg ' + role;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function buildAnswers(form) {
  return currentQuestions.map((q, i) => `${q.texto}: ${form[`q${i}`].value}`).join('\n');
}

async function sendSummary() {
  const message = inputEl.value.trim();
  if (!message) return;
  append('user', message);
  inputEl.value = '';
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message })
    });
    const data = await res.json();
    if (!res.ok) {
      const map = {
        missing_api_key: 'Chave de API ausente.',
        limit_reached: 'Limite de uso atingido.',
        msg_too_long: 'Mensagem muito longa.',
        session_closed: 'Sessão encerrada.'
      };
      append('ai', '[erro] ' + (map[data.error] || data.message || data.error));
      return;
    }
    if (data.questions) {
      showQuestions(data.questions);
    }
  } catch (e) {
    append('ai', '[erro de rede]');
  }
}

function showQuestions(qs) {
  stage = 'questions';
  currentQuestions = qs;
  inputEl.parentElement.style.display = 'none';
  const form = document.createElement('form');
  form.className = 'chat-followup';
  qs.forEach((q, i) => {
    append('ai', q.texto);
    const inp = document.createElement('input');
    inp.name = `q${i}`;
    inp.placeholder = q.texto;
    form.appendChild(inp);
  });
  const btn = document.createElement('button');
  btn.textContent = 'Enviar respostas';
  form.appendChild(btn);
  messagesEl.appendChild(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const answers = buildAnswers(form);
    append('user', answers);
    messagesEl.removeChild(form);
    await sendAnswers(answers);
  });
}

async function sendAnswers(answers) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message: answers })
    });
    const data = await res.json();
    if (!res.ok) {
      const map = {
        missing_api_key: 'Chave de API ausente.',
        limit_reached: 'Limite de uso atingido.',
        msg_too_long: 'Mensagem muito longa.',
        session_closed: 'Sessão encerrada.'
      };
      append('ai', '[erro] ' + (map[data.error] || data.message || data.error));
      return;
    }
    if (data.reply) append('ai', data.reply);
    if (data.done) showContactForm();
  } catch (e) {
    append('ai', '[erro de rede]');
  }
}

function showContactForm() {
  stage = 'done';
  const form = document.createElement('form');
  form.className = 'chat-followup';
  form.innerHTML = '<input name="nome" placeholder="Seu nome" required />' +
    '<input name="contato" placeholder="E-mail ou telefone" required />' +
    '<button>Enviar contato</button>';
  messagesEl.appendChild(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    await fetch('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: fd.get('nome'), email: fd.get('contato'), mensagem: 'via chat' })
    });
    messagesEl.removeChild(form);
    append('ai', 'Dados registrados. Em breve entraremos em contato.');
  });
}

sendBtn.addEventListener('click', () => {
  if (stage === 'summary') sendSummary();
});
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && stage === 'summary') sendSummary();
});

append('ai', 'Olá! Sou o assistente jurídico. Escreva um breve resumo da sua demanda.');

