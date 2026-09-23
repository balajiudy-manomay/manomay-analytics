import { getWorkbookData } from '../sharepoint/store';
import type { UserRecord } from '../sharepoint/parseWorkbook';

export type { UserRecord };

// The SharePoint workbook's 'Users' sheet is the sole source of truth for
// login accounts - no local/env fallback.
async function getUserRecord(email: string): Promise<UserRecord | undefined> {
  const data = await getWorkbookData();
  return data.users.get(email.trim().toLowerCase());
}

export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const record = await getUserRecord(email);
  return record !== undefined && record.password === password;
}

export async function getRoleForEmail(email: string): Promise<string | undefined> {
  return (await getUserRecord(email))?.role;
}
