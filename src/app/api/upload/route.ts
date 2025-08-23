import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: Request) {
  const data = await req.formData();
  const file = data.get('file') as unknown as File | null;
  if (!file) return NextResponse.json({ error: 'file missing' }, { status: 400 });
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!['pdf', 'jpg', 'png'].includes(ext || ''))
    return NextResponse.json({ error: 'invalid type' }, { status: 400 });
  if (buffer.length > 20 * 1024 * 1024)
    return NextResponse.json({ error: 'file too large' }, { status: 400 });
  const uploadDir = path.join(process.cwd(), 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, file.name);
  await fs.writeFile(filePath, buffer);
  return NextResponse.json({ url: `/uploads/${file.name}` });
}
