import { redirect } from 'next/navigation';
import { getSessionEmail } from '@/lib/auth/session';

export const instant = false;

export default async function RootPage() {
  const email = await getSessionEmail();
  redirect(email ? '/dashboard' : '/login');
}
