import { fetchSharedWorkbookBuffer } from './graphFile';
import { parseWorkbook, type WorkbookData } from './parseWorkbook';

const TTL_MS = Number(process.env.SHAREPOINT_CACHE_TTL_SECONDS || 1800) * 1000;

let cache: { data: WorkbookData; fetchedAt: number } | null = null;
let inFlight: Promise<WorkbookData> | null = null;

async function loadFresh(): Promise<WorkbookData> {
  const buffer = await fetchSharedWorkbookBuffer();
  return parseWorkbook(buffer);
}

// Returns the parsed access-control workbook, refreshing it from SharePoint
// at most once every SHAREPOINT_CACHE_TTL_SECONDS (default 30 minutes). If a
// refresh fails but a previous copy is cached, the stale copy is served
// rather than breaking login/report access for everyone.
export async function getWorkbookData(): Promise<WorkbookData> {
  if (cache && Date.now() - cache.fetchedAt < TTL_MS) {
    return cache.data;
  }

  if (!inFlight) {
    inFlight = loadFresh()
      .then((data) => {
        cache = { data, fetchedAt: Date.now() };
        return data;
      })
      .catch((err) => {
        if (cache) {
          console.error('SharePoint workbook refresh failed, serving stale cache:', err);
          return cache.data;
        }
        throw err;
      })
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
}
