import { NextRequest } from 'next/server';
import { currentConfig, ProviderConfig } from '../../../lib/config';

export async function GET() {
  return Response.json(currentConfig);
}

export async function POST(req: NextRequest) {
  const data = (await req.json()) as Partial<ProviderConfig>;
  Object.assign(currentConfig, data);
  return Response.json(currentConfig);
}
