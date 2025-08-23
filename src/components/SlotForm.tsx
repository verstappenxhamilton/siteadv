'use client';

import { useState } from 'react';

export type UIControl =
  | { type: 'select'; id: string; label: string; options: string[]; required?: boolean }
  | { type: 'radio'; id: string; label: string; options: string[]; required?: boolean }
  | { type: 'date'; id: string; label: string; required?: boolean }
  | { type: 'file'; id: string; label: string; accept: string[]; maxSizeMB: number; maxFiles: number; required?: boolean }
  | { type: 'text_short' | 'text_long'; id: string; label: string; maxLen?: number; required?: boolean };

interface Props {
  controls: UIControl[];
  onSubmit: (values: Record<string, string>) => void;
}

export default function SlotForm({ controls, onSubmit }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleChange = (id: string, value: string) => {
    setValues((v) => ({ ...v, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (const c of controls) {
      if (c.required && !values[c.id]) return alert('Preencha os campos obrigatórios');
    }
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {controls.map((c) => {
        switch (c.type) {
          case 'text_short':
          case 'text_long':
            return (
              <input
                key={c.id}
                className="border w-full p-2"
                placeholder={c.label}
                maxLength={c.maxLen}
                onChange={(e) => handleChange(c.id, e.target.value)}
              />
            );
          case 'select':
            return (
              <select
                key={c.id}
                className="border w-full p-2"
                onChange={(e) => handleChange(c.id, e.target.value)}
              >
                <option value="">{c.label}</option>
                {c.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            );
          default:
            return null;
        }
      })}
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
        Enviar
      </button>
    </form>
  );
}
