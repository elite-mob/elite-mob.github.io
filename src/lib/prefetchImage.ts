const prefetched = new Set<string>();
const inflight = new Map<string, Promise<void>>();

export function prefetchImage(src: string): Promise<void> {
  const url = src?.trim();
  if (!url || url === '/placeholder.svg') return Promise.resolve();
  if (prefetched.has(url)) return Promise.resolve();

  const pending = inflight.get(url);
  if (pending) return pending;

  const request = new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    const finish = () => {
      prefetched.add(url);
      inflight.delete(url);
      resolve();
    };
    img.onload = finish;
    img.onerror = finish;
    img.src = url;
    if (img.complete && img.naturalWidth > 0) {
      finish();
    }
  });

  inflight.set(url, request);
  return request;
}

export function prefetchImages(srcs: string[], limit = 2): Promise<void[]> {
  const unique = [...new Set(srcs.filter(Boolean))].slice(0, Math.max(0, limit));
  return Promise.all(unique.map((src) => prefetchImage(src)));
}

export function isImagePrefetched(src: string): boolean {
  return prefetched.has(src.trim());
}

/** Prefetch low-res variants first, then high-res (progressive gallery loading). */
export async function prefetchSlideProgressive(
  lowResSrcs: string[],
  highResSrcs: string[],
  limit = 2,
): Promise<void> {
  const lows = [...new Set(lowResSrcs.filter(Boolean))].slice(0, limit);
  await Promise.all(lows.map((src) => prefetchImage(src)));

  const highs = [...new Set(highResSrcs.filter(Boolean))].slice(0, limit);
  await Promise.all(highs.map((src) => prefetchImage(src)));
}
