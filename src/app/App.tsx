'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { EmbedViewer } from '@/components/EmbedViewer';
import { ScreenData } from './page';

interface AppProps {
  screens: ScreenData[];
  initialScreenId: string;
}

function AppContent({ screens, initialScreenId }: AppProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Synchronize active screen with URL query parameter `?screen=`
  const activeScreenId = searchParams.get('screen') || initialScreenId;
  const activeScreen = screens.find((s) => s.id === activeScreenId) || screens[0];

  const handleSelectScreen = (screenId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('screen', screenId);
    router.push(`?${params.toString()}`);
  };

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
      {/* Primary Header with Screen Dropdown Selector */}
      {!isFullscreen && (
        <Header
          screens={screens}
          activeScreenId={activeScreen.id}
          onSelectScreen={handleSelectScreen}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        />
      )}

      {/* Main Power BI Embed View */}
      <main className="flex-1 w-full h-full relative overflow-hidden flex flex-col min-h-0">
        <EmbedViewer
          embedUrl={activeScreen.url}
          screenName={activeScreen.name}
          envKey={activeScreen.envKey}
          containerRef={containerRef}
          isFullscreen={isFullscreen}
        />
      </main>
    </div>
  );
}

export default function App(props: AppProps) {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-slate-950" />}>
      <AppContent {...props} />
    </Suspense>
  );
}
