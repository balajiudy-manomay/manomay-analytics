import { ParsedPowerBIUrl, PowerBIEmbedType, EmbedStrategy } from './types';
import { validatePowerBIUrl } from './validatePowerBIUrl';

export function parsePowerBIUrl(rawUrl: string): ParsedPowerBIUrl {
  const validation = validatePowerBIUrl(rawUrl);

  if (!validation.isValid) {
    return {
      rawUrl,
      embedType: 'unknown',
      recommendedStrategy: 'iframe',
      isAllowedDomain: false,
      domain: validation.hostname || 'unknown',
      authRequired: false,
      securityNote: validation.reason || 'Invalid or untrusted URL.',
    };
  }

  try {
    const parsed = new URL(rawUrl);
    const pathname = parsed.pathname;
    const searchParams = parsed.searchParams;
    const hostname = parsed.hostname.toLowerCase();

    // Playground sample URL
    if (hostname.includes('playground.powerbi.com')) {
      return {
        rawUrl,
        embedType: 'publish-to-web',
        recommendedStrategy: 'iframe',
        isAllowedDomain: true,
        domain: hostname,
        authRequired: false,
        securityNote: 'Microsoft Playground public demo report.',
      };
    }

    // Report Server URL with rs:embed=true
    if (searchParams.get('rs:embed') === 'true' || pathname.includes('/reports/')) {
      if (!hostname.includes('app.powerbi.com')) {
        return {
          rawUrl,
          embedType: 'report-server',
          recommendedStrategy: 'iframe',
          isAllowedDomain: true,
          domain: hostname,
          authRequired: true,
          securityNote: 'Power BI Report Server instance (requires Windows / NTLM auth).',
        };
      }
    }

    // 1. Publish to Web (/view?r=...)
    if (pathname.startsWith('/view')) {
      return {
        rawUrl,
        embedType: 'publish-to-web',
        recommendedStrategy: 'iframe',
        isAllowedDomain: true,
        domain: hostname,
        authRequired: false,
        securityNote: '🌐 Public Publish to Web Report. No Microsoft login required.',
      };
    }

    // 2. Secure Organizational Embed (/reportEmbed)
    if (pathname.startsWith('/reportEmbed')) {
      const reportId = searchParams.get('reportId') || undefined;
      const workspaceId = searchParams.get('groupId') || undefined;
      const pageName = searchParams.get('pageName') || undefined;

      return {
        rawUrl,
        embedType: 'secure-embed',
        recommendedStrategy: 'secure-iframe',
        isAllowedDomain: true,
        domain: hostname,
        workspaceId,
        reportId,
        pageName,
        authRequired: true,
        securityNote: '🔒 Secure Organizational Embed. Requires Microsoft Entra sign-in.',
      };
    }

    // 3. Normal Power BI Navigation URL (/groups/{groupId}/reports/{reportId}/...)
    const reportMatch = pathname.match(
      /\/groups\/([^\/]+)\/reports\/([^\/]+)(?:\/([^\/]+))?/
    );
    if (reportMatch) {
      const workspaceId = reportMatch[1];
      const reportId = reportMatch[2];
      const pageName = reportMatch[3] || searchParams.get('pageName') || undefined;

      // Auto-construct secure reportEmbed URL as iframe fallback
      const convertedEmbedUrl = `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${workspaceId}${
        pageName ? `&pageName=${pageName}` : ''
      }`;

      return {
        rawUrl,
        embedType: 'normal-report',
        recommendedStrategy: 'sdk-user',
        isAllowedDomain: true,
        domain: hostname,
        workspaceId,
        reportId,
        pageName,
        authRequired: true,
        securityNote:
          '🔑 Standard Power BI Navigation URL. Extracted Report & Workspace IDs for SDK/Secure embedding.',
        convertedEmbedUrl,
      };
    }

    // 4. Power BI App URL (/groups/{groupId}/apps/{appId}/...)
    const appMatch = pathname.match(/\/groups\/([^\/]+)\/apps\/([^\/]+)/);
    if (appMatch) {
      const workspaceId = appMatch[1];
      const appId = appMatch[2];

      return {
        rawUrl,
        embedType: 'powerbi-app',
        recommendedStrategy: 'sdk-user',
        isAllowedDomain: true,
        domain: hostname,
        workspaceId,
        appId,
        authRequired: true,
        securityNote:
          '📦 Power BI Organizational App URL. Content resolution requires SDK or user navigation.',
      };
    }

    // 5. Dashboard URL (/groups/{groupId}/dashboards/{dashboardId})
    const dashboardMatch = pathname.match(
      /\/groups\/([^\/]+)\/dashboards\/([^\/]+)/
    );
    if (dashboardMatch) {
      return {
        rawUrl,
        embedType: 'dashboard',
        recommendedStrategy: 'sdk-user',
        isAllowedDomain: true,
        domain: hostname,
        workspaceId: dashboardMatch[1],
        dashboardId: dashboardMatch[2],
        authRequired: true,
        securityNote: '📊 Power BI Dashboard. Recommended rendering via Power BI SDK.',
      };
    }

    // Generic fallback for recognized app.powerbi.com domain
    return {
      rawUrl,
      embedType: 'secure-embed',
      recommendedStrategy: 'secure-iframe',
      isAllowedDomain: true,
      domain: hostname,
      authRequired: true,
      securityNote: '🔒 Generic Power BI URL. Rendering via Secure Frame.',
    };
  } catch {
    return {
      rawUrl,
      embedType: 'unknown',
      recommendedStrategy: 'iframe',
      isAllowedDomain: false,
      domain: 'unknown',
      authRequired: false,
      securityNote: 'Invalid URL format.',
    };
  }
}
