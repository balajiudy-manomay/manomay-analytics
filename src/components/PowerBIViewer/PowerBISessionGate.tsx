'use client';

import React, { useMemo } from 'react';
import { parsePowerBIUrl } from '@/lib/powerbi/detectEmbedType';
import { EmbedStrategy } from '@/lib/powerbi/types';
import { PowerBIViewer } from './PowerBIViewer';
import { EmbedError } from './EmbedError';

interface PowerBISessionGateProps {
    containerRef?: React.RefObject<HTMLDivElement | null>;
    isFullscreen?: boolean;
}

// Client-side validation of the Power BI embed URL configuration.
// Validates pure client-side without any server actions or API routes.
export const PowerBISessionGate: React.FC<PowerBISessionGateProps> = ({
    containerRef,
    isFullscreen = false,
}) => {
    const embedUrl =
        process.env.NEXT_PUBLIC_POWERBI_EMBED_URL ||
        process.env.POWERBI_EMBED_URL ||
        '';

    const mode =
        ((process.env.NEXT_PUBLIC_POWERBI_EMBED_MODE ||
            process.env.POWERBI_EMBED_MODE) as EmbedStrategy) || 'auto';

    const analysis = useMemo(() => {
        if (!embedUrl) return null;
        return parsePowerBIUrl(embedUrl);
    }, [embedUrl]);

    if (!embedUrl || !analysis) {
        return (
            <EmbedError
                analysis={{
                    rawUrl: '',
                    embedType: 'unknown',
                    recommendedStrategy: 'iframe',
                    isAllowedDomain: false,
                    domain: 'none',
                    authRequired: false,
                    securityNote:
                        'No Power BI embed URL configured. Please set NEXT_PUBLIC_POWERBI_EMBED_URL in environment variables.',
                }}
                rawUrl=""
            />
        );
    }

    if (!analysis.isAllowedDomain || analysis.isEmbeddable === false) {
        return (
            <EmbedError
                analysis={analysis}
                rawUrl={analysis.rawUrl}
            />
        );
    }

    return (
        <PowerBIViewer
            embedUrl={embedUrl}
            analysis={analysis}
            mode={mode}
            containerRef={containerRef}
            isFullscreen={isFullscreen}
        />
    );
};
