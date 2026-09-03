import { getRoleForEmail } from './users';

// ROLE_REPORTS holds each role's allowed report keys, comma-separated pairs of
// "role:[key:key:key]":
//   ROLE_REPORTS="admin:[resource-utilization:revenue-tracking],viewer:[status-updates]"
// Valid report keys are the ones defined in lib/powerbi/config.ts.
function parseRoleReports(raw: string): Record<string, string[]> {
  const roleReports: Record<string, string[]> = {};
  const pattern = /([a-zA-Z0-9_-]+):\[([^\]]*)\]/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(raw)) !== null) {
    const role = match[1].trim().toLowerCase();
    const reports = match[2]
      .split(':')
      .map((key) => key.trim())
      .filter(Boolean);
    roleReports[role] = reports;
  }

  return roleReports;
}

export function getReportKeysForEmail(email: string): string[] {
  const role = getRoleForEmail(email);
  if (!role) return [];

  const roleReports = parseRoleReports(process.env.ROLE_REPORTS || '');
  return roleReports[role] || [];
}
