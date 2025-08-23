import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // In production generate a presigned URL and return it.
  return NextResponse.json({ url: '/api/upload/placeholder' });
}
