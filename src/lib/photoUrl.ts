const IMG_BB_PROXY_HOST = 'https://wsrv.nl';

export function normalizePhotoUrl(url: string): string {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'i.ibb.co') {
      return `${IMG_BB_PROXY_HOST}/?url=${encodeURIComponent(url)}`;
    }
    return url;
  } catch {
    return url;
  }
}
