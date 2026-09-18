'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertOctagon, ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';

interface ReportViewerProps {
  reportKey: string;
  label: string;
  embedUrl: string;
}

export function ReportViewer({ label, embedUrl }: ReportViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div ref={containerRef} className="h-[calc(100vh-3.5rem)] w-full flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to dashboards
        </Link>
        <h1 className="text-xs font-semibold text-slate-800 dark:text-slate-200">{label}</h1>
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          {isFullscreen ? 'Exit fullscreen' : 'Full screen'}
        </button>
      </div>

      <div className="relative flex-1 min-h-0 w-full h-full">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={label}
            className="w-full h-full border-0"
            allow="fullscreen; unload *"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg dark:shadow-2xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 text-amber-600 dark:text-amber-400">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Report URL Not Configured</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                The Power BI report URL for &quot;{label}&quot; is not configured in the environment variables yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
