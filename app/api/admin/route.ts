import { NextRequest, NextResponse } from 'next/server';
import { updateConfig, runtimeConfig } from '../../../lib/config';

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.provider || !body.model) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
  }
  updateConfig({
    provider: body.provider,
    model: body.model,
    maxOutputTokens: body.maxOutputTokens,
    temperature: body.temperature,
    topP: body.topP,
    messageLimit: body.messageLimit,
    prompt: body.prompt,
    enableUpload: body.enableUpload,
    enableOCR: body.enableOCR
  });
  if (body.apiKey) {
    runtimeConfig.apiKeys[body.provider] = body.apiKey;
  }
  return NextResponse.json({ ok: true });
}
