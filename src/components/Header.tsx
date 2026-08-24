import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface HeaderProps {
  logoUrl?: string;
  companyName?: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  logoUrl = import.meta.env.VITE_COMPANY_LOGO || '/Manomay-logo (1).png',
  companyName = import.meta.env.VITE_COMPANY_NAME || '',
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 h-14 px-4 flex items-center justify-between z-30 shrink-0 select-none shadow-sm">
      {/* Left: Company Logo from Public Folder */}
      <div className="flex items-center gap-3">
        <img
          src={logoUrl}
          alt={companyName ? `${companyName} Logo` : 'Company Logo'}
          className="h-8 max-w-[200px] object-contain"
          onError={(e) => {
            // Fallback if logo fails to load
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        {companyName && (
          <span className="font-semibold text-sm text-slate-200 border-l border-slate-700 pl-3 hidden sm:inline">
            {companyName}
          </span>
        )}
      </div>

      {/* Right: Full Screen Button */}
      <div className="flex items-center gap-2">
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
