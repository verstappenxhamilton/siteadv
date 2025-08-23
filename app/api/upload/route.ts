import { NextRequest, NextResponse } from 'next/server';

const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
const maxSize = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!allowed.includes(body.type) || body.size > maxSize) {
    return NextResponse.json({ error: 'Arquivo inválido' }, { status: 400 });
  }
  // Here you would create a presigned URL for real storage like S3.
  const url = `https://example.com/uploads/${encodeURIComponent(body.name)}`;
  return NextResponse.json({ url });
}
