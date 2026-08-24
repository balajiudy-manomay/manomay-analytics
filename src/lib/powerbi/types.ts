import React from 'react';

export type PowerBIEmbedType =
  | 'publish-to-web'
  | 'secure-embed'
  | 'normal-report'
  | 'powerbi-app'
  | 'report-server'
  | 'dashboard'
  | 'visual'
  | 'paginated'
  | 'unknown';

export type EmbedStrategy =
  | 'auto'
  | 'iframe'
  | 'secure-iframe'
  | 'sdk-user'
  | 'sdk-app';

export interface ParsedPowerBIUrl {
  rawUrl: string;
  embedType: PowerBIEmbedType;
  recommendedStrategy: EmbedStrategy;
  isAllowedDomain: boolean;
  domain: string;
  workspaceId?: string;
  reportId?: string;
  appId?: string;
  dashboardId?: string;
  pageName?: string;
  authRequired: boolean;
  securityNote: string;
  convertedEmbedUrl?: string;
}

export interface PowerBIViewerProps {
  embedUrl: string;
  strategyOverride?: EmbedStrategy;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  isFullscreen?: boolean;
  companyName?: string;
  logoUrl?: string;
}

