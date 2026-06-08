import { fetchAppRatings, type AppRating } from '@/lib/appStoreRating';

type CachedRatings = { status: 'success'; data: AppRating[] } | { status: 'error' };

const cache = new Map<string, CachedRatings>();
const inflight = new Map<string, Promise<CachedRatings>>();

export function ratingCacheKey(storeLinks: string[]): string {
  return storeLinks.map((l) => l.trim()).join('\0');
}

export function getCachedRatings(storeLinks: string[]): CachedRatings | undefined {
  if (storeLinks.length === 0) return undefined;
  return cache.get(ratingCacheKey(storeLinks));
}

export function prefetchAppRatings(storeLinks: string[]): Promise<CachedRatings> {
  const key = ratingCacheKey(storeLinks);
  if (storeLinks.length === 0) {
    return Promise.resolve({ status: 'error' });
  }

  const cached = cache.get(key);
  if (cached) return Promise.resolve(cached);

  const pending = inflight.get(key);
  if (pending) return pending;

  const request = fetchAppRatings(storeLinks)
    .then((data): CachedRatings => {
      const result: CachedRatings =
        data.length > 0 ? { status: 'success', data } : { status: 'error' };
      cache.set(key, result);
      inflight.delete(key);
      return result;
    })
    .catch((): CachedRatings => {
      const result = { status: 'error' } as const;
      cache.set(key, result);
      inflight.delete(key);
      return result;
    });

  inflight.set(key, request);
  return request;
}
