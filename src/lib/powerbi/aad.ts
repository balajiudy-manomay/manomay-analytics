interface CachedToken {
  token: string;
  expiresAt: number;
}

// Module-level cache: the AAD access token is valid for ~1 hour and is shared
// across every embed-token request the server handles, so there's no need to
// re-authenticate the service principal on every report load.
let cached: CachedToken | null = null;

export async function getAadToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token;
  }

  const tenantId = process.env.PBI_TENANT_ID;
  const clientId = process.env.PBI_CLIENT_ID;
  const clientSecret = process.env.PBI_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error(
      'Power BI service principal is not configured. Set PBI_TENANT_ID, PBI_CLIENT_ID and PBI_CLIENT_SECRET.',
    );
  }

  console.log(`[pbi] Requesting AAD token: tenantId=${tenantId} clientId=${clientId}`);

  const res = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://analysis.windows.net/powerbi/api/.default',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[pbi] AAD token request failed (${res.status}):`, body);
    throw new Error(`Failed to acquire Azure AD token (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  console.log(`[pbi] AAD token acquired, expires in ${data.expires_in}s`);
  cached = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cached.token;
}
