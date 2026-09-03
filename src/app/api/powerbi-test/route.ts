import { NextResponse } from 'next/server';
import { getAadToken } from '@/lib/powerbi/aad';

// Temporary diagnostic route for verifying the Power BI service principal's
// setup during initial configuration — not gated behind login, not linked
// from the app. Safe to delete once the real dashboard is confirmed working.
// Hit it directly: GET /api/powerbi-test

interface WorkspaceSummary {
  id: string;
  name: string;
}

interface ReportSummary {
  id: string;
  name: string;
  datasetId: string;
  embedUrl: string;
}

export async function GET() {
  const workspaceId = process.env.PBI_WORKSPACE_ID || '';

  try {
    const accessToken = await getAadToken();

    const workspacesRes = await fetch('https://api.powerbi.com/v1.0/myorg/groups?$top=100', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!workspacesRes.ok) {
      throw new Error(`Failed to list workspaces (${workspacesRes.status}): ${await workspacesRes.text()}`);
    }
    const workspacesData = (await workspacesRes.json()) as { value: WorkspaceSummary[] };
    const workspaces = workspacesData.value;
    const targetWorkspace = workspaces.find((w) => w.id === workspaceId) ?? null;

    let reports: ReportSummary[] = [];
    let reportsError: string | null = null;

    if (workspaceId) {
      const reportsRes = await fetch(`https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (reportsRes.ok) {
        const reportsData = (await reportsRes.json()) as { value: ReportSummary[] };
        reports = reportsData.value;
      } else {
        reportsError = `${reportsRes.status}: ${await reportsRes.text()}`;
      }
    }

    return NextResponse.json({
      success: true,
      servicePrincipal: {
        canSeeWorkspaceCount: workspaces.length,
        workspaces: workspaces.map((w) => ({ id: w.id, name: w.name })),
      },
      targetWorkspace: {
        id: workspaceId || null,
        found: Boolean(targetWorkspace),
        name: targetWorkspace?.name ?? null,
      },
      reports: {
        count: reports.length,
        items: reports.map((r) => ({ id: r.id, name: r.name, datasetId: r.datasetId, embedUrl: r.embedUrl })),
        error: reportsError,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
