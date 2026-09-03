import { cookies } from 'next/headers';
import { SESSION_COOKIE } from './session-constants';

export async function getSessionEmail(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value || null;
}

export { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from './session-constants';
