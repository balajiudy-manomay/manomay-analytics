export interface ReportDefinition {
  key: string;
  label: string;
  reportId: string;
  groupId: string;
}

const WORKSPACE_ID = process.env.PBI_WORKSPACE_ID || '';

function report(key: string, label: string, reportIdEnvVar: string): ReportDefinition {
  return {
    key,
    label,
    reportId: process.env[reportIdEnvVar] || '',
    groupId: WORKSPACE_ID,
  };
}

export const REPORTS: ReportDefinition[] = [
  report('resource-utilization', 'Resource Utilization', 'PBI_REPORT_ID_RESOURCE_UTILIZATION'),
  report(
    'resource-utilization-without-cost',
    'Resource Utilization (Without Cost)',
    'PBI_REPORT_ID_RESOURCE_UTILIZATION_WITHOUT_COST',
  ),
  report('revenue-tracking', 'Revenue & Target Tracking', 'PBI_REPORT_ID_REVENUE_TRACKING'),
  report('timesheets-tracking', 'Timesheets & Invoice Tracking', 'PBI_REPORT_ID_TIMESHEETS_TRACKING'),
  report('contracts-tracking', 'Contracts & Agreements Tracking', 'PBI_REPORT_ID_CONTRACTS_TRACKING'),
  report('status-updates', 'Status Updates', 'PBI_REPORT_ID_STATUS_UPDATES'),
  report('project-budget-tracking', 'Project Budget Tracking', 'PBI_REPORT_ID_PROJECT_BUDGET_TRACKING'),
];

export function getReportByKey(key: string): ReportDefinition | undefined {
  return REPORTS.find((r) => r.key === key);
}

// Reports are opened directly on Power BI's own site — no iframe embedding,
// no service-principal embed token, no trial banner. Power BI's own login
// and per-user workspace access become the real security boundary.
export function getReportUrl(report: ReportDefinition): string {
  return `https://app.powerbi.com/groups/${report.groupId}/reports/${report.reportId}`;
}
