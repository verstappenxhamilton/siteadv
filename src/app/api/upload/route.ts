import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file = data.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), 'uploads');
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, file.name);
  await fs.writeFile(filePath, buffer);
  return NextResponse.json({ url: '/uploads/' + file.name });
}
