import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface EmbedViewerProps {
  embedUrl: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isFullscreen: boolean;
}

export const EmbedViewer: React.FC<EmbedViewerProps> = ({
  embedUrl,
  containerRef,
  isFullscreen,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, [embedUrl]);

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
              <h3 className="text-sm font-semibold text-white">Loading Power BI Dashboard...</h3>
            </div>
          </div>
        </div>
      )}

      {/* Main Full-Size Iframe */}
      <iframe
        id="powerbi-report-iframe"
        title="Power BI Dashboard"
        src={embedUrl}
        onLoad={() => setIsLoading(false)}
        className="w-full h-full border-0 flex-1 min-h-0 block"
        allowFullScreen
        allow="fullscreen; geolocation; microphone; camera"
      />
    </div>
  );
};
