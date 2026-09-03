'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { ManomayLogo } from './icons/ManomayLogo';

interface AuthHeaderProps {
  email: string | null;
}

export function AuthHeader({ email }: AuthHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || '';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 dark:bg-slate-900 dark:text-white dark:border-slate-800 h-14 px-4 flex items-center justify-between shrink-0 select-none shadow-sm gap-4">
      <div className="flex items-center gap-3 shrink-0">
        <ManomayLogo className="h-6 w-auto text-slate-900 dark:text-white" />
        {companyName && (
          <span className="font-semibold text-sm text-slate-700 dark:text-slate-200 border-l border-slate-300 dark:border-slate-700 pl-3 hidden md:inline">
            {companyName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <ThemeToggle />
        {email && (
          <>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">{email}</span>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 transition-colors disabled:opacity-60"
            >
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </>
        )}
      </div>
    </header>
  );
}
