import androidStoreRatings from '@/data/androidStoreRatings.json';

export type StorePlatform = 'ios' | 'android';

export type AppRating = {
  platform: StorePlatform;
  rating: number;
  ratingCount: number;
  appName: string;
  storeUrl: string;
  fetchedAt: string;
};

type AndroidRatingEntry = Omit<AppRating, 'platform'>;

const androidRatingsByPackage = androidStoreRatings as Record<string, AndroidRatingEntry>;

export function parseStoreLink(url: string): { platform: StorePlatform; storeId: string } | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('apps.apple.com') || host.includes('itunes.apple.com')) {
      const idMatch = parsed.pathname.match(/\/id(\d+)/);
      if (idMatch?.[1]) return { platform: 'ios', storeId: idMatch[1] };
    }

    if (host.includes('play.google.com')) {
      const pkg = parsed.searchParams.get('id');
      if (pkg) return { platform: 'android', storeId: pkg };
    }
  } catch {
    return null;
  }
  return null;
}

export function isStoreLink(url: string | undefined): boolean {
  return url != null && parseStoreLink(url) != null;
}

export function canFetchStoreRating(storeLink: string | undefined): boolean {
  return isStoreLink(storeLink);
}

/** All App Store / Play Store URLs for a portfolio project. */
export function getStoreLinksForProject(project: {
  link?: string;
  androidLink?: string;
}): string[] {
  const links: string[] = [];
  if (project.link && isStoreLink(project.link)) links.push(project.link.trim());
  const android = project.androidLink?.trim();
  if (android && isStoreLink(android) && !links.includes(android)) links.push(android);
  return links;
}

export function projectHasStoreRating(project: { link?: string; androidLink?: string }): boolean {
  return getStoreLinksForProject(project).length > 0;
}

type ItunesLookup = {
  results?: {
    trackName?: string;
    averageUserRating?: number;
    averageUserRatingForCurrentVersion?: number;
    userRatingCount?: number;
    userRatingCountForCurrentVersion?: number;
    trackViewUrl?: string;
  }[];
};

function parseItunesLookupJson(data: ItunesLookup, appId: string): AppRating {
  const app = data.results?.[0];
  const rating = app?.averageUserRating ?? app?.averageUserRatingForCurrentVersion;
  const ratingCount = app?.userRatingCount ?? app?.userRatingCountForCurrentVersion;
  if (rating == null || ratingCount == null || ratingCount <= 0) {
    throw new Error('App Store rating unavailable');
  }
  return {
    platform: 'ios',
    rating,
    ratingCount,
    appName: app.trackName ?? 'App Store app',
    storeUrl: app.trackViewUrl ?? `https://apps.apple.com/app/id${appId}`,
    fetchedAt: new Date().toISOString(),
  };
}

function fetchIosRatingJsonp(appId: string): Promise<AppRating> {
  return new Promise((resolve, reject) => {
    const callback = `__itunes_cb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const timeoutMs = 15_000;
    let script: HTMLScriptElement | null = null;

    const cleanup = () => {
      window.clearTimeout(timer);
      delete (window as Record<string, unknown>)[callback];
      script?.remove();
    };

    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error('App Store lookup timed out'));
    }, timeoutMs);

    (window as Record<string, unknown>)[callback] = (data: ItunesLookup) => {
      cleanup();
      try {
        resolve(parseItunesLookupJson(data, appId));
      } catch (err) {
        reject(err instanceof Error ? err : new Error('App Store rating unavailable'));
      }
    };

    script = document.createElement('script');
    script.src = `https://itunes.apple.com/lookup?id=${encodeURIComponent(appId)}&country=us&callback=${callback}&_=${Date.now()}`;
    script.onerror = () => {
      cleanup();
      reject(new Error('App Store lookup failed'));
    };
    document.head.appendChild(script);
  });
}

/** Android ratings from build-time manifest (src/data/androidStoreRatings.json). */
function fetchAndroidRating(packageId: string): AppRating {
  const entry = androidRatingsByPackage[packageId];
  if (!entry || !hasDisplayableRating(entry.rating, entry.ratingCount)) {
    throw new Error(`Google Play rating not available for ${packageId}`);
  }
  return { platform: 'android', ...entry };
}

/** App Store: live JSONP. Google Play: build-time manifest from google-play-scraper. */
export async function fetchAppRating(storeLink: string): Promise<AppRating> {
  const parsed = parseStoreLink(storeLink.trim());
  if (!parsed) throw new Error('Not an App Store or Play Store URL');

  if (parsed.platform === 'ios') {
    return fetchIosRatingJsonp(parsed.storeId);
  }
  return fetchAndroidRating(parsed.storeId);
}

/** Fetch ratings for every store link; skips failures (e.g. one platform blocked). */
export async function fetchAppRatings(storeLinks: string[]): Promise<AppRating[]> {
  const unique = [...new Set(storeLinks.map((l) => l.trim()).filter(isStoreLink))];
  if (unique.length === 0) return [];

  const results = await Promise.all(
    unique.map((link) => fetchAppRating(link).catch(() => null)),
  );
  const ratings = results.filter(
    (r): r is AppRating => r != null && hasDisplayableRating(r.rating, r.ratingCount),
  );
  return sortRatingsByPlatform(ratings);
}

/** iOS first, then Android — stable order when both stores are linked. */
export function sortRatingsByPlatform(ratings: AppRating[]): AppRating[] {
  const order: Record<StorePlatform, number> = { ios: 0, android: 1 };
  return [...ratings].sort((a, b) => order[a.platform] - order[b.platform]);
}

export function formatRatingCount(count: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
    count,
  );
}

export function storePlatformLabel(platform: StorePlatform): string {
  return platform === 'ios' ? 'App Store' : 'Google Play';
}

/** Hide UI when the store returns no meaningful rating data. */
export function hasDisplayableRating(rating: number, ratingCount: number): boolean {
  return rating > 0 && ratingCount > 0;
}

export function formatRatingCountFull(count: number): string {
  return new Intl.NumberFormat('en-US').format(count);
}
