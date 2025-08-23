'use client';
import React from 'react';

interface Props {
  onUpload: (url: string) => void;
}

export default function FileDropzone({ onUpload }: Props) {
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: file.name, type: file.type, size: file.size })
    });
    const { url } = await res.json();
    // For demo purposes we do not actually upload to storage.
    onUpload(url);
  };

  return <input type="file" onChange={handleChange} />;
}
