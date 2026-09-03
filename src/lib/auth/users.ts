export interface UserRecord {
  email: string;
  password: string;
  role: string;
}

// USERS holds every login as "email:password:role" triples, comma-separated:
//   USERS="alice@company.com:pw1:admin,bob@company.com:pw2:viewer"
// Parsed on the email's FIRST ":" and the entry's LAST ":", so passwords may
// contain ":" (role names must not). Passwords/roles must not contain ",".
function parseUsers(raw: string): Map<string, UserRecord> {
  const users = new Map<string, UserRecord>();

  for (const entry of raw.split(',')) {
    const trimmed = entry.trim();
    if (!trimmed) continue;

    const firstColon = trimmed.indexOf(':');
    const lastColon = trimmed.lastIndexOf(':');
    if (firstColon === -1 || lastColon === firstColon) continue; // need email:password:role

    const email = trimmed.slice(0, firstColon).trim().toLowerCase();
    const password = trimmed.slice(firstColon + 1, lastColon).trim();
    const role = trimmed.slice(lastColon + 1).trim().toLowerCase();
    if (!email || !password || !role) continue;

    users.set(email, { email, password, role });
  }

  return users;
}

function getUserRecord(email: string): UserRecord | undefined {
  const users = parseUsers(process.env.USERS || '');
  return users.get(email.trim().toLowerCase());
}

export function verifyCredentials(email: string, password: string): boolean {
  const record = getUserRecord(email);
  return record !== undefined && record.password === password;
}

export function getRoleForEmail(email: string): string | undefined {
  return getUserRecord(email)?.role;
}
