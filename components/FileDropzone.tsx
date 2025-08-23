'use client';
import { useState } from 'react';

interface Props {
  onUploaded: (url: string) => void;
}

export default function FileDropzone({ onUploaded }: Props) {
  const [error, setError] = useState('');

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ name: file.name, type: file.type })
    });
    if (!res.ok) {
      setError('Upload não permitido');
      return;
    }
    const { url } = await res.json();
    onUploaded(url);
  }

  return (
    <div>
      <input type="file" onChange={onChange} />
      {error && <p>{error}</p>}
    </div>
  );
}
