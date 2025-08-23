'use client';

import { useEffect, useState } from 'react';
import { Config, defaultConfig } from '@/lib/schema';

interface Props {
  onSave?: (cfg: Config) => void;
}

export default function SettingsForm({ onSave }: Props) {
  const [config, setConfig] = useState<Config>(defaultConfig);

  useEffect(() => {
    const stored = localStorage.getItem('config');
    if (stored) setConfig(JSON.parse(stored));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((c) => ({ ...c, caps: { ...c.caps, [name]: Number(value) } }));
  };

  const save = () => {
    localStorage.setItem('config', JSON.stringify(config));
    onSave?.(config);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Max output tokens</label>
        <input
          type="number"
          name="max_output_tokens"
          className="border p-2 w-full"
          value={config.caps.max_output_tokens}
          onChange={handleChange}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Temperature</label>
        <input
          type="number"
          step="0.1"
          name="temperature"
          className="border p-2 w-full"
          value={config.caps.temperature}
          onChange={handleChange}
        />
      </div>
      <button onClick={save} className="bg-blue-500 text-white px-4 py-2 rounded">
        Salvar
      </button>
    </div>
  );
}
