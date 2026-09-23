import type { WorkbookData } from './parseWorkbook';

export function validateWorkbook(data: WorkbookData): boolean {
  if (!data || !data.users || data.users.size === 0) {
    throw new Error("Workbook validation failed: 'Users' sheet contains no valid user records.");
  }

  if (!data.roleReports || Object.keys(data.roleReports).length === 0) {
    throw new Error('Workbook validation failed: No role report mappings were found in the workbook.');
  }

  return true;
}
