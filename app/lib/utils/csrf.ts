import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

const CSRF_TOKEN_NAME = 'csrf-token';
const CSRF_TOKEN_LENGTH = 32;

export async function generateCSRFToken(): Promise<string> {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

export async function setCSRFToken(): Promise<string> {
  const token = await generateCSRFToken();
  const cookieStore = await cookies();
  
  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
  });
  
  return token;
}

export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_TOKEN_NAME)?.value || null;
}

export async function validateCSRFToken(token: string): Promise<boolean> {
  const storedToken = await getCSRFToken();
  return storedToken === token;
}

export async function requireCSRFToken(formData: FormData): Promise<boolean> {
  const token = formData.get('csrf-token') as string;
  if (!token) return false;
  
  return await validateCSRFToken(token);
}
