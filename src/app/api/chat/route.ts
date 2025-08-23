import { NextResponse } from 'next/server';
import { routePrompt } from '@/lib/router';
import { ConfigSchema } from '@/lib/schema';
import { z } from 'zod';

type Message = { role: string; content: string };

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, config } = body as {
    messages: Message[];
    config: z.infer<typeof ConfigSchema>;
  };
  try {
    ConfigSchema.parse(config);
  } catch {
    return NextResponse.json({ error: 'config inválida' }, { status: 400 });
  }
  const last = messages[messages.length - 1]?.content || '';
  const result = await routePrompt(last, config);
  return NextResponse.json({
    assistantMessage: result.content,
    provider: result.provider,
    usage: result.usage,
    model: result.model,
  });
}
