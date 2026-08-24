import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { PowerBIViewer } from './components/PowerBIViewer/PowerBIViewer';

const DEFAULT_EMBED_URL =
  'https://playground.powerbi.com/sampleReportEmbed';

export default function App() {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const embedUrl = import.meta.env.VITE_POWERBI_EMBED_URL || DEFAULT_EMBED_URL;

  // Handle Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(!isFullscreen);
        });
      } else {
        setIsFullscreen(!isFullscreen);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden select-none font-sans">
      {/* Top Header: Company Logo & Controls */}
      {!isFullscreen && (
        <Header
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        />
      )}

      {/* Main Power BI Universal Embed Host */}
      <main className="flex-1 w-full h-full relative overflow-hidden flex flex-col min-h-0">
        <PowerBIViewer
          embedUrl={embedUrl}
          containerRef={containerRef}
          isFullscreen={isFullscreen}
        />
      </main>
    </div>
  );
}

