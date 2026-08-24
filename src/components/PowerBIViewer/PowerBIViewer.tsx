import React, { useState, useMemo } from 'react';
import { parsePowerBIUrl } from '../../lib/powerbi/detectEmbedType';
import { EmbedStrategy, PowerBIViewerProps } from '../../lib/powerbi/types';
import { IframeEmbed } from './IframeEmbed';
import { SDKEmbed } from './SDKEmbed';
import { EmbedError } from './EmbedError';

export const PowerBIViewer: React.FC<PowerBIViewerProps> = ({
  embedUrl,
  strategyOverride,
  containerRef,
  isFullscreen = false,
}) => {
  const envMode = (import.meta.env.VITE_POWERBI_EMBED_MODE as EmbedStrategy) || 'auto';
  const [selectedStrategy, setSelectedStrategy] = useState<EmbedStrategy>(
    strategyOverride || envMode
  );

  // Analyze incoming URL
  const analysis = useMemo(() => {
    return parsePowerBIUrl(embedUrl);
  }, [embedUrl]);

  // Determine active strategy
  const activeStrategy: EmbedStrategy =
    selectedStrategy === 'auto'
      ? analysis.recommendedStrategy
      : selectedStrategy;

  // Domain security check
  if (!analysis.isAllowedDomain) {
    return <EmbedError analysis={analysis} rawUrl={embedUrl} />;
  }

  // Determine target URL for rendering
  const renderUrl =
    analysis.convertedEmbedUrl && (activeStrategy === 'iframe' || activeStrategy === 'secure-iframe')
      ? analysis.convertedEmbedUrl
      : embedUrl;

  return (
    <div className="flex-1 w-full h-full flex flex-col min-h-0 bg-slate-950 overflow-hidden relative">
      {/* Main Embed Content */}
      <main className="flex-1 w-full h-full relative overflow-hidden flex flex-col min-h-0">
        {activeStrategy === 'sdk-user' || activeStrategy === 'sdk-app' ? (
          <SDKEmbed
            analysis={analysis}
            containerRef={containerRef}
            isFullscreen={isFullscreen}
            onFallbackToIframe={() => setSelectedStrategy('secure-iframe')}
          />
        ) : (
          <IframeEmbed
            url={renderUrl}
            analysis={analysis}
            containerRef={containerRef}
            isFullscreen={isFullscreen}
          />
        )}
      </main>
    </div>
  );
};
