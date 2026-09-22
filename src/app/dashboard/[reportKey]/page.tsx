import { redirect } from 'next/navigation';
import { getSessionEmail } from '@/lib/auth/session';
import { getReportsForEmail } from '@/lib/auth/access';
import { ReportViewer } from '@/components/ReportViewer';

export default async function ReportPage({
  params,
}: {
  params: Promise<{ reportKey: string }>;
}) {
  const { reportKey } = await params;
  const email = await getSessionEmail();
  if (!email) {
    redirect('/login');
  }

  const reports = await getReportsForEmail(email);
  const report = reports.find((r) => r.key === reportKey);

  if (!report) {
    redirect('/unauthorized');
  }

  return <ReportViewer reportKey={report.key} label={report.label} embedUrl={report.embedUrl} />;
}
