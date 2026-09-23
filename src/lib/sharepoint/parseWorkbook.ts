import ExcelJS from 'exceljs';

export interface UserRecord {
  email: string;
  password: string;
  role: string;
}

export interface ReportDefinition {
  key: string;
  label: string;
  embedUrl: string;
}

export interface WorkbookData {
  users: Map<string, UserRecord>;
  roleReports: Record<string, ReportDefinition[]>;
}

const NON_ROLE_SHEETS = new Set(['readme', 'users', 'report access matrix']);

function cellText(row: ExcelJS.Row, col: number): string {
  const value = row.getCell(col).value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'object' && 'text' in value) return String((value as { text: unknown }).text ?? '');
  if (typeof value === 'object' && 'result' in value) return String((value as { result: unknown }).result ?? '');
  return String(value).trim();
}

// Parses the access-control workbook: a 'Users' sheet (Email, Password, Role)
// plus either a single 'Report Access Matrix' sheet (Report Key, Report List, Embed URL, [Roles...])
// or legacy individual role sheets. See the workbook's own 'ReadMe' sheet for full spec.
export async function parseWorkbook(buffer: Buffer): Promise<WorkbookData> {
  const workbook = new ExcelJS.Workbook();
  // exceljs's bundled Buffer type can mismatch @types/node's across versions;
  // the runtime shape is identical, so this cast is safe.
  await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);

  const usersSheet = workbook.getWorksheet('Users');
  if (!usersSheet) {
    throw new Error("Workbook is missing a 'Users' sheet.");
  }

  const users = new Map<string, UserRecord>();
  usersSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const email = cellText(row, 1).toLowerCase();
    const password = cellText(row, 2);
    const role = cellText(row, 3).toLowerCase();
    if (!email || !password || !role) return;
    users.set(email, { email, password, role });
  });

  const roleReports: Record<string, ReportDefinition[]> = {};

  const matrixSheet = workbook.worksheets.find(
    (sheet) => sheet.name.trim().toLowerCase() === 'report access matrix'
  );

  if (matrixSheet) {
    const headerRow = matrixSheet.getRow(1);
    const roleColumns: { colIndex: number; role: string }[] = [];

    headerRow.eachCell((cell, colNumber) => {
      if (colNumber >= 4) {
        const rawText = cellText(headerRow, colNumber);
        const role = rawText.replace(/[\r\n]+/g, '').trim().toLowerCase();
        if (role) {
          roleColumns.push({ colIndex: colNumber, role });
          if (!roleReports[role]) {
            roleReports[role] = [];
          }
        }
      }
    });

    matrixSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const key = cellText(row, 1);
      const label = cellText(row, 2);
      const embedUrl = cellText(row, 3);
      if (!key || !embedUrl) return;

      const reportDef: ReportDefinition = { key, label: label || key, embedUrl };

      for (const { colIndex, role } of roleColumns) {
        const accessVal = cellText(row, colIndex).toUpperCase();
        if (accessVal === 'X') {
          roleReports[role].push(reportDef);
        }
      }
    });
  } else {
    for (const sheet of workbook.worksheets) {
      const sheetName = sheet.name.trim();
      if (NON_ROLE_SHEETS.has(sheetName.toLowerCase())) continue;

      const role = sheetName.toLowerCase();
      const reports: ReportDefinition[] = [];
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const key = cellText(row, 1);
        const label = cellText(row, 2);
        const embedUrl = cellText(row, 3);
        if (!key || !embedUrl) return;
        reports.push({ key, label: label || key, embedUrl });
      });
      roleReports[role] = reports;
    }
  }

  return { users, roleReports };
}
