document.addEventListener('DOMContentLoaded', () => {
  const aiChat = document.getElementById('aiChat');
  const aiMessages = document.getElementById('aiMessages');
  const aiInput = document.getElementById('aiInput');
  const aiSend = document.getElementById('aiSend');

  if (!aiChat || !aiMessages || !aiInput || !aiSend) {
    console.error('Elementos do chat da secretaria nao encontrados.');
    return;
  }

  let sessionId = localStorage.getItem('secretary.sessionId') || `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  localStorage.setItem('secretary.sessionId', sessionId);

  const intakeState = {
    summary: '',
    questions: [],
    answers: {},
    stage: 'summary' // summary -> questions -> contact -> done
  };

  function appendMessage(text, sender = 'user', type = 'text') {
    const el = document.createElement('div');
    el.className = `chat-message chat-message-${sender}`;
    if (type === 'html') {
      el.innerHTML = text;
    } else {
      el.textContent = text;
    }
    aiMessages.appendChild(el);
    aiMessages.scrollTop = aiMessages.scrollHeight;
    return el;
  }

  function showTyping() {
    let t = aiMessages.querySelector('.typing-indicator');
    if (!t) {
      t = document.createElement('div');
      t.className = 'chat-message chat-message-assistant typing-indicator';
      t.innerHTML = '<span></span><span></span><span></span>';
      aiMessages.appendChild(t);
    }
    aiMessages.scrollTop = aiMessages.scrollHeight;
    return t;
  }
  function hideTyping() {
    aiMessages.querySelector('.typing-indicator')?.remove();
  }

  function disableInput(disabled = true) {
    aiInput.disabled = disabled;
    aiSend.disabled = disabled;
  }
  aiInput.addEventListener('input', () => { aiSend.disabled = !aiInput.value.trim(); });

  async function handleInitialMessage() {
    const summary = aiInput.value.trim();
    if (!summary) return;
    appendMessage(summary, 'user');
    aiInput.value = '';
    disableInput(true);
    showTyping();
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, summary })
      });
      if (!res.ok) throw new Error('Falha ao buscar perguntas');
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch {
        const m = text.match(/```json\n([\s\S]*?)\n```/);
        if (m && m[1]) data = JSON.parse(m[1]);
      }
      hideTyping();
      if (!data || !Array.isArray(data.questions)) throw new Error('Resposta invalida');
      intakeState.summary = summary;
      intakeState.questions = data.questions;
      intakeState.stage = 'questions';
      renderQuestions(data.questions);
    } catch (err) {
      hideTyping();
      appendMessage('Desculpe, ocorreu um erro. Tente novamente mais tarde.', 'assistant');
      disableInput(false);
      console.error(err);
    }
  }

  function renderQuestions(questions) {
    const html = questions.map(q => {
      const questionText = q.text || q.question || '';
      let inputHtml = '';
      if (q.type === 'buttons') {
        inputHtml = (q.options || []).map(opt => `<button class="question-button" data-question-id="${q.id}" value="${opt}">${opt}</button>`).join('');
      } else if (q.type === 'checklist') {
        inputHtml = (q.options || []).map(opt => `
          <label class="checklist-item">
            <input type="checkbox" name="${q.id}" value="${opt}">
            <span>${opt}</span>
          </label>
        `).join('');
      } else if (q.type === 'date') {
        inputHtml = `<input type="date" id="${q.id}" name="${q.id}">`;
      } else {
        inputHtml = `
          <div class="text-input-wrapper">
            <input type="${q.type || 'text'}" id="${q.id}" name="${q.id}" placeholder="Sua resposta...">
            <button class="not-informed-btn" data-question-id="${q.id}">Nao sei informar</button>
          </div>
        `;
      }
      return `<div class="question"><strong>${questionText}</strong><div class="input-area">${inputHtml}</div></div>`;
    }).join('');
    const container = appendMessage(html, 'assistant', 'html');
    container.id = 'question-form';
    const submit = document.createElement('button');
    submit.textContent = 'Enviar Respostas';
    submit.id = 'submit-answers';
    container.appendChild(submit);

    container.querySelectorAll('.question-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const qid = btn.dataset.questionId;
        intakeState.answers[qid] = btn.value;
        container.querySelectorAll(`button[data-question-id="${qid}"]`).forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
    container.querySelectorAll('.not-informed-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const qid = btn.dataset.questionId;
        const input = container.querySelector(`#${CSS.escape(qid)}`);
        if (input) {
          input.value = 'Nao informado';
          input.disabled = true;
          input.classList.add('not-informed');
          intakeState.answers[qid] = 'Nao informado';
        }
      });
    });
    submit.addEventListener('click', handleFormSubmit);
    disableInput(true);
    aiInput.style.display = 'none';
    aiSend.style.display = 'none';
  }

  async function handleFormSubmit() {
    intakeState.questions.forEach(q => {
      if (q.type === 'checklist') {
        const checked = Array.from(document.querySelectorAll(`input[name="${q.id}"]:checked`)).map(cb => cb.value);
        intakeState.answers[q.id] = checked.length ? checked.join(', ') : 'Nenhum item selecionado';
      } else if (q.type !== 'buttons') {
        const input = document.getElementById(q.id);
        if (input && input.value && !intakeState.answers[q.id]) {
          intakeState.answers[q.id] = input.value;
        }
      }
    });
    const allAnswered = intakeState.questions.every(q => Object.prototype.hasOwnProperty.call(intakeState.answers, q.id));
    if (!allAnswered) {
      let err = document.getElementById('form-error');
      if (!err) {
        err = document.createElement('div');
        err.id = 'form-error';
        err.style.color = 'var(--accent-2)';
        err.style.marginTop = '10px';
        document.getElementById('question-form').appendChild(err);
      }
      err.textContent = 'Por favor, responda a todas as perguntas antes de enviar.';
      return;
    }

    document.getElementById('question-form')?.remove();
    showTyping();
    try {
      const res = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answers: intakeState.answers })
      });
      if (!res.ok) throw new Error('Falha ao enviar respostas');
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch {
        const m = text.match(/```json\n([\s\S]*?)\n```/);
        if (m && m[1]) data = JSON.parse(m[1]);
      }
      hideTyping();
      if (data && Array.isArray(data.questions) && data.questions.length) {
        intakeState.questions = data.questions;
        renderQuestions(data.questions);
      } else if (data && data.action === 'collect_contact_info') {
        if (data.reply) appendMessage(data.reply, 'assistant');
        renderPersonalDataForm();
      } else if (data && data.reply) {
        appendMessage(data.reply, 'assistant');
      }
    } catch (err) {
      hideTyping();
      appendMessage('Desculpe, ocorreu um erro ao processar suas respostas.', 'assistant');
      console.error(err);
    }
  }

  function renderPersonalDataForm() {
    const html = `
      <div id="personal-data-form" class="form-grid">
        <strong>Para finalizar, por favor, preencha seus dados:</strong>
        <label>Nome Completo: <input type="text" name="name" required></label>
        <label>Email: <input type="email" name="email" required></label>
        <label>Telefone: <input type="tel" name="phone" required></label>
        <label>CPF: <input type="text" name="cpf" required></label>
        <button id="submit-personal-data" class="primary">Enviar Dados</button>
      </div>
    `;
    appendMessage(html, 'assistant', 'html');
    document.getElementById('submit-personal-data').addEventListener('click', handlePersonalDataSubmit);
    aiInput.style.display = 'none';
    aiSend.style.display = 'none';
  }

  async function handlePersonalDataSubmit() {
    const form = document.getElementById('personal-data-form');
    const name = form.querySelector('[name="name"]').value;
    const email = form.querySelector('[name="email"]').value;
    const phone = form.querySelector('[name="phone"]').value;
    const cpf = form.querySelector('[name="cpf"]').value;
    if (!name || !email || !phone || !cpf) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    form.innerHTML = '<p>Obrigado! Suas informacoes foram recebidas. Entraremos em contato em breve.</p>';
    try {
      await fetch('/api/report-contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, name, email, phone, cpf })
      });
    } catch (err) { console.error('Failed to save contact info:', err); }
  }

  async function handleSend() {
    if (intakeState.stage === 'summary') await handleInitialMessage();
  }

  aiSend.addEventListener('click', handleSend);
  aiInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } });

  // Greet
  appendMessage('Ola! Sou a secretaria virtual. Descreva seu caso em poucas palavras para que eu possa ajudar.', 'assistant');
});

