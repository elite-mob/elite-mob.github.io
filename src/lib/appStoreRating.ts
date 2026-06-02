export type StorePlatform = 'ios' | 'android';

export type AppRating = {
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

export function isStoreLink(url: string | undefined): boolean {
  return url != null && parseStoreLink(url) != null;
}

export function canFetchStoreRating(storeLink: string | undefined): boolean {
  return isStoreLink(storeLink);
}

type ItunesLookup = {
  results?: {
    trackName?: string;
    averageUserRating?: number;
    userRatingCount?: number;
    trackViewUrl?: string;
  }[];
};

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
      const app = data.results?.[0];
      if (app?.averageUserRating == null || app.userRatingCount == null) {
        reject(new Error('App Store rating unavailable'));
        return;
      }
      resolve({
        platform: 'ios',
        rating: app.averageUserRating,
        ratingCount: app.userRatingCount,
        appName: app.trackName ?? 'App Store app',
        storeUrl: app.trackViewUrl ?? `https://apps.apple.com/app/id${appId}`,
        fetchedAt: new Date().toISOString(),
      });
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

function playStorePageUrl(packageId: string): string {
  return `https://play.google.com/store/apps/details?id=${encodeURIComponent(packageId)}&hl=en&gl=us`;
}

function getPlayStoreFetchUrl(pageUrl: string): string {
  const proxyTemplate =
    import.meta.env.VITE_PLAY_STORE_CORS_PROXY?.trim() ||
    'https://api.allorigins.win/raw?url=';
  if (proxyTemplate.includes('{url}')) {
    return proxyTemplate.replace('{url}', encodeURIComponent(pageUrl));
  }
  const sep = proxyTemplate.includes('?') ? '&' : '?';
  return `${proxyTemplate}${sep}url=${encodeURIComponent(pageUrl)}&_=${Date.now()}`;
}

function parsePlayStoreHtml(html: string, packageId: string, storeUrl: string): AppRating {
  const aggregate = html.match(
    /"aggregateRating"\s*:\s*\{[^}]*"ratingValue"\s*:\s*"([\d.]+)"[^}]*"ratingCount"\s*:\s*"?([\d]+)"?/,
  );
  const rating = aggregate ? parseFloat(aggregate[1]) : NaN;
  const ratingCount = aggregate ? parseInt(aggregate[2], 10) : NaN;

  if (!Number.isFinite(rating) || !Number.isFinite(ratingCount)) {
    throw new Error('Play Store rating not found in page');
  }

  const nameMatch =
    html.match(/"name"\s*:\s*"([^"]+)"/) ??
    html.match(/itemprop="name"\s+content="([^"]+)"/) ??
    html.match(/<title>([^<]+)<\/title>/);
  const appName = nameMatch?.[1]?.replace(/\s*-\s*Apps on Google Play$/i, '').trim() ?? packageId;

  return {
    platform: 'android',
    rating,
    ratingCount,
    appName,
    storeUrl,
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchAndroidRatingClient(packageId: string): Promise<AppRating> {
  const storeUrl = playStorePageUrl(packageId);
  const res = await fetch(getPlayStoreFetchUrl(storeUrl), { cache: 'no-store' });
  if (!res.ok) throw new Error(`Play Store fetch failed (${res.status})`);
  const html = await res.text();
  return parsePlayStoreHtml(html, packageId, storeUrl);
}

/** Fresh rating from the store on every call — static-site friendly, no backend required. */
export async function fetchAppRating(storeLink: string): Promise<AppRating> {
  const parsed = parseStoreLink(storeLink.trim());
  if (!parsed) throw new Error('Not an App Store or Play Store URL');

  if (parsed.platform === 'ios') {
    return fetchIosRatingJsonp(parsed.storeId);
  }
  return fetchAndroidRatingClient(parsed.storeId);
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
