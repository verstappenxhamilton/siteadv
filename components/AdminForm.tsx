'use client';

import { useEffect, useState } from 'react';
import { Provider } from '@/lib/config';

interface ConfigForm {
  provider: Provider;
  max_output_tokens: number;
  temperature: number;
  top_p: number;
  stop_sequences: string;
  prompt: string;
  enableUpload: boolean;
  enableOCR: boolean;
}

export default function AdminForm() {
  const [form, setForm] = useState<ConfigForm | null>(null);

  useEffect(() => {
    fetch('/api/config').then(async r => {
      const data = await r.json();
      setForm({ ...data, stop_sequences: data.stop_sequences.join(',') });
    });
  }, []);

  if (!form) return <div>Loading...</div>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      stop_sequences: form.stop_sequences
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    };
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  };

  return (
    <form onSubmit={submit}>
      <label>
        Provedor
        <select
          value={form.provider}
          onChange={e => setForm({ ...form, provider: e.target.value as Provider })}
        >
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="groq">Groq</option>
        </select>
      </label>
      <label>
        Max tokens
        <input
          type="number"
          value={form.max_output_tokens}
          onChange={e =>
            setForm({ ...form, max_output_tokens: Number(e.target.value) })
          }
        />
      </label>
      <label>
        Temperatura
        <input
          type="number"
          step="0.1"
          value={form.temperature}
          onChange={e =>
            setForm({ ...form, temperature: Number(e.target.value) })
          }
        />
      </label>
      <label>
        Top P
        <input
          type="number"
          step="0.1"
          value={form.top_p}
          onChange={e => setForm({ ...form, top_p: Number(e.target.value) })}
        />
      </label>
      <label>
        Stop sequences
        <input
          type="text"
          value={form.stop_sequences}
          onChange={e => setForm({ ...form, stop_sequences: e.target.value })}
        />
      </label>
      <label>
        Prompt
        <textarea
          value={form.prompt}
          onChange={e => setForm({ ...form, prompt: e.target.value })}
        />
      </label>
      <label>
        Upload permitido
        <input
          type="checkbox"
          checked={form.enableUpload}
          onChange={e => setForm({ ...form, enableUpload: e.target.checked })}
        />
      </label>
      <label>
          OCR
        <input
          type="checkbox"
          checked={form.enableOCR}
          onChange={e => setForm({ ...form, enableOCR: e.target.checked })}
        />
      </label>
      <button type="submit">Salvar</button>
    </form>
  );
}
