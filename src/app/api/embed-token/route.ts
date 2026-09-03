import { NextRequest, NextResponse } from 'next/server';
import { getSessionEmail } from '@/lib/auth/session';
import { getReportKeysForEmail } from '@/lib/auth/access';
import { getReportByKey, REPORTS } from '@/lib/powerbi/config';
import { getReportEmbedInfo } from '@/lib/powerbi/embedToken';

export async function GET(req: NextRequest) {
  const email = await getSessionEmail();
  const reportId = req.nextUrl.searchParams.get('reportId');
  console.log(`[pbi] GET /api/embed-token email=${email ?? '(none)'} reportId=${reportId ?? '(list)'}`);

  if (!email) {
    console.warn('[pbi] Rejected: no session cookie.');
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const allowedKeys = getReportKeysForEmail(email);
  console.log(`[pbi] email=${email} allowedKeys=${JSON.stringify(allowedKeys)}`);

  // List mode: return the reports this user's role can see.
  if (!reportId) {
    const reports = REPORTS.filter((r) => allowedKeys.includes(r.key)).map((r) => ({
      key: r.key,
      label: r.label,
    }));
    return NextResponse.json({ reports });
  }

  // Single-report mode: mint an embed token, if the role allows it.
  if (!allowedKeys.includes(reportId)) {
    console.warn(`[pbi] Rejected: email=${email} has no access to reportId=${reportId}`);
    return NextResponse.json({ error: 'You do not have access to this report.' }, { status: 403 });
  }

  const report = getReportByKey(reportId);
  if (!report || !report.reportId || !report.groupId) {
    console.error(
      `[pbi] Rejected: reportId=${reportId} resolved to`,
      report ? { reportId: report.reportId, groupId: report.groupId } : undefined,
      '— missing PBI_REPORT_ID_* or PBI_WORKSPACE_ID env var.',
    );
    return NextResponse.json({ error: 'This report is not configured yet.' }, { status: 500 });
  }

  try {
    const embedInfo = await getReportEmbedInfo(report);
    console.log(`[pbi] Success: minted embed token for reportId=${reportId}`);
    return NextResponse.json({
      reportId: report.reportId,
      embedUrl: embedInfo.embedUrl,
      token: embedInfo.token,
      expiration: embedInfo.expiration,
    });
  } catch (err) {
    console.error(`[pbi] Failed to generate embed token for reportId=${reportId}:`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to generate embed token.' },
      { status: 500 },
    );
  }
}
