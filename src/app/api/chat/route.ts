import { NextRequest, NextResponse } from 'next/server';
import { Config, ConfigSchema, defaultConfig } from '@/lib/schema';
import { routeChat } from '@/lib/router';
import { rateLimit } from '@/lib/ratelimit';

interface Message { role: string; content: string }

export async function POST(req: NextRequest) {
  const ip = req.ip ?? '0.0.0.0';
  if (!rateLimit(ip)) return NextResponse.json({ error: 'rate limit' }, { status: 429 });

  const body = await req.json();
  const configInput = ConfigSchema.partial().parse(body.config || {});
  const merged: Config = { ...defaultConfig, ...configInput } as Config;
  const messages: Message[] = body.messages || [];

  const reply = await routeChat(messages, merged);
  return NextResponse.json({ reply });
}
