'use client';

import { useState } from 'react';
import Link from 'next/link';
import { defaultConfig } from '@/lib/schema';

export default function Home() {
  const [prompt, setPrompt] = useState(defaultConfig.prompt_operacional);

  return (
    <div className="p-8 space-y-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Triagem Jurídica</h1>
      <label className="block">Área</label>
      <select
        className="border p-2 w-full"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      >
        <option value="consumidor">Consumidor</option>
        <option value="civel">Cível</option>
        <option value="familia">Família</option>
        <option value="previdenciario">Previdenciário</option>
        <option value="imobiliario">Imobiliário</option>
      </select>
      <Link href="/chat" className="block text-center bg-blue-500 text-white px-4 py-2 rounded">
        Iniciar triagem
      </Link>
    </div>
  );
}
