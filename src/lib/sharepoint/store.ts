import { cacheLife, cacheTag, updateTag } from 'next/cache';
import { fetchSharedWorkbookBuffer } from './graphFile';
import { parseWorkbook, type WorkbookData } from './parseWorkbook';
import { validateWorkbook } from './validateWorkbook';

export type { WorkbookData };

export const WORKBOOK_CACHE_TAG = 'sharepoint-workbook';

let lastKnownGood: WorkbookData | null = null;

async function loadAndValidateWorkbook(): Promise<WorkbookData> {
  try {
    const buffer = await fetchSharedWorkbookBuffer();
    const data = await parseWorkbook(buffer);
    validateWorkbook(data);
    lastKnownGood = data;
    return data;
  } catch (err) {
    if (lastKnownGood) {
      console.error('Failed to download/parse fresh SharePoint workbook, using last-known-good fallback:', err);
      return lastKnownGood;
    }
    throw err;
  }
}

// Single cache boundary powered by Next.js 16 Cache Components
export async function getWorkbookData(): Promise<WorkbookData> {
  'use cache: remote';
  cacheLife('sharepointWorkbook');
  cacheTag(WORKBOOK_CACHE_TAG);

  return loadAndValidateWorkbook();
}

// Expires the cache tag on demand and fetches fresh workbook data
export async function refreshWorkbookData(): Promise<WorkbookData> {
  updateTag(WORKBOOK_CACHE_TAG);
  return getWorkbookData();
}
