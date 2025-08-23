'use client';
import React, { useState } from 'react';
import FileDropzone from './FileDropzone';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  component?: { type: string; options?: string[] };
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá, sou sua secretária jurídica. Qual é o seu nome?',
      component: { type: 'text_short' }
    }
  ]);
  const [input, setInput] = useState('');

  const currentComponent = messages[messages.length - 1].component;

  const send = async () => {
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages })
    });
    const data = await res.json();
    setMessages([...newMessages, { role: 'assistant', content: data.response, component: data.component }]);
  };

  const renderInput = () => {
    if (!currentComponent) return null;
    switch (currentComponent.type) {
      case 'select':
        return (
          <select value={input} onChange={e => setInput(e.target.value)}>
            {currentComponent.options?.map(op => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div>
            {currentComponent.options?.map(op => (
              <label key={op}>
                <input
                  type="radio"
                  name="radio"
                  value={op}
                  checked={input === op}
                  onChange={e => setInput(e.target.value)}
                />
                {op}
              </label>
            ))}
          </div>
        );
      case 'date':
        return <input type="date" value={input} onChange={e => setInput(e.target.value)} />;
      case 'file':
        return <FileDropzone onUpload={url => setInput(url)} />;
      case 'text_long':
        return <textarea value={input} onChange={e => setInput(e.target.value)} />;
      default:
        return <input value={input} onChange={e => setInput(e.target.value)} />;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1 border p-2 h-64 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'assistant' ? 'text-blue-600' : 'text-black'}>
            {m.content}
          </div>
        ))}
      </div>
      {renderInput()}
      <button onClick={send}>Enviar</button>
    </div>
  );
}
