'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const prompts = ['consumidor', 'civel', 'familia', 'previdenciario', 'imobiliario'];

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('consumidor');

  useEffect(() => {
    const cfg = localStorage.getItem('config');
    if (cfg) {
      const parsed = JSON.parse(cfg);
      setPrompt(parsed.prompt_operacional);
    }
  }, []);

  const start = () => {
    const cfg = JSON.parse(localStorage.getItem('config') || '{}');
    cfg.prompt_operacional = prompt;
    localStorage.setItem('config', JSON.stringify(cfg));
    router.push('/chat');
  };

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Triagem Jurídica</h1>
      <label className="flex flex-col max-w-sm">
        Prompt ativo
        <select value={prompt} onChange={e => setPrompt(e.target.value)} className="border p-1">
          {prompts.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </label>
      <button onClick={start} className="bg-blue-600 text-white px-4 py-2">Iniciar triagem</button>
    </main>
  );
}
