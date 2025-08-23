const messagesEl = document.getElementById('aiMessages');
const quickRepliesEl = document.getElementById('quickReplies');
const chatInputContainer = document.querySelector('#aiChat .chat-input');
const aiInput = document.getElementById('aiInput');
const aiSend = document.getElementById('aiSend');
if (chatInputContainer) chatInputContainer.style.display = 'none';
const sessionId = crypto.randomUUID();

function append(role, content) {
  const div = document.createElement('div');
  div.className = 'msg ' + role;
  if (typeof content === 'string') div.textContent = content;
  else div.appendChild(content);
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

const triageData = { documentos: [] };
let step = 0;

const steps = [
  {
    question: 'Vamos começar com seus dados.',
    fields: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      { name: 'contato', label: 'Contato (email ou telefone)', type: 'text', required: true }
    ]
  },
  {
    question: 'Sobre o caso.',
    fields: [
      { name: 'tipo', label: 'Tipo do caso', type: 'select', options: ['Cível','Trabalhista','Empresarial'], required: true },
      { name: 'descricao', label: 'Descreva brevemente', type: 'textarea', required: true }
    ]
  },
  {
    question: 'Prazos e risco.',
    fields: [
      { name: 'prazo', label: 'Existe algum prazo?', type: 'date', required: false },
      { name: 'risco', label: 'Nível de risco', type: 'radio', options: ['Baixo','Médio','Alto'], required: true }
    ]
  },
  {
    question: 'Envie documentos (opcional).',
    fields: [
      { name: 'documento', label: 'Documento', type: 'file', required: false }
    ]
  },
  {
    question: 'Posso encerrar o atendimento?',
    fields: [
      { name: 'encerrar', type: 'radio', options: ['Sim','Não'], required: true }
    ]
  }
];

function renderQuickReplies() {
  if (!quickRepliesEl) return;
  quickRepliesEl.innerHTML = '';
  ['Sim', 'Não', 'Obrigado'].forEach(text => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.addEventListener('click', () => sendChat(text));
    quickRepliesEl.appendChild(btn);
  });
}

async function sendChat(message) {
  append('user', message);
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message })
    });
    const data = await res.json();
    if (data.reply) append('assistant', data.reply);
  } catch (e) {
    append('assistant', '[erro]');
  }
  renderQuickReplies();
}

aiSend.addEventListener('click', () => {
  const msg = aiInput.value.trim();
  if (!msg) return;
  aiInput.value = '';
  sendChat(msg);
});

aiInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    aiSend.click();
  }
});

function renderStep() {
  if (step >= steps.length) {
    finalize();
    return;
  }
  const s = steps[step];
  append('assistant', s.question);
  const form = document.createElement('form');
  form.className = 'triage-form';
  s.fields.forEach(f => {
    const wrapper = document.createElement('div');
    wrapper.className = 'field';
    const label = document.createElement('label');
    label.textContent = f.label;
    wrapper.appendChild(label);
    let input;
    if (f.type === 'select') {
      input = document.createElement('select');
      f.options.forEach(o => {
        const op = document.createElement('option');
        op.value = o;
        op.textContent = o;
        input.appendChild(op);
      });
    } else if (f.type === 'textarea') {
      input = document.createElement('textarea');
    } else if (f.type === 'radio') {
      input = document.createElement('div');
      f.options.forEach(o => {
        const lbl = document.createElement('label');
        const rb = document.createElement('input');
        rb.type = 'radio';
        rb.name = f.name;
        rb.value = o;
        lbl.appendChild(rb);
        lbl.appendChild(document.createTextNode(o));
        input.appendChild(lbl);
      });
    } else {
      input = document.createElement('input');
      input.type = f.type;
      if (f.type === 'file') input.accept = '.pdf,.png,.jpg,.jpeg';
    }
    input.name = f.name;
    wrapper.appendChild(input);
    form.appendChild(wrapper);
  });
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = 'Enviar';
  form.appendChild(submit);
  form.addEventListener('submit', e => {
    e.preventDefault();
    handleStep(form, s);
  });
  append('assistant', form);
}

async function handleStep(form, s) {
  const data = new FormData(form);
  for (const f of s.fields) {
    if (f.type === 'radio') {
      const val = data.get(f.name);
      if (f.required && !val) return alert('Preencha todos os campos obrigatórios.');
      if (val) triageData[f.name] = val;
    } else if (f.type === 'file') {
      const file = data.get(f.name);
      if (file && file.size) {
        try {
          const uploaded = await uploadFile(file);
          triageData.documentos.push(uploaded);
        } catch (e) {
          alert('Falha no upload');
          return;
        }
      } else if (f.required) return alert('Arquivo obrigatório');
    } else {
      const val = data.get(f.name);
      if (f.required && !val) return alert('Preencha todos os campos obrigatórios.');
      if (val) triageData[f.name] = val;
    }
  }
  if (s.fields.length) {
    const summary = s.fields.map(f => `${f.label}: ${triageData[f.name] || ''}`).join(' | ');
    append('user', summary);
  }
  if (s.fields.some(f => f.name === 'encerrar')) {
    if (triageData.encerrar === 'Não') {
      append('assistant', 'Tudo bem, continuaremos quando estiver pronto.');
      return;
    }
  }
  step++;
  renderStep();
}

async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  const js = await res.json();
  if (js.error) throw new Error(js.error);
  return js.file;
}

async function finalize() {
  try {
    const res = await fetch('/api/triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(triageData)
    });
    const data = await res.json();
    append('assistant', 'Resumo factual:');
    const ul1 = document.createElement('ul');
    (data.summary || []).forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      ul1.appendChild(li);
    });
    append('assistant', ul1);
    append('assistant', 'Checklist de pendências:');
    const ul2 = document.createElement('ul');
    (data.checklist || []).forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      ul2.appendChild(li);
    });
    append('assistant', ul2);
    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(data.data, null, 2);
    append('assistant', pre);
  } catch (e) {
    append('assistant', '[erro ao gerar resumo]');
  }
  append('assistant', 'Posso ajudar com mais algo?');
  if (chatInputContainer) {
    chatInputContainer.style.display = 'flex';
    renderQuickReplies();
  }
}

renderStep();
