import { NextRequest, NextResponse } from 'next/server';
import { getConfig, updateConfig } from '@/lib/config';

export async function GET() {
  return NextResponse.json(getConfig());
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  updateConfig(data);
  return NextResponse.json({ ok: true });
}
