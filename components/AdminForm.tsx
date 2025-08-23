'use client';
import React, { useState } from 'react';
import { Provider } from '../lib/config';

export default function AdminForm() {
  const [provider, setProvider] = useState<Provider>('openai');
  const [model, setModel] = useState('gpt-4o-mini');
  const [apiKey, setApiKey] = useState('');
  const [maxTokens, setMaxTokens] = useState(512);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(1);
  const [messageLimit, setMessageLimit] = useState(20);
  const [prompt, setPrompt] = useState('');
  const [enableUpload, setEnableUpload] = useState(true);
  const [enableOCR, setEnableOCR] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        model,
        apiKey,
        maxOutputTokens: maxTokens,
        temperature,
        topP,
        messageLimit,
        prompt,
        enableUpload,
        enableOCR
      })
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label>
        Provedor
        <select value={provider} onChange={e => setProvider(e.target.value as Provider)}>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="groq">Groq</option>
        </select>
      </label>
      <label>
        Modelo
        <input value={model} onChange={e => setModel(e.target.value)} />
      </label>
      <label>
        API Key
        <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} />
      </label>
      <label>
        Max Tokens
        <input type="number" value={maxTokens} onChange={e => setMaxTokens(Number(e.target.value))} />
      </label>
      <label>
        Temperature
        <input type="number" step="0.1" value={temperature} onChange={e => setTemperature(Number(e.target.value))} />
      </label>
      <label>
        top_p
        <input type="number" step="0.1" value={topP} onChange={e => setTopP(Number(e.target.value))} />
      </label>
      <label>
        Limite de mensagens
        <input type="number" value={messageLimit} onChange={e => setMessageLimit(Number(e.target.value))} />
      </label>
      <label>
        Prompt Operacional
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} />
      </label>
      <label>
        Upload de documentos
        <input type="checkbox" checked={enableUpload} onChange={e => setEnableUpload(e.target.checked)} />
      </label>
      <label>
        OCR
        <input type="checkbox" checked={enableOCR} onChange={e => setEnableOCR(e.target.checked)} />
      </label>
      <button type="submit">Salvar</button>
    </form>
  );
}
