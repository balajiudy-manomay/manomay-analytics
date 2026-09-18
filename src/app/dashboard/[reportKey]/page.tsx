import { redirect } from 'next/navigation';
import { getSessionEmail } from '@/lib/auth/session';
import { getReportKeysForEmail } from '@/lib/auth/access';
import { getReportByKey } from '@/lib/powerbi/config';
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

  const allowedKeys = getReportKeysForEmail(email);
  const report = getReportByKey(reportKey);

  if (!report || !allowedKeys.includes(reportKey)) {
    redirect('/unauthorized');
  }

  return <ReportViewer reportKey={report.key} label={report.label} embedUrl={report.embedUrl} />;
}
