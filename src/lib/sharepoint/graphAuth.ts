// Acquires an app-only (client-credentials) Microsoft Graph token using the
// existing AZURE_TENANT_ID / AZURE_CLIENT_ID / AZURE_CLIENT_SECRET app
// registration. Cached in memory until shortly before it expires.

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;

async function fetchAppOnlyToken(): Promise<CachedToken> {
  const tenant = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenant || !clientId || !clientSecret) {
    throw new Error('Missing AZURE_TENANT_ID / AZURE_CLIENT_ID / AZURE_CLIENT_SECRET.');
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });

  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Graph token request failed (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  return {
    token: data.access_token,
    // refresh a minute early to avoid edge-of-expiry failures
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
}

export async function getGraphToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }
  cachedToken = await fetchAppOnlyToken();
  return cachedToken.token;
}
