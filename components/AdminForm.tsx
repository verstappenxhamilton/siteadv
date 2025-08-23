'use client';
import { useEffect, useState } from 'react';

export default function AdminForm() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin')
      .then(r => r.json())
      .then(setConfig);
  }, []);

  if (!config) return <p>Carregando...</p>;

  async function save() {
    await fetch('/api/admin', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  return (
    <div>
      <select
        value={config.provider}
        onChange={e => setConfig({ ...config, provider: e.target.value })}
      >
        <option value="openai">OpenAI</option>
        <option value="anthropic">Anthropic</option>
        <option value="groq">Groq</option>
      </select>
      <input
        type="password"
        value={config.apiKey}
        onChange={e => setConfig({ ...config, apiKey: e.target.value })}
        placeholder="API key"
      />
      <input
        type="number"
        value={config.maxOutputTokens}
        onChange={e =>
          setConfig({ ...config, maxOutputTokens: Number(e.target.value) })
        }
      />
      <input
        type="number"
        step="0.1"
        value={config.temperature}
        onChange={e =>
          setConfig({ ...config, temperature: Number(e.target.value) })
        }
      />
      <button onClick={save}>Salvar</button>
    </div>
  );
}
