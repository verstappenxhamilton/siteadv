import { NextRequest } from 'next/server';
import { getAdapter } from '@/lib/adapters';
import { currentConfig, ChatMessage } from '@/lib/config';
import { triageSchema } from '@/lib/schema';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(currentConfig.sessionMessageLimit, '1d')
});

export async function POST(req: NextRequest) {
  const ip = req.ip ?? '0.0.0.0';
  await limiter.limit(ip);
  const body = await req.json();
  const messages = body.messages as ChatMessage[];
  const fields = triageSchema.partial().parse(body.fields || {});
  const adapter = getAdapter(currentConfig.provider);
  const text = await adapter(messages, currentConfig);
  return Response.json({ text, fields });
}
