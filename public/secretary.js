document.addEventListener('DOMContentLoaded', () => {
  const aiChat = document.getElementById('aiChat');
  const aiMessages = document.getElementById('aiMessages');
  const aiInput = document.getElementById('aiInput');
  const aiSend = document.getElementById('aiSend');

  if (!aiChat || !aiMessages || !aiInput || !aiSend) {
    console.error('Elementos do chat da secretária não encontrados. A funcionalidade não será iniciada.');
    return;
  }

  let sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  let intakeState = {
    summary: '',
    questions: [],
    answers: {},
    stage: 'summary' // summary -> questions -> contact -> done
  };

  function appendMessage(text, sender = 'user', type = 'text') {
    const messageEl = document.createElement('div');
    messageEl.classList.add('chat-message', `chat-message-${sender}`);

    if (type === 'html') {
      messageEl.innerHTML = text;
    } else {
      messageEl.textContent = text;
    }

    aiMessages.appendChild(messageEl);
    aiMessages.scrollTop = aiMessages.scrollHeight;
    return messageEl;
  }

  function showTypingIndicator() {
    let typingEl = aiMessages.querySelector('.typing-indicator');
    if (!typingEl) {
      typingEl = document.createElement('div');
      typingEl.classList.add('chat-message', 'chat-message-assistant', 'typing-indicator');
      typingEl.innerHTML = '<span></span><span></span><span></span>';
      aiMessages.appendChild(typingEl);
    }
    aiMessages.scrollTop = aiMessages.scrollHeight;
    return typingEl;
  }

  function removeTypingIndicator() {
    const typingEl = aiMessages.querySelector('.typing-indicator');
    if (typingEl) {
      typingEl.remove();
    }
  }

  function disableInput(disabled = true) {
    aiInput.disabled = disabled;
    aiSend.disabled = disabled;
  }

  async function handleInitialMessage() {
    const summary = aiInput.value.trim();
    if (!summary) return;

    appendMessage(summary, 'user');
    aiInput.value = '';
    disableInput();
    showTypingIndicator();

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, summary })
      });
      if (!response.ok) throw new Error('Falha ao buscar perguntas.');

      const responseText = await response.text();
      let data;
      try {
        // Attempt to parse as direct JSON first
        data = JSON.parse(responseText);
      } catch (e) {
        // If direct parsing fails, try to extract from markdown
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          data = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Invalid JSON response from server.');
        }
      }
      intakeState.summary = summary;
      intakeState.questions = data.questions;
      intakeState.stage = 'questions';
      removeTypingIndicator();
      displayQuestions(data.questions);
    } catch (error) {
      removeTypingIndicator();
      appendMessage('Desculpe, ocorreu um erro. Por favor, tente novamente mais tarde.', 'assistant');
      disableInput(false);
      console.error('Error fetching questions:', error);
    }
  }

  function displayQuestions(questions) {
    const formHtml = questions.map(q => {
      let inputHtml = '';
      const questionText = q.text || q.question;
      switch (q.type) {
        case 'buttons':
          inputHtml = q.options.map(opt => `<button class="question-button" data-question-id="${q.id}" value="${opt}">${opt}</button>`).join('');
          break;
        case 'checklist':
          inputHtml = q.options.map(opt => `
            <label class="checklist-item">
              <input type="checkbox" name="${q.id}" value="${opt}">
              <span>${opt}</span>
            </label>
          `).join('');
          break;
        case 'date':
          inputHtml = `<input type="date" id="${q.id}" name="${q.id}">`;
          break;
        default:
          inputHtml = `
            <div class="text-input-wrapper">
              <input type="${q.type || 'text'}" id="${q.id}" name="${q.id}" placeholder="Sua resposta...">
              <button class="not-informed-btn" data-question-id="${q.id}">Não sei informar</button>
            </div>
          `;
      }
      return `<div class="question"><strong>${questionText}</strong><div class="input-area">${inputHtml}</div></div>`;
    }).join('');

    const formContainer = appendMessage(formHtml, 'assistant', 'html');
    formContainer.id = 'question-form';

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Enviar Respostas';
    submitButton.id = 'submit-answers';
    formContainer.appendChild(submitButton);

    document.querySelectorAll('.question-button').forEach(button => {
      button.addEventListener('click', () => {
        const questionId = button.dataset.questionId;
        intakeState.answers[questionId] = button.value;
        document.querySelectorAll(`button[data-question-id="${questionId}"]`).forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
      });
    });

    document.querySelectorAll('.not-informed-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const questionId = button.dataset.questionId;
        const input = document.getElementById(questionId);
        if (input) {
          input.value = 'Não informado';
          input.disabled = true;
          input.classList.add('not-informed');
          intakeState.answers[questionId] = 'Não informado';
        }
      });
    });

    submitButton.addEventListener('click', handleFormSubmit);
    disableInput(true);
    aiInput.style.display = 'none';
    aiSend.style.display = 'none';
  }

  async function handleFormSubmit() {
    intakeState.questions.forEach(q => {
      if (q.type === 'checklist') {
        const checked = Array.from(document.querySelectorAll(`input[name="${q.id}"]:checked`)).map(cb => cb.value);
        intakeState.answers[q.id] = checked.length > 0 ? checked.join(', ') : 'Nenhum item selecionado';
      } else if (q.type !== 'buttons') {
        const input = document.getElementById(q.id);
        if (input && input.value && !intakeState.answers[q.id]) {
          intakeState.answers[q.id] = input.value;
        }
      }
    });

    const allAnswered = intakeState.questions.every(q => intakeState.answers.hasOwnProperty(q.id));

    if (!allAnswered) {
      let errorEl = document.getElementById('form-error');
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.id = 'form-error';
        errorEl.style.color = 'var(--accent-2)';
        errorEl.style.marginTop = '10px';
        document.getElementById('question-form').appendChild(errorEl);
      }
      errorEl.textContent = 'Por favor, responda a todas as perguntas antes de enviar.';
      return;
    }

    const errorEl = document.getElementById('form-error');
    if (errorEl) errorEl.remove();

    document.getElementById('question-form').remove();
    showTypingIndicator();

    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answers: intakeState.answers })
      });
      if (!response.ok) throw new Error('Falha ao enviar respostas.');

      const responseText = await response.text();
      let data;
      try {
        // Attempt to parse as direct JSON first
        data = JSON.parse(responseText);
      } catch (e) {
        // If direct parsing fails, try to extract from markdown
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          data = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Invalid JSON response from server.');
        }
      }
      removeTypingIndicator();

      if (data.questions && data.questions.length > 0) {
        intakeState.questions = data.questions;
        displayQuestions(data.questions);
      } else if (data.action === 'collect_contact_info') { // New condition
        appendMessage(data.reply, 'assistant'); // Display AI's final message before form
        displayPersonalDataForm();
      } else {
        appendMessage(data.reply, 'assistant');
      }
    } catch (error) {
      removeTypingIndicator();
      appendMessage('Desculpe, ocorreu um erro ao processar suas respostas.', 'assistant');
      console.error('Error finishing intake:', error);
    }
  }

  function displayPersonalDataForm() {
    intakeState.stage = 'contact';
    const formHtml = `
      <div id="personal-data-form" class="form-grid">
        <strong>Para finalizar, por favor, preencha seus dados:</strong>
        <label>Nome Completo: <input type="text" name="name" required></label>
        <label>Email: <input type="email" name="email" required></label>
        <label>Telefone: <input type="tel" name="phone" required></label>
        <label>CPF: <input type="text" name="cpf" required></label>
        <button id="submit-personal-data" class="primary">Enviar Dados</button>
      </div>
    `;
    const formContainer = appendMessage(formHtml, 'assistant', 'html');
    
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

    form.innerHTML = '<p>Obrigado! Suas informações foram recebidas. Entraremos em contato em breve.</p>';

    try {
      await fetch('/api/report-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, name, email, phone, cpf })
      });
    } catch (error) {
      console.error('Failed to save contact info:', error);
    }
    intakeState.stage = 'done';
  }

  async function handleSend() {
    // This function is now only for the initial message
    if (intakeState.stage === 'summary') {
      await handleInitialMessage();
    }
  }

  // --- Início da Execução ---

  aiSend.addEventListener('click', handleSend);
  aiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  });

  appendMessage('Olá! Sou a secretária virtual. Por favor, descreva seu caso em poucas palavras para que eu possa ajudar.', 'assistant');
});