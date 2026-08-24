import App from './App';

export interface ScreenData {
  id: string;
  name: string;
  envKey: string;
  url: string;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ screen?: string }>;
}) {
  const params = await searchParams;

  const screens: ScreenData[] = [
    {
      id: 'resource-utilization',
      name: 'Resource Utilization',
      envKey: 'POWERBI_URL_RESOURCE_UTILIZATION',
      url:
        process.env.POWERBI_URL_RESOURCE_UTILIZATION ||
        process.env.NEXT_PUBLIC_POWERBI_URL_RESOURCE_UTILIZATION ||
        process.env.POWERBI_URL ||
        '',
    },
    {
      id: 'revenue-tracking',
      name: 'Revenue & Target Tracking',
      envKey: 'POWERBI_URL_REVENUE_TRACKING',
      url:
        process.env.POWERBI_URL_REVENUE_TRACKING ||
        process.env.NEXT_PUBLIC_POWERBI_URL_REVENUE_TRACKING ||
        '',
    },
    {
      id: 'timesheets-tracking',
      name: 'Timesheets & Invoice Tracking',
      envKey: 'POWERBI_URL_TIMESHEETS_TRACKING',
      url:
        process.env.POWERBI_URL_TIMESHEETS_TRACKING ||
        process.env.NEXT_PUBLIC_POWERBI_URL_TIMESHEETS_TRACKING ||
        '',
    },
    {
      id: 'contracts-tracking',
      name: 'Contracts & Agreements Tracking',
      envKey: 'POWERBI_URL_CONTRACTS_TRACKING',
      url:
        process.env.POWERBI_URL_CONTRACTS_TRACKING ||
        process.env.NEXT_PUBLIC_POWERBI_URL_CONTRACTS_TRACKING ||
        '',
    },
    {
      id: 'status-updates',
      name: 'Status Updates',
      envKey: 'POWERBI_URL_STATUS_UPDATES',
      url:
        process.env.POWERBI_URL_STATUS_UPDATES ||
        process.env.NEXT_PUBLIC_POWERBI_URL_STATUS_UPDATES ||
        '',
    },
  ];

  const initialScreenId = params.screen || screens[0].id;

  return (
    <App
      screens={screens}
      initialScreenId={initialScreenId}
    />
  );
}
