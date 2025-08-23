import { useState } from 'react';
import SlotForm, { UIControl } from './SlotForm';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWindowProps {
  initialControls?: UIControl[];
}

export default function ChatWindow({ initialControls = [] }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const controls = initialControls;

  const handleSubmit = (values: Record<string, unknown>) => {
    setMessages([...messages, { role: 'user', content: JSON.stringify(values) }]);
  };

  return (
    <div className="space-y-4">
      <div className="border p-4 h-64 overflow-y-auto" data-testid="chat-log">
        {messages.map((m, idx) => (
          <div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            {m.content}
          </div>
        ))}
      </div>
      <SlotForm controls={controls} onSubmit={handleSubmit} />
    </div>
  );
}
