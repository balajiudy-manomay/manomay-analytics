'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, AlertOctagon, ShieldAlert } from 'lucide-react';

interface EmbedViewerProps {
  embedUrl?: string;
  screenName?: string;
  envKey?: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isFullscreen: boolean;
}

function getEmbedUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed);
    const pathname = parsed.pathname;
    const searchParams = parsed.searchParams;

    // Convert App Redirect (/Redirect?action=OpenApp&appId=...) to appEmbed
    if (pathname.toLowerCase() === '/redirect' && searchParams.get('action') === 'OpenApp') {
      const appId = searchParams.get('appId');
      const ctid = searchParams.get('ctid');
      if (appId) {
        return `https://app.powerbi.com/appEmbed?appId=${appId}${ctid ? `&ctid=${ctid}` : ''}&autoAuth=true`;
      }
    }

    // Convert Report navigation links to reportEmbed
    const reportMatch = pathname.match(/\/groups\/([^\/]+)\/reports\/([^\/]+)(?:\/([^\/]+))?/);
    if (reportMatch) {
      const groupId = reportMatch[1];
      const reportId = reportMatch[2];
      const pageName = reportMatch[3] || searchParams.get('pageName');
      return `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${groupId}${
        pageName ? `&pageName=${pageName}` : ''
      }&autoAuth=true`;
    }

    // Convert App navigation links to appEmbed
    const appMatch = pathname.match(/\/groups\/([^\/]+)\/apps\/([^\/]+)/);
    if (appMatch) {
      const groupId = appMatch[1];
      const appId = appMatch[2];
      return `https://app.powerbi.com/appEmbed?appId=${appId}&groupId=${groupId}&autoAuth=true`;
    }

    // Secure report/app embed endpoint: ensure autoAuth=true
    if ((pathname.startsWith('/reportEmbed') || pathname.startsWith('/appEmbed')) && !trimmed.includes('autoAuth=true')) {
      return trimmed + (trimmed.includes('?') ? '&' : '?') + 'autoAuth=true';
    }

    return trimmed;
  } catch {
    return trimmed;
  }
}

export const EmbedViewer: React.FC<EmbedViewerProps> = ({
  embedUrl,
  screenName,
  envKey,
  containerRef,
  isFullscreen,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const finalUrl = getEmbedUrl(embedUrl);

  useEffect(() => {
    if (!finalUrl) return;
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, [finalUrl]);

  // Conditionally handle missing/unconfigured URL with an error screen
  if (!embedUrl || !finalUrl) {
    return (
      <div
        ref={containerRef}
        className={`flex-1 w-full h-full bg-slate-950 flex items-center justify-center p-6 text-slate-200 select-text overflow-y-auto ${
          isFullscreen ? 'fixed inset-0 z-50' : ''
        }`}
      >
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-400">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {screenName ? `${screenName} URL Missing` : 'No URL Configured'}
              </h2>
              <p className="text-xs text-slate-400">
                Power BI embed URL is missing for this view
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Setup Instructions:
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Open your <code className="text-amber-300 font-mono">.env</code> file and configure:
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300 break-all">
              {envKey || 'POWERBI_URL'}="https://app.powerbi.com/..."
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex-1 h-full bg-slate-950 overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* Loading state indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950 text-white transition-opacity duration-300">
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-slate-950 font-black text-lg">PBI</span>
              </div>
              <Loader2 className="w-16 h-16 text-amber-400 animate-spin absolute" />
            </div>
            <div className="mt-2">
              <h3 className="text-sm font-semibold text-white">
                Loading {screenName || 'Power BI Dashboard'}...
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Main Full-Size Iframe */}
      <iframe
        id="powerbi-report-iframe"
        name="powerbi-report-iframe"
        title={screenName || 'Power BI Dashboard'}
        src={finalUrl}
        onLoad={() => setIsLoading(false)}
        className="w-full h-full border-0 flex-1 min-h-0 block"
        allowFullScreen
        allow="fullscreen; geolocation; microphone; camera"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals allow-presentation"
      />
    </div>
  );
};
