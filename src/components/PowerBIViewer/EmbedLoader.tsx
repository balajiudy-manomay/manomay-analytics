import React from 'react';
import { Loader2 } from 'lucide-react';
import { ParsedPowerBIUrl } from '../../lib/powerbi/types';

interface EmbedLoaderProps {
  analysis?: ParsedPowerBIUrl;
}

export const EmbedLoader: React.FC<EmbedLoaderProps> = ({ analysis }) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/95 text-white transition-opacity duration-300">
      <div className="flex flex-col items-center gap-3 text-center px-4 max-w-md">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-xl shadow-amber-500/10 animate-pulse">
            <span className="text-slate-950 font-black text-xl tracking-tighter">
              PBI
            </span>
          </div>
          <Loader2 className="w-20 h-20 text-amber-400 animate-spin absolute" />
        </div>
        <div className="mt-3">
          <h3 className="text-base font-semibold text-white">
            Loading Power BI Dashboard...
          </h3>
          {analysis && (
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Mode: {analysis.embedType} ({analysis.domain})
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
