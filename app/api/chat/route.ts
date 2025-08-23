import { NextRequest, NextResponse } from 'next/server';
import { getAdapter, getConfig } from '@/lib/config';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(50, '86400 s')
});

export async function POST(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: 'rate limited' }, { status: 429 });
  }
  const body = await req.json();
  const cfg = getConfig();
  if (body.text && body.text.length > 2000) {
    return NextResponse.json({ error: 'message too long' }, { status: 400 });
  }
  const adapter = getAdapter();
  const payload = {
    ...body,
    max_output_tokens: cfg.max_output_tokens,
    temperature: cfg.temperature,
    top_p: cfg.top_p,
    stop_sequences: cfg.stop_sequences,
    prompt: cfg.prompt
  };
  const result = await adapter.generate(payload);
  return NextResponse.json(result);
}
