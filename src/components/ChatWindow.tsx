'use client';

import { useState } from 'react';
import SlotForm, { UIControl } from './SlotForm';
import FileDrop from './FileDrop';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const controls: UIControl[] = [
    { type: 'text_short', id: 'nome', label: 'Seu nome', required: true },
    { type: 'text_short', id: 'email', label: 'Email', required: true },
  ];

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages }),
    });
    const data = await res.json();
    setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <div className="border p-2 h-64 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
            <span className="block text-sm text-gray-500">{m.role}</span>
            <span>{m.content}</span>
          </div>
        ))}
      </div>
      <input
        className="border w-full p-2"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Digite sua mensagem"
      />
      <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
        Enviar
      </button>
      <SlotForm controls={controls} onSubmit={(values) => console.log(values)} />
      <FileDrop onFiles={(files) => console.log(files)} />
    </div>
  );
}
