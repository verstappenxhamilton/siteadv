'use client';
import { useState } from 'react';
import FileDropzone from './FileDropzone';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<string[]>([]);

  async function send() {
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: newMessages, fields: {} })
    });
    const data = await res.json();
    setMessages([...newMessages, { role: 'assistant', content: data.text }]);
  }

  return (
    <div>
      <div>
        {messages.map((m, i) => (
          <p key={i}>
            <strong>{m.role}:</strong> {m.content}
          </p>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={send}>Enviar</button>
      <FileDropzone onUploaded={url => setFiles([...files, url])} />
    </div>
  );
}
