import React, { useState, useEffect } from 'react';
import { EmbedLoader } from './EmbedLoader';
import { ParsedPowerBIUrl } from '../../lib/powerbi/types';

interface IframeEmbedProps {
  url: string;
  analysis: ParsedPowerBIUrl;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  isFullscreen?: boolean;
}

export const IframeEmbed: React.FC<IframeEmbedProps> = ({
  url,
  analysis,
  containerRef,
  isFullscreen = false,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    // Timeout safety fallback in case iframe load event is suppressed
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, [url]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex-1 h-full bg-slate-950 overflow-hidden flex flex-col min-h-0 ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {isLoading && <EmbedLoader analysis={analysis} />}

      <iframe
        id="powerbi-report-iframe"
        title="Power BI Report Host"
        src={url}
        onLoad={() => setIsLoading(false)}
        className="w-full h-full border-0 flex-1 min-h-0 block bg-slate-950"
        allowFullScreen
        allow="fullscreen; geolocation; microphone; camera"
      />
    </div>
  );
};
