const messagesEl = document.getElementById('aiMessages');
let features = { upload: false };

function append(role, html) {
  const div = document.createElement('div');
  div.className = 'msg ' + role;
  div.innerHTML = html;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function createField(f) {
  switch (f.type) {
    case 'text_short':
      return `<label>${f.label}<input name="${f.name}" type="text" /></label>`;
    case 'text_long':
      return `<label>${f.label}<textarea name="${f.name}"></textarea></label>`;
    case 'select':
      return `<label>${f.label}<select name="${f.name}">${f.options.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></label>`;
    case 'radio':
      return `<div>${f.label}${f.options.map(o=>`<label><input type="radio" name="${f.name}" value="${o}"> ${o}</label>`).join('')}</div>`;
    case 'date':
      return `<label>${f.label}<input name="${f.name}" type="date" /></label>`;
    case 'file':
      return `<label>${f.label}<input name="${f.name}" type="file" ${f.multiple?'multiple':''} /></label>`;
    default:
      return '';
  }
}

const steps = [];
const formData = {};
let current = 0;

async function init() {
  const res = await fetch('/config');
  const cfg = await res.json();
  features = cfg.features || {};
  buildSteps();
  append('assistant', 'Iniciando triagem jurídica.');
  renderStep();
}

function buildSteps() {
  steps.push({
    key: 'identificacao',
    schema: z.object({
      nome: z.string().min(1),
      email: z.string().email()
    }),
    fields: [
      { type: 'text_short', name: 'nome', label: 'Seu nome' },
      { type: 'text_short', name: 'email', label: 'Seu e-mail' }
    ]
  });
  steps.push({
    key: 'caso',
    schema: z.object({
      area: z.string().min(1),
      descricao: z.string().min(1)
    }),
    fields: [
      { type: 'select', name: 'area', label: 'Área do direito', options: ['Civil','Trabalhista','Empresarial'] },
      { type: 'text_long', name: 'descricao', label: 'Descrição do caso' }
    ]
  });
  steps.push({
    key: 'prazos',
    schema: z.object({
      prazo: z.string().optional(),
      risco: z.string().min(1)
    }),
    fields: [
      { type: 'date', name: 'prazo', label: 'Prazo importante (se houver)' },
      { type: 'radio', name: 'risco', label: 'Nível de risco', options: ['Baixo','Médio','Alto'] }
    ]
  });
  if (features.upload) {
    steps.push({
      key: 'documentos',
      schema: z.object({ arquivos: z.array(z.string()).optional() }),
      fields: [
        { type: 'file', name: 'arquivos', label: 'Anexar documentos', multiple: true }
      ]
    });
  } else {
    steps.push({
      key: 'documentos',
      schema: z.object({ arquivos: z.array(z.string()).optional() }),
      fields: []
    });
  }
}

function renderStep() {
  if (current >= steps.length) {
    return renderFinish();
  }
  const step = steps[current];
  const form = document.createElement('form');
  step.fields.forEach(f => {
    form.innerHTML += createField(f);
  });
  const btn = document.createElement('button');
  btn.type = 'submit';
  btn.textContent = 'Enviar';
  form.appendChild(btn);
  append('assistant', form.outerHTML);
  messagesEl.lastChild.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd);
    handleStep(step, data, e.target);
  });
}

async function handleStep(step, data, formEl) {
  if (step.fields.some(f => f.type === 'file')) {
    const fd = new FormData(formEl);
    const files = fd.getAll('arquivos');
    const names = [];
    for (const file of files) {
      const upFd = new FormData();
      upFd.append('file', file);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: upFd });
        const j = await res.json();
        if (j.filename) names.push(j.filename);
      } catch {}
    }
    data.arquivos = names;
  }
  const parsed = step.schema.safeParse(data);
  if (!parsed.success) {
    alert('Preencha corretamente.');
    return;
  }
  formData[step.key] = parsed.data;
  append('user', Object.values(parsed.data).join(' | '));
  current++;
  renderStep();
}

function renderFinish() {
  const div = document.createElement('div');
  const btn = document.createElement('button');
  btn.textContent = 'Encerrar triagem';
  btn.addEventListener('click', finalize);
  div.appendChild(btn);
  append('assistant', div.outerHTML);
  messagesEl.lastChild.querySelector('button').addEventListener('click', finalize);
}

async function finalize() {
  append('assistant', 'Gerando resumo...');
  try {
    const res = await fetch('/api/triage-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    append('assistant', `<pre>${data.summary}</pre><pre>${JSON.stringify(data.data, null, 2)}</pre>`);
  } catch (e) {
    append('assistant', '[erro ao gerar resumo]');
  }
}

init();

