import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionEmail } from '@/lib/auth/session';
import { getReportKeysForEmail } from '@/lib/auth/access';
import { REPORTS } from '@/lib/powerbi/config';

export default async function DashboardPage() {
  const email = await getSessionEmail();
  if (!email) {
    redirect('/login');
  }

  const allowedKeys = getReportKeysForEmail(email);
  const reports = REPORTS.filter((r) => allowedKeys.includes(r.key));

  if (reports.length === 0) {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] w-full bg-slate-50 dark:bg-slate-950 px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboards</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Select a report to view</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <Link
              key={report.key}
              href={`/dashboard/${report.key}`}
              className="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-400/60 rounded-xl p-5 shadow-sm transition-colors"
            >
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{report.label}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Open report</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
