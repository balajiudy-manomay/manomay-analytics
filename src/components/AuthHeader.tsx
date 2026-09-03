'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthHeaderProps {
  email: string | null;
}

export function AuthHeader({ email }: AuthHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logoUrl = process.env.NEXT_PUBLIC_COMPANY_LOGO || '/Manomay-logo (1).png';
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
    <header className="bg-slate-900 text-white border-b border-slate-800 h-14 px-4 flex items-center justify-between shrink-0 select-none shadow-sm gap-4">
      <div className="flex items-center gap-3 shrink-0">
        <img
          src={logoUrl}
          alt={companyName ? `${companyName} Logo` : 'Company Logo'}
          className="h-8 max-w-[200px] object-contain"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        {companyName && (
          <span className="font-semibold text-sm text-slate-200 border-l border-slate-700 pl-3 hidden md:inline">
            {companyName}
          </span>
        )}
      </div>

      {email && (
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-slate-400 hidden sm:inline">{email}</span>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-60"
          >
            {isLoggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      )}
    </header>
  );
}
