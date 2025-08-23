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

async function send() {
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
      const map = {
        missing_api_key: 'Chave de API ausente.',
        limit_reached: 'Limite de uso atingido.',
        msg_too_long: 'Mensagem muito longa.',
        session_closed: 'Sessão encerrada.'
      };
      if (!res.ok) {
        append('assistant', '[erro] ' + (map[data.error] || data.message || data.error));
        return;
      }
      append('assistant', data.reply || '[erro]');
    } catch (e) {
      append('assistant', '[erro de rede]');
    }
}

sendBtn.addEventListener('click', send);
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') send();
});

append('assistant', 'Olá! Sou a secretária virtual. Como posso ajudar?');
