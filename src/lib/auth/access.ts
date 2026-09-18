import { getRoleForEmail } from './users';
import { getWorkbookData } from '../sharepoint/store';
import type { ReportDefinition } from '../sharepoint/parseWorkbook';

// Returns exactly the reports the given user's role is allowed to see, each
// carrying its own label and embed URL as read from that role's own sheet in
// the SharePoint workbook - the sole source of truth for report access.
export async function getReportsForEmail(email: string): Promise<ReportDefinition[]> {
  const role = await getRoleForEmail(email);
  if (!role) return [];

  const data = await getWorkbookData();
  return data.roleReports[role] || [];
}
