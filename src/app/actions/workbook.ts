'use server';

import { updateTag } from 'next/cache';
import { WORKBOOK_CACHE_TAG, getWorkbookData } from '@/lib/sharepoint/store';

export async function refreshWorkbookCache() {
  updateTag(WORKBOOK_CACHE_TAG);
  const data = await getWorkbookData();
  return {
    ok: true,
    userCount: data.users.size,
    rolesCount: Object.keys(data.roleReports).length,
    refreshedAt: new Date().toISOString(),
  };
}
