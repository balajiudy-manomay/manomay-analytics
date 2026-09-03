import { Loader2 } from 'lucide-react';

export default function ReportLoading() {
  return (
    <div className="h-[calc(100vh-3.5rem)] w-full flex flex-col bg-slate-950">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 shrink-0">
        <div className="h-3 w-28 rounded bg-slate-800 animate-pulse" />
        <div className="h-3 w-32 rounded bg-slate-800 animate-pulse" />
        <div className="h-3 w-20 rounded bg-slate-800 animate-pulse" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading report...</p>
      </div>
    </div>
  );
}
