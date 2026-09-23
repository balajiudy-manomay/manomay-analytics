import { NextResponse } from 'next/server';
import { updateTag } from 'next/cache';
import { WORKBOOK_CACHE_TAG, refreshWorkbookData } from '@/lib/sharepoint/store';

export async function POST() {
  try {
    updateTag(WORKBOOK_CACHE_TAG);
    const data = await refreshWorkbookData();
    return NextResponse.json({
      ok: true,
      message: 'Excel workbook cache revalidated successfully.',
      userCount: data.users.size,
      rolesCount: Object.keys(data.roleReports).length,
      refreshedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Failed to revalidate Excel cache:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to refresh workbook data from SharePoint.' },
      { status: 503 }
    );
  }
}
