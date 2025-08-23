import { useState } from 'react';
import FileDrop from './FileDrop';

export type UIControl =
  | { type: 'select'; id: string; label: string; options: string[]; required?: boolean }
  | { type: 'radio'; id: string; label: string; options: string[]; required?: boolean }
  | { type: 'date'; id: string; label: string; required?: boolean }
  | { type: 'file'; id: string; label: string; accept: string[]; maxSizeMB: number; maxFiles: number; required?: boolean }
  | { type: 'text_short' | 'text_long'; id: string; label: string; maxLen?: number; required?: boolean };

interface SlotFormProps {
  controls: UIControl[];
  onSubmit: (values: Record<string, unknown>) => void;
}

export default function SlotForm({ controls, onSubmit }: SlotFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});

  const handleChange = (id: string, value: unknown) => {
    setValues(v => ({ ...v, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
    setValues({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {controls.map(control => {
        switch (control.type) {
          case 'select':
            return (
              <label key={control.id} className="flex flex-col">
                {control.label}
                <select
                  required={control.required}
                  value={String(values[control.id] ?? '')}
                  onChange={e => handleChange(control.id, e.target.value)}
                  className="border p-1"
                >
                  <option value="">--</option>
                  {control.options.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </label>
            );
          case 'radio':
            return (
              <div key={control.id} className="flex flex-col">
                <span>{control.label}</span>
                {control.options.map(o => (
                  <label key={o} className="inline-flex items-center gap-1">
                    <input
                      type="radio"
                      name={control.id}
                      value={o}
                      checked={values[control.id] === o}
                      onChange={() => handleChange(control.id, o)}
                      required={control.required}
                    />
                    {o}
                  </label>
                ))}
              </div>
            );
          case 'date':
            return (
              <label key={control.id} className="flex flex-col">
                {control.label}
                <input
                  type="date"
                  value={String(values[control.id] ?? '')}
                  onChange={e => handleChange(control.id, e.target.value)}
                  required={control.required}
                  className="border p-1"
                />
              </label>
            );
          case 'file':
            return (
              <FileDrop
                key={control.id}
                control={control}
                onChange={files => handleChange(control.id, files)}
              />
            );
          default:
            return (
              <label key={control.id} className="flex flex-col">
                {control.label}
                {control.type === 'text_long' ? (
                  <textarea
                    value={String(values[control.id] ?? '')}
                    onChange={e => handleChange(control.id, e.target.value)}
                    required={control.required}
                    className="border p-1"
                  />
                ) : (
                  <input
                    type="text"
                    value={String(values[control.id] ?? '')}
                    onChange={e => handleChange(control.id, e.target.value)}
                    required={control.required}
                    className="border p-1"
                  />
                )}
              </label>
            );
        }
      })}
      <button type="submit" className="bg-blue-500 text-white px-4 py-1">Enviar</button>
    </form>
  );
}
