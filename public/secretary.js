const messagesEl = document.getElementById('aiMessages');
const inputEl = document.getElementById('aiInput');
const sendBtn = document.getElementById('aiSend');
const sessionId = crypto.randomUUID();

function append(role, text) {
  const div = document.createElement('div');
  div.className = 'msg ' + role;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

let stage = 'summary';
let currentQuestions = [];

append('assistant', 'Olá! Sou a assistente jurídica. Escreva um breve resumo da sua demanda.');

async function handleSummary() {
  const summary = inputEl.value.trim();
  if (!summary) return;
  append('user', summary);
  inputEl.value = '';
  sendBtn.disabled = true;
  append('assistant', 'Analisando...');
  try {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, summary })
    });
    const data = await res.json();
    const map = {
      missing_api_key: 'Chave de API ausente.',
      limit_reached: 'Limite de uso atingido.',
      msg_too_long: 'Resumo muito longo.',
      invalid_request: 'Pedido inválido.'
    };
    if (!res.ok) {
      const msg = map[data.error] || data.message || data.error;
      append('error', msg === 'invalid_json' ? 'Resposta inválida da IA.' : msg);
      sendBtn.disabled = false;
      return;
    }
    currentQuestions = Array.isArray(data.questions) ? data.questions : [];
    if (!currentQuestions.length) {
      append('error', 'Nenhuma pergunta gerada.');
      sendBtn.disabled = false;
      return;
    }
    renderQuestions();
  } catch (e) {
    append('error', 'Erro de rede.');
    sendBtn.disabled = false;
  }
}

function renderQuestions() {
  const inputWrap = inputEl.parentElement;
  if (inputWrap) inputWrap.style.display = 'none';
  const form = document.createElement('form');
  form.id = 'questionsForm';
  currentQuestions.forEach(q => {
    const label = document.createElement('label');
    label.textContent = q.pergunta;
    let inp;
    if (q.tipo === 'textarea') {
      inp = document.createElement('textarea');
    } else {
      inp = document.createElement('input');
      inp.type = q.tipo === 'number' ? 'number' : 'text';
    }
    inp.name = q.id;
    label.appendChild(inp);
    form.appendChild(label);
  });
  const btn = document.createElement('button');
  btn.textContent = 'Enviar respostas';
  btn.className = 'primary';
  form.appendChild(btn);
  messagesEl.appendChild(form);
  stage = 'questions';
  form.addEventListener('submit', submitAnswers);
}

async function submitAnswers(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const answers = {};
  fd.forEach((v, k) => answers[k] = v);
  e.target.remove();
  currentQuestions.forEach(q => {
    append('assistant', q.pergunta);
    append('user', answers[q.id] || '');
  });
  append('assistant', 'Gerando orientação...');
  try {
    const res = await fetch('/api/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, answers })
    });
    const data = await res.json();
    const map = {
      missing_api_key: 'Chave de API ausente.',
      limit_reached: 'Limite de uso atingido.',
      invalid_session: 'Sessão inválida.',
      msg_too_long: 'Mensagem muito longa.'
    };
    if (!res.ok) {
      const msg = map[data.error] || data.message || data.error;
      append('error', msg === 'invalid_json' ? 'Resposta inválida da IA.' : msg);
      return;
    }
    append('assistant', data.reply || '[erro]');
    renderContact();
    stage = 'done';
  } catch (e) {
    append('error', 'Erro de rede.');
  }
}

function renderContact() {
  const form = document.createElement('form');
  form.id = 'contactForm';
  const name = document.createElement('input');
  name.placeholder = 'Seu nome';
  name.name = 'name';
  const cont = document.createElement('input');
  cont.placeholder = 'Email ou telefone';
  cont.name = 'contact';
  const btn = document.createElement('button');
  btn.textContent = 'Enviar contato';
  btn.className = 'secondary';
  form.append(name, cont, btn);
  messagesEl.appendChild(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    try {
      await fetch('/api/report-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, name: fd.get('name'), contact: fd.get('contact') })
      });
    } catch {}
    form.remove();
    append('assistant', 'Obrigado! Em breve entraremos em contato.');
  });
}

sendBtn.addEventListener('click', () => {
  if (stage === 'summary') handleSummary();
});

inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (stage === 'summary') handleSummary();
  }
});
