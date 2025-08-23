import { useEffect, useState } from 'react';
import { ConfigSchema } from '../lib/schema';
import { z } from 'zod';

export type Config = z.infer<typeof ConfigSchema>;

const defaultConfig: Config = {
  provider_preferencias: ['openai', 'groq', 'anthropic'],
  keys: {},
  caps: {
    max_output_tokens: 160,
    max_turns_por_sessao: 10,
    temperature: 0.4,
    top_p: 0.9,
    stop_sequences: ['\n\nFIM']
  },
  limites_upload: {
    tipos: ['pdf', 'jpg', 'png'],
    tam_mb: 20,
    max_arquivos: 8
  },
  prompt_operacional: 'consumidor',
  prompt_custom: ''
};

export default function SettingsForm() {
  const [config, setConfig] = useState<Config>(defaultConfig);

  useEffect(() => {
    const stored = localStorage.getItem('config');
    if (stored) setConfig(JSON.parse(stored));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value } as Config));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('config', JSON.stringify(config));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label className="flex flex-col">
        Prompt custom
        <textarea name="prompt_custom" value={config.prompt_custom} onChange={handleChange} className="border p-1" />
      </label>
      <button type="submit" className="bg-green-600 text-white px-4 py-1">Salvar</button>
    </form>
  );
}
