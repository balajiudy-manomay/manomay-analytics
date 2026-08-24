import React, { useState } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import { ParsedPowerBIUrl } from '../../lib/powerbi/types';
import { isMsalConfigured } from '../../lib/powerbi/msalConfig';
import { EmbedLoader } from './EmbedLoader';
import { ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';
import { IframeEmbed } from './IframeEmbed';

interface SDKEmbedProps {
  analysis: ParsedPowerBIUrl;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  isFullscreen?: boolean;
  onFallbackToIframe?: () => void;
}

export const SDKEmbed: React.FC<SDKEmbedProps> = ({
  analysis,
  containerRef,
  isFullscreen,
  onFallbackToIframe,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [forceIframeFallback, setForceIframeFallback] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string>('');

  const targetEmbedUrl =
    analysis.convertedEmbedUrl ||
    analysis.rawUrl ||
    `https://app.powerbi.com/reportEmbed?reportId=${analysis.reportId}&groupId=${analysis.workspaceId}`;

  // If MSAL isn't configured and no token is present, allow user to fall back or configure
  if (!accessToken && !isMsalConfigured()) {
    if (forceIframeFallback) {
      return (
        <IframeEmbed
          url={targetEmbedUrl}
          analysis={analysis}
          containerRef={containerRef}
          isFullscreen={isFullscreen}
        />
      );
    }

    return (
      <div className="flex-1 w-full h-full bg-slate-950 flex items-center justify-center p-6 text-slate-200 select-text overflow-y-auto">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-800/80 text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Power BI Client SDK Integration
              </h2>
              <p className="text-xs text-slate-400">
                Programmatic embedding mode requested for report ID: {analysis.reportId || 'N/A'}
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <p className="text-slate-300">
              <strong>Workspace ID:</strong>{' '}
              <code className="text-amber-300">{analysis.workspaceId || 'Detected'}</code>
            </p>
            <p className="text-slate-300">
              <strong>Report ID:</strong>{' '}
              <code className="text-amber-300">{analysis.reportId || 'Detected'}</code>
            </p>
            <p className="text-slate-400 leading-relaxed mt-2">
              Power BI Client SDK embedding offers enhanced programmatic controls (event listeners, custom filters, page navigation, and token refresh).
            </p>
          </div>

          <div className="bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-900/60 text-xs text-indigo-300 space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              Microsoft Entra ID Setup:
            </div>
            <p className="text-indigo-200/80 leading-relaxed">
              To enable automatic Entra token acquisition, configure <code className="text-amber-300 font-mono">VITE_AZURE_CLIENT_ID</code> and <code className="text-amber-300 font-mono">VITE_AZURE_TENANT_ID</code> in <code className="text-amber-300 font-mono">.env</code>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                setForceIframeFallback(true);
                onFallbackToIframe?.();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              Render in Secure iFrame Mode
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex-1 h-full bg-slate-950 overflow-hidden flex flex-col min-h-0 ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {isLoading && <EmbedLoader analysis={analysis} />}

      <PowerBIEmbed
        embedConfig={{
          type: 'report',
          id: analysis.reportId,
          embedUrl: targetEmbedUrl,
          accessToken: accessToken,
          tokenType: models.TokenType.Aad,
          settings: {
            panes: {
              filters: { expanded: false, visible: true },
              pageNavigation: { visible: true },
            },
            background: models.BackgroundType.Transparent,
          },
        }}
        eventHandlers={
          new Map([
            [
              'loaded',
              function () {
                setIsLoading(false);
              },
            ],
            [
              'rendered',
              function () {
                setIsLoading(false);
              },
            ],
            [
              'error',
              function (event?: any) {
                console.error('PowerBI SDK Error:', event?.detail);
                setIsLoading(false);
              },
            ],
          ])
        }
        cssClassName="w-full h-full border-0 flex-1 min-h-0 block bg-slate-950"
        getEmbeddedComponent={() => {}}
      />
    </div>
  );
};
