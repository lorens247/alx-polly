import { NextResponse } from 'next/server';
import { setCSRFToken } from '@/app/lib/utils/csrf';

export async function GET() {
  try {
    const token = await setCSRFToken();
    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
