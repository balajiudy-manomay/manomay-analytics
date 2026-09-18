import { getGraphToken } from './graphAuth';

// Encodes a SharePoint/OneDrive "Copy link" URL into the sharing-token format
// Graph's /shares endpoint expects. See:
// https://learn.microsoft.com/graph/api/shares-get
function encodeShareUrl(url: string): string {
  const base64 = Buffer.from(url, 'utf-8').toString('base64');
  const base64url = base64.replace(/=+$/, '').replace(/\//g, '_').replace(/\+/g, '-');
  return `u!${base64url}`;
}

export async function fetchSharedWorkbookBuffer(): Promise<Buffer> {
  const shareUrl = process.env.SHAREPOINT_FILE_URL;
  if (!shareUrl) {
    throw new Error('Missing SHAREPOINT_FILE_URL.');
  }

  const token = await getGraphToken();
  const shareId = encodeShareUrl(shareUrl);

  const res = await fetch(`https://graph.microsoft.com/v1.0/shares/${shareId}/driveItem/content`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to download SharePoint workbook (${res.status}): ${await res.text()}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
