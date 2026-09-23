'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ChevronDown, Sun, Moon, RefreshCw } from 'lucide-react';
import { useTheme } from 'next-themes';
import { refreshWorkbookCache } from '@/app/actions/workbook';
import { formatDisplayName, formatRole } from '@/lib/utils/formatters';
import { ManomayLogo } from './icons/ManomayLogo';

interface AuthHeaderProps {
  email: string | null;
  role?: string | null;
}

export function AuthHeader({ email, role }: AuthHeaderProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || '';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
      setIsMenuOpen(false);
    }
  };

  const handleRefreshCache = async () => {
    setIsRefreshing(true);
    setRefreshStatus(null);
    try {
      await refreshWorkbookCache();
      setRefreshStatus('Refreshed successfully!');
      router.refresh();
      setTimeout(() => setRefreshStatus(null), 3000);
    } catch (err: any) {
      setRefreshStatus(err?.message || 'Refresh failed');
      setTimeout(() => setRefreshStatus(null), 4000);
    } finally {
      setIsRefreshing(false);
    }
  };

  const isDark = resolvedTheme === 'dark';
  const displayName = email ? formatDisplayName(email) : '';
  const formattedRole = formatRole(role);
  const initial = email ? email.charAt(0).toUpperCase() : '?';

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
        {!email ? (
          mounted && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefreshCache}
                disabled={isRefreshing}
                title="Refresh Excel Data Cache"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
              </button>

              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          )
        ) : (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
              className="group flex items-center gap-2.5 px-2.5 py-1 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all duration-150 focus:outline-none cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 shadow-sm border border-slate-200/80 dark:border-amber-400/30">
                {initial}
              </div>

              <div className="flex flex-col items-start hidden sm:flex text-left leading-tight">
                <span className="text-xs font-semibold text-slate-900 dark:text-white max-w-[170px] truncate">
                  {displayName}
                </span>
                {formattedRole && (
                  <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {formattedRole}
                  </span>
                )}
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-all duration-200 ${
                  isMenuOpen ? 'rotate-180 text-amber-500 opacity-100' : 'opacity-70 group-hover:opacity-100'
                }`}
              />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
                  {formattedRole && (
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 capitalize mt-0.5">{formattedRole}</p>
                  )}
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-1">{email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={handleRefreshCache}
                    disabled={isRefreshing}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 flex items-center justify-between transition-colors disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2.5">
                      <RefreshCw className={`w-4 h-4 text-slate-500 dark:text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>Refresh data</span>
                    </span>
                    {isRefreshing && <span className="text-[10px] text-amber-500 font-medium">Syncing...</span>}
                  </button>

                  {mounted && (
                    <button
                      onClick={() => setTheme(isDark ? 'light' : 'dark')}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
                        <span>Theme</span>
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 capitalize">{resolvedTheme}</span>
                    </button>
                  )}
                </div>

                {refreshStatus && (
                  <div className="px-4 py-1.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60">
                    <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{refreshStatus}</p>
                  </div>
                )}

                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-1">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 transition-colors disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
