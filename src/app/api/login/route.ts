import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials } from '@/lib/auth/users';
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from '@/lib/auth/session-constants';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  if (!verifyCredentials(email, password)) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, email, SESSION_COOKIE_OPTIONS);
  return res;
}
