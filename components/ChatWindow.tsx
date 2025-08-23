'use client';

import { useState } from 'react';
import { triageSchema, TriageData } from '@/lib/schema';
import FileDropzone from './FileDropzone';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [form, setForm] = useState<TriageData>({
    identification: { name: '', email: '' },
    case: { description: '' },
    deadlines: { hasDeadline: false, date: '', risk: 'medio' },
    documents: []
  });
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState<string[] | null>(null);
  const [checklist, setChecklist] = useState<string[] | null>(null);

  const handleSend = async () => {
    const newMessages: Message[] = [
      ...messages,
      { sender: 'user' as const, text: input }
    ];
    setMessages(newMessages);
    setInput('');
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages, form })
    });
    const data = await res.json();
    setMessages([
      ...newMessages,
      { sender: 'bot' as const, text: data.text }
    ]);
  };

  const finalize = () => {
    const parsed = triageSchema.safeParse(form);
    if (!parsed.success) return;
    const s: string[] = [
      `Nome: ${form.identification.name}`,
      `Email: ${form.identification.email}`,
      `Caso: ${form.case.description}`,
      form.deadlines.hasDeadline
        ? `Prazo: ${form.deadlines.date}`
        : 'Sem prazo informado',
      `Risco: ${form.deadlines.risk}`
    ];
    const c: string[] = [];
    if (!form.documents || form.documents.length === 0) {
      c.push('Enviar documentos');
    }
    setSummary(s);
    setChecklist(c);
  };

  return (
    <div>
      <div>
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.sender === 'user' ? 'Você' : 'Bot'}:</strong> {m.text}
          </div>
        ))}
      </div>
      <div>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Digite sua mensagem"
        />
        <button onClick={handleSend}>Enviar</button>
      </div>
      <form>
        <h3>Identificação</h3>
        <input
          type="text"
          placeholder="Nome"
          value={form.identification.name}
          onChange={e =>
            setForm({
              ...form,
              identification: {
                ...form.identification,
                name: e.target.value
              }
            })
          }
        />
        <input
          type="email"
          placeholder="Email"
          value={form.identification.email}
          onChange={e =>
            setForm({
              ...form,
              identification: {
                ...form.identification,
                email: e.target.value
              }
            })
          }
        />
        <h3>Caso</h3>
        <textarea
          placeholder="Descrição"
          value={form.case.description}
          onChange={e =>
            setForm({
              ...form,
              case: { description: e.target.value }
            })
          }
        />
        <h3>Prazos e risco</h3>
        <label>
          <input
            type="radio"
            checked={form.deadlines.hasDeadline}
            onChange={() =>
              setForm({
                ...form,
                deadlines: { ...form.deadlines, hasDeadline: true }
              })
            }
          />
          Com prazo
        </label>
        <label>
          <input
            type="radio"
            checked={!form.deadlines.hasDeadline}
            onChange={() =>
              setForm({
                ...form,
                deadlines: { ...form.deadlines, hasDeadline: false }
              })
            }
          />
          Sem prazo
        </label>
        {form.deadlines.hasDeadline && (
          <input
            type="date"
            value={form.deadlines.date}
            onChange={e =>
              setForm({
                ...form,
                deadlines: { ...form.deadlines, date: e.target.value }
              })
            }
          />
        )}
        <select
          value={form.deadlines.risk}
          onChange={e =>
            setForm({
              ...form,
              deadlines: { ...form.deadlines, risk: e.target.value as any }
            })
          }
        >
          <option value="alto">Alto</option>
          <option value="medio">Médio</option>
          <option value="baixo">Baixo</option>
        </select>
        <h3>Documentos</h3>
        <FileDropzone onFiles={files =>
          setForm({ ...form, documents: files.map(f => f.name) })
        } />
      </form>
      {triageSchema.safeParse(form).success && (
        <button onClick={finalize}>Finalizar</button>
      )}
      {summary && (
        <div>
          <h3>Resumo</h3>
          <ul>
            {summary.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          <h3>Pendências</h3>
          <ul>
            {checklist &&
              checklist.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
          </ul>
          <h3>JSON</h3>
          <pre>{JSON.stringify(form, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
