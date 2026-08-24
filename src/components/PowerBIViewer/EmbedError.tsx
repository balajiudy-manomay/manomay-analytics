import React from 'react';
import { AlertOctagon, ExternalLink, ShieldAlert, KeyRound } from 'lucide-react';
import { ParsedPowerBIUrl } from '../../lib/powerbi/types';

interface EmbedErrorProps {
  analysis: ParsedPowerBIUrl;
  rawUrl: string;
}

export const EmbedError: React.FC<EmbedErrorProps> = ({ analysis, rawUrl }) => {
  return (
    <div className="flex-1 w-full h-full bg-slate-950 flex items-center justify-center p-6 text-slate-200 select-text overflow-y-auto">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Header Icon */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-400">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Cannot Display Power BI URL
            </h2>
            <p className="text-xs text-slate-400">
              Embedding error or security domain mismatch
            </p>
          </div>
        </div>

        {/* Diagnostic details */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
          <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
            <span className="text-slate-500">Domain Status:</span>
            <span className={analysis.isAllowedDomain ? 'text-emerald-400' : 'text-red-400'}>
              {analysis.isAllowedDomain ? 'Allowed Domain' : 'Blocked Domain'}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
            <span className="text-slate-500">Detected Type:</span>
            <span className="text-amber-400">{analysis.embedType}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
            <span className="text-slate-500">Auth Required:</span>
            <span className="text-indigo-400">
              {analysis.authRequired ? 'Yes (Microsoft Entra ID)' : 'No'}
            </span>
          </div>
          <div className="pt-1">
            <span className="text-slate-500 block mb-1">Target URL:</span>
            <div className="break-all bg-slate-900 p-2 rounded text-[11px] text-slate-300 border border-slate-800 max-h-20 overflow-y-auto">
              {rawUrl}
            </div>
          </div>
        </div>

        {/* Actionable Guidance */}
        <div className="space-y-2 text-xs">
          <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Recommendation:
          </h4>
          <p className="text-slate-400 leading-relaxed">
            {analysis.securityNote}
          </p>
          {!analysis.isAllowedDomain && (
            <p className="text-slate-400 leading-relaxed mt-1">
              To allow this domain, add <code className="text-amber-300 font-mono">{analysis.domain}</code> to <code className="text-amber-300 font-mono">VITE_POWERBI_ALLOWED_HOSTS</code> in your <code className="text-amber-300 font-mono">.env</code> configuration.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            Open Directly in Power BI Portal
          </a>
          {analysis.authRequired && (
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              Ensure organizational login
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
