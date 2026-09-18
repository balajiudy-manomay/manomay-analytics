export interface ReportDefinition {
  key: string;
  label: string;
  embedUrl: string;
}

function getReportUrl(urlEnvVar: string, legacyIdEnvVar: string): string {
  const envVal = process.env[urlEnvVar] || process.env[legacyIdEnvVar] || '';
  if (!envVal) return '';
  if (envVal.startsWith('http://') || envVal.startsWith('https://')) {
    return envVal;
  }
  return `https://app.powerbi.com/reportEmbed?reportId=${envVal}&autoAuth=true`;
}

function report(key: string, label: string, urlEnvVar: string, legacyIdEnvVar: string): ReportDefinition {
  return {
    key,
    label,
    embedUrl: getReportUrl(urlEnvVar, legacyIdEnvVar),
  };
}

export const REPORTS: ReportDefinition[] = [
  report(
    'resource-utilization',
    'Resource Utilization',
    'PBI_REPORT_URL_RESOURCE_UTILIZATION',
    'PBI_REPORT_ID_RESOURCE_UTILIZATION',
  ),
  report(
    'resource-utilization-without-cost',
    'Resource Utilization (Without Cost)',
    'PBI_REPORT_URL_RESOURCE_UTILIZATION_WITHOUT_COST',
    'PBI_REPORT_ID_RESOURCE_UTILIZATION_WITHOUT_COST',
  ),
  report(
    'revenue-tracking',
    'Revenue & Target Tracking',
    'PBI_REPORT_URL_REVENUE_TRACKING',
    'PBI_REPORT_ID_REVENUE_TRACKING',
  ),
  report(
    'timesheets-tracking',
    'Timesheets & Invoice Tracking',
    'PBI_REPORT_URL_TIMESHEETS_TRACKING',
    'PBI_REPORT_ID_TIMESHEETS_TRACKING',
  ),
  report(
    'contracts-tracking',
    'Contracts & Agreements Tracking',
    'PBI_REPORT_URL_CONTRACTS_TRACKING',
    'PBI_REPORT_ID_CONTRACTS_TRACKING',
  ),
  report('status-updates', 'Status Updates', 'PBI_REPORT_URL_STATUS_UPDATES', 'PBI_REPORT_ID_STATUS_UPDATES'),
  report(
    'project-budget-tracking',
    'Project Budget Tracking',
    'PBI_REPORT_URL_PROJECT_BUDGET_TRACKING',
    'PBI_REPORT_ID_PROJECT_BUDGET_TRACKING',
  ),
];

export function getReportByKey(key: string): ReportDefinition | undefined {
  return REPORTS.find((r) => r.key === key);
}
