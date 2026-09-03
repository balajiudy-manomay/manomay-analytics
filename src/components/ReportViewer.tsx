'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Report, service as ServiceNamespace } from 'powerbi-client';
import { AlertOctagon, ArrowLeft, Loader2, Maximize2, Minimize2 } from 'lucide-react';

interface ReportViewerProps {
  reportKey: string;
  label: string;
}

export function ReportViewer({ reportKey, label }: ReportViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reportRef = useRef<Report | null>(null);
  const serviceRef = useRef<ServiceNamespace.Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function embed() {
      setIsLoading(true);
      setError('');
      try {
        // powerbi-client's UMD bundle references browser globals (`self`), so it
        // must only ever be imported client-side — never at module scope, which
        // Next also evaluates during server-side rendering of this component.
        const [pbi, res] = await Promise.all([
          import('powerbi-client'),
          fetch(`/api/embed-token?reportId=${encodeURIComponent(reportKey)}`),
        ]);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to load report.');
        }
        if (cancelled || !containerRef.current) return;

        const powerbiService = new pbi.service.Service(
          pbi.factories.hpmFactory,
          pbi.factories.wpmpFactory,
          pbi.factories.routerFactory,
        );
        serviceRef.current = powerbiService;

        reportRef.current = powerbiService.embed(containerRef.current, {
          type: 'report',
          id: data.reportId,
          embedUrl: data.embedUrl,
          accessToken: data.token,
          tokenType: pbi.models.TokenType.Embed,
          settings: {
            panes: { filters: { visible: false }, pageNavigation: { visible: true } },
          },
        }) as Report;

        reportRef.current.off('loaded');
        reportRef.current.on('loaded', () => setIsLoading(false));
        reportRef.current.off('error');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reportRef.current.on('error', (event: any) => {
          setError(event?.detail?.message || 'Power BI failed to render this report.');
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load report.');
          setIsLoading(false);
        }
      }
    }

    embed();

    return () => {
      cancelled = true;
      if (containerRef.current && serviceRef.current) {
        serviceRef.current.reset(containerRef.current);
      }
    };
  }, [reportKey]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.parentElement?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] w-full flex flex-col bg-slate-950">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to dashboards
        </Link>
        <h1 className="text-xs font-semibold text-slate-200">{label}</h1>
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          {isFullscreen ? 'Exit fullscreen' : 'Full screen'}
        </button>
      </div>

      <div className="relative flex-1 min-h-0">
        {isLoading && !error && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 text-white">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
            <p className="mt-3 text-sm">Loading {label}...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950 p-6">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-400">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <h2 className="text-sm font-bold text-white">Couldn&apos;t load this report</h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
