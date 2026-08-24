import React from 'react';
import { ShieldCheck, Lock, Globe, AlertTriangle, Cpu } from 'lucide-react';
import { ParsedPowerBIUrl, EmbedStrategy } from '../../lib/powerbi/types';

interface EmbedBadgeProps {
  analysis: ParsedPowerBIUrl;
  activeStrategy: EmbedStrategy;
  onStrategyChange?: (strategy: EmbedStrategy) => void;
}

export const EmbedBadge: React.FC<EmbedBadgeProps> = ({
  analysis,
  activeStrategy,
  onStrategyChange,
}) => {
  const getBadgeStyle = () => {
    switch (analysis.embedType) {
      case 'publish-to-web':
        return {
          bg: 'bg-emerald-950/80 border-emerald-800 text-emerald-300',
          icon: <Globe className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Public Publish to Web',
        };
      case 'secure-embed':
      case 'normal-report':
        return {
          bg: 'bg-indigo-950/80 border-indigo-800 text-indigo-300',
          icon: <Lock className="w-3.5 h-3.5 text-indigo-400" />,
          label: 'Organizational Secure Embed',
        };
      case 'powerbi-app':
        return {
          bg: 'bg-amber-950/80 border-amber-800 text-amber-300',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Power BI App Link',
        };
      case 'report-server':
        return {
          bg: 'bg-blue-950/80 border-blue-800 text-blue-300',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />,
          label: 'Power BI Report Server',
        };
      default:
        return {
          bg: 'bg-slate-900 border-slate-700 text-slate-300',
          icon: <Globe className="w-3.5 h-3.5 text-slate-400" />,
          label: 'Power BI Embed',
        };
    }
  };

  const badge = getBadgeStyle();

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 text-xs text-slate-300 z-20 shrink-0 select-none">
      {/* Classification Pill */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${badge.bg} font-medium`}
        title={analysis.securityNote}
      >
        {badge.icon}
        <span>{badge.label}</span>
      </div>

      {/* Mode / Strategy Selector */}
      <div className="flex items-center gap-1.5 bg-slate-950/60 px-2 py-1 rounded-md border border-slate-800 ml-auto">
        <Cpu className="w-3 h-3 text-amber-400" />
        <span className="text-[11px] text-slate-400 font-mono">Render Mode:</span>
        <select
          value={activeStrategy}
          onChange={(e) =>
            onStrategyChange?.(e.target.value as EmbedStrategy)
          }
          className="bg-slate-900 text-amber-300 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
        >
          <option value="auto">Auto (Smart Detect)</option>
          <option value="iframe">Standard iFrame</option>
          <option value="secure-iframe">Secure iFrame</option>
          <option value="sdk-user">Power BI SDK (User Owns Data)</option>
        </select>
      </div>
    </div>
  );
};
