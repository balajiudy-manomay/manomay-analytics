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
    <header className="bg-slate-900/95 backdrop-blur-sm text-white border-b border-slate-800/80 h-9 px-3 flex items-center justify-between z-30 shrink-0 select-none shadow-sm">
      {/* Left: Company Logo from Public Folder */}
      <div className="flex items-center gap-2.5">
        <img
          src={logoUrl}
          alt={companyName ? `${companyName} Logo` : 'Company Logo'}
          className="h-5 max-w-[160px] object-contain"
          onError={(e) => {
            // Fallback if logo fails to load
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        {companyName && (
          <span className="font-semibold text-xs text-slate-300 border-l border-slate-700/80 pl-2.5 hidden sm:inline tracking-tight">
            {companyName}
          </span>
        )}
      </div>

      {/* Right: Full Screen Button */}
      <div className="flex items-center gap-2">
        <button
          id="btn-toggle-fullscreen"
          onClick={onToggleFullscreen}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:text-white transition-colors cursor-pointer text-[11px] font-medium"
          title={isFullscreen ? 'Exit Fullscreen' : 'Full Screen View'}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Full Screen</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
