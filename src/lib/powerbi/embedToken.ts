import { getAadToken } from './aad';
import type { ReportDefinition } from './config';

export interface EmbedInfo {
  embedUrl: string;
  token: string;
  expiration: string;
}

// Lists the workspaces the service principal can actually see. Used only to
// diagnose a 401 on the report-metadata call: if the target workspace isn't
// in this list, the service principal was never added as a Member of it (or
// the tenant setting "Allow service principals to use Power BI APIs" is off).
async function listAccessibleWorkspaces(aadToken: string): Promise<Array<{ id: string; name: string }>> {
  const res = await fetch('https://api.powerbi.com/v1.0/myorg/groups?$top=100', {
    headers: { Authorization: `Bearer ${aadToken}` },
  });
  if (!res.ok) {
    console.error(`[pbi] Diagnostic workspace listing failed (${res.status}):`, await res.text());
    return [];
  }
  const data = (await res.json()) as { value: Array<{ id: string; name: string }> };
  return data.value;
}

export async function getReportEmbedInfo(report: ReportDefinition): Promise<EmbedInfo> {
  console.log(
    `[pbi] Requesting embed info: report="${report.key}" reportId=${report.reportId} groupId=${report.groupId}`,
  );

  const aadToken = await getAadToken();
  const base = `https://api.powerbi.com/v1.0/myorg/groups/${report.groupId}/reports/${report.reportId}`;

  const reportRes = await fetch(base, {
    headers: { Authorization: `Bearer ${aadToken}` },
  });

  if (!reportRes.ok) {
    const body = await reportRes.text();
    console.error(
      `[pbi] Report metadata call failed (${reportRes.status}) for groupId=${report.groupId} reportId=${report.reportId}:`,
      body,
    );

    const workspaces = await listAccessibleWorkspaces(aadToken);
    console.error(
      `[pbi] Service principal is a member of ${workspaces.length} workspace(s):`,
      workspaces.map((w) => `${w.name} (${w.id})`),
    );
    if (workspaces.some((w) => w.id === report.groupId)) {
      console.error(
        `[pbi] Target workspace ${report.groupId} IS visible to the service principal — the report ID is` +
          ' likely wrong (or the report was deleted/moved), or the service principal needs a higher role than' +
          ' Viewer in that workspace.',
      );
    } else {
      console.error(
        `[pbi] Target workspace ${report.groupId} is NOT in that list — the service principal has not been` +
          ' added as a Member of this workspace, or "Allow service principals to use Power BI APIs" is disabled' +
          ' in the tenant admin portal, or the workspace is not on Premium/PPU/Fabric capacity.',
      );
    }

    throw new Error(`Failed to load report metadata (${reportRes.status}): ${body}`);
  }

  const reportData = (await reportRes.json()) as { embedUrl: string };
  console.log(`[pbi] Report metadata OK: embedUrl=${reportData.embedUrl}`);

  const tokenRes = await fetch(`${base}/GenerateToken`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${aadToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessLevel: 'View' }),
  });
  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    console.error(`[pbi] GenerateToken call failed (${tokenRes.status}):`, body);
    throw new Error(`Failed to generate embed token (${tokenRes.status}): ${body}`);
  }
  const tokenData = (await tokenRes.json()) as { token: string; expiration: string };
  console.log(`[pbi] Embed token generated, expires ${tokenData.expiration}`);

  return {
    embedUrl: reportData.embedUrl,
    token: tokenData.token,
    expiration: tokenData.expiration,
  };
}
