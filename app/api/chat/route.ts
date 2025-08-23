import { NextRequest, NextResponse } from 'next/server';
import { getAdapter } from '../../../lib/adapters';
import { getConfig } from '../../../lib/config';
import { triageSchema } from '../../../lib/schema';

const ipCounter = new Map<string, { count: number; day: string }>();

export async function POST(req: NextRequest) {
  const config = getConfig();
  const body = await req.json();
  const ip = req.headers.get('x-forwarded-for') || 'anon';

  const today = new Date().toISOString().slice(0, 10);
  const entry = ipCounter.get(ip) || { count: 0, day: today };
  if (entry.day !== today) {
    entry.count = 0;
    entry.day = today;
  }
  if (entry.count >= config.messageLimit) {
    return NextResponse.json({ error: 'Limite de mensagens diário excedido' }, { status: 429 });
  }
  entry.count++;
  ipCounter.set(ip, entry);

  if (body.fields) {
    const valid = triageSchema.safeParse(body.fields);
    if (!valid.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }
  }

  const adapter = getAdapter(config.provider);
  const response = await adapter.generate({ messages: body.messages });
  return NextResponse.json({ response });
}
