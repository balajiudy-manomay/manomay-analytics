// Microsoft Entra ID (Azure AD) MSAL Configuration Scaffolding

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${
      import.meta.env.VITE_AZURE_TENANT_ID || 'common'
    }`,
    redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const powerBiScopes = [
  'https://analysis.windows.net/powerbi/api/Report.Read.All',
  'https://analysis.windows.net/powerbi/api/Dashboard.Read.All',
];

export function isMsalConfigured(): boolean {
  return (
    Boolean(import.meta.env.VITE_AZURE_CLIENT_ID) &&
    Boolean(import.meta.env.VITE_AZURE_TENANT_ID)
  );
}
