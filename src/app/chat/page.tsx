'use client';
import ChatWindow from '@/components/ChatWindow';
import { baseSlots, areaSlots } from '@/lib/slots';
import type { UIControl } from '@/components/SlotForm';
import { useEffect, useState } from 'react';

export default function ChatPage() {
  const [controls, setControls] = useState<UIControl[]>([]);
  useEffect(() => {
    const cfg = JSON.parse(localStorage.getItem('config') || '{}');
    const area = cfg.prompt_operacional || 'consumidor';
    setControls([...baseSlots, ...areaSlots[area] || []]);
  }, []);
  return (
    <main className="p-4">
      <ChatWindow initialControls={controls} />
    </main>
  );
}
