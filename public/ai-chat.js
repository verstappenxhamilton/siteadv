const messages = [
  {
    role: 'system',
    content: 'Você é uma secretária jurídica que conduz uma triagem em blocos (identificação, caso, prazos/risco, documentos, fechamento). Faça perguntas curtas.'
  }
];

const input = document.getElementById('aiInput');
const send = document.getElementById('aiSend');
const messagesDiv = document.getElementById('aiMessages');

function addMessage(role, text) {
  const p = document.createElement('p');
  p.textContent = text;
  p.className = role;
  messagesDiv.appendChild(p);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  addMessage('user', text);
  messages.push({ role: 'user', content: text });
  input.value = '';
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });
    const data = await res.json();
    const reply = data.text || data.output_text || 'Sem resposta.';
    addMessage('assistant', reply);
    messages.push({ role: 'assistant', content: reply });
  } catch (e) {
    addMessage('assistant', 'Erro ao contatar o servidor.');
  }
}

send.addEventListener('click', sendMessage);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});
