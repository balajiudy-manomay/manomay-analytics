const DEFAULT_ALLOWED_HOSTS = [
  'app.powerbi.com',
  'playground.powerbi.com',
  'app.powerbigov.us',
  'app.powerbi.de',
  'app.powerbi.cn',
];

export function getAllowedHosts(): string[] {
  const envHosts = import.meta.env.VITE_POWERBI_ALLOWED_HOSTS;
  if (!envHosts) {
    return DEFAULT_ALLOWED_HOSTS;
  }
  const custom = envHosts.split(',').map((h: string) => h.trim().toLowerCase());
  return Array.from(new Set([...DEFAULT_ALLOWED_HOSTS, ...custom]));
}

export function validatePowerBIUrl(url: string): {
  isValid: boolean;
  hostname: string;
  reason?: string;
} {
  if (!url || typeof url !== 'string') {
    return { isValid: false, hostname: '', reason: 'URL is empty or invalid.' };
  }

  try {
    const parsed = new URL(url);

    // Enforce HTTPS
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return {
        isValid: false,
        hostname: parsed.hostname,
        reason: 'Only HTTP and HTTPS protocols are permitted.',
      };
    }

    const allowedHosts = getAllowedHosts();
    const hostname = parsed.hostname.toLowerCase();

    const isAllowed = allowedHosts.some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
    );

    if (!isAllowed) {
      return {
        isValid: false,
        hostname,
        reason: `Domain '${hostname}' is not in the allowed host list. Allowed hosts: ${allowedHosts.join(', ')}`,
      };
    }

    return { isValid: true, hostname };
  } catch {
    return { isValid: false, hostname: '', reason: 'Malformed URL format.' };
  }
}
