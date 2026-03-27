import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/youtube';

export async function GET() {
  const authUrl = getAuthUrl();
  return NextResponse.redirect(authUrl);
}
