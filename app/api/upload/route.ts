import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { name, type } = await req.json();
  if (!type.startsWith('application/pdf')) {
    return new Response('Tipo inválido', { status: 400 });
  }
  return Response.json({
    url: 'https://example.com/upload',
    fields: { key: name }
  });
}
