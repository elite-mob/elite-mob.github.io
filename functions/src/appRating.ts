import gplay from 'google-play-scraper';

export type StorePlatform = 'ios' | 'android';

export type AppRatingResult = {
  platform: StorePlatform;
  rating: number;
  ratingCount: number;
  appName: string;
  storeUrl: string;
  fetchedAt: string;
};

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

type ItunesLookup = {
  results?: {
    trackName?: string;
    averageUserRating?: number;
    userRatingCount?: number;
    trackViewUrl?: string;
  }[];
};

export async function fetchIosRating(appId: string): Promise<AppRatingResult> {
  const country = process.env.APP_STORE_COUNTRY?.trim() || 'us';
  const res = await fetch(
    `https://itunes.apple.com/lookup?id=${encodeURIComponent(appId)}&country=${country}`,
    { headers: { 'User-Agent': 'elite-mob-portfolio-ratings/1.0' } },
  );
  if (!res.ok) throw new Error(`iTunes lookup HTTP ${res.status}`);
  const data = (await res.json()) as ItunesLookup;
  const app = data.results?.[0];
  if (app?.averageUserRating == null || app.userRatingCount == null) {
    throw new Error('Rating not available for this App Store listing');
  }
  return {
    platform: 'ios',
    rating: app.averageUserRating,
    ratingCount: app.userRatingCount,
    appName: app.trackName ?? 'App Store app',
    storeUrl: app.trackViewUrl ?? `https://apps.apple.com/app/id${appId}`,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchAndroidRating(packageId: string): Promise<AppRatingResult> {
  const app = await gplay.app({
    appId: packageId,
    lang: process.env.PLAY_STORE_LANG?.trim() || 'en',
    country: process.env.PLAY_STORE_COUNTRY?.trim() || 'us',
  });
  if (app.score == null || app.ratings == null) {
    throw new Error('Rating not available for this Play Store listing');
  }
  return {
    platform: 'android',
    rating: app.score,
    ratingCount: app.ratings,
    appName: app.title ?? packageId,
    storeUrl: app.url ?? `https://play.google.com/store/apps/details?id=${packageId}`,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchStoreRating(link: string): Promise<AppRatingResult> {
  const parsed = parseStoreLink(link);
  if (!parsed) throw new Error('Not an App Store or Play Store URL');
  if (parsed.platform === 'ios') return fetchIosRating(parsed.storeId);
  return fetchAndroidRating(parsed.storeId);
}
