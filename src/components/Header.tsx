'use client';

import React from 'react';
import { Maximize2, Minimize2, ChevronDown } from 'lucide-react';
import { ScreenData } from '@/app/page';

interface HeaderProps {
  logoUrl?: string;
  companyName?: string;
  screens?: ScreenData[];
  activeScreenId?: string;
  onSelectScreen?: (screenId: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  logoUrl = process.env.NEXT_PUBLIC_COMPANY_LOGO || '/Manomay-logo (1).png',
  companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || '',
  screens = [],
  activeScreenId = '',
  onSelectScreen,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 h-14 px-4 flex items-center justify-between z-30 shrink-0 select-none shadow-sm gap-4">
      {/* Left: Company Logo */}
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

      {/* Center/Right: Screen Dropdown Selector */}
      {screens.length > 0 && onSelectScreen && (
        <div className="flex items-center gap-2 max-w-xs sm:max-w-md w-full justify-end">
          <div className="relative w-full max-w-xs">
            <select
              value={activeScreenId}
              onChange={(e) => onSelectScreen(e.target.value)}
              className="w-full appearance-none bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs sm:text-sm py-1.5 pl-3 pr-8 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/50 cursor-pointer shadow-sm transition-colors truncate"
            >
              {screens.map((screen) => (
                <option key={screen.id} value={screen.id} className="bg-slate-900 text-white py-1">
                  {screen.name} {!screen.url ? ' (Not Configured)' : ''}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Right: Full Screen Button */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          id="btn-toggle-fullscreen"
          onClick={onToggleFullscreen}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white transition-colors cursor-pointer text-xs font-medium"
          title={isFullscreen ? 'Exit Fullscreen' : 'Full Screen View'}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Full Screen</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
