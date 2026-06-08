import { useEffect, useState } from 'react';
import type { AppRating } from '@/lib/appStoreRating';
import { getCachedRatings, prefetchAppRatings, ratingCacheKey } from '@/lib/ratingCache';

type UseAppRatingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: AppRating[] }
  | { status: 'error' };

type UseAppRatingOptions = {
  /** Show rating UI and wait for data if still loading. */
  enabled?: boolean;
  /** Fetch in the background before `enabled` (scroll-ahead). */
  prefetch?: boolean;
};

function initialState(storeLinks: string[] | undefined, enabled: boolean): UseAppRatingState {
  if (!storeLinks?.length || !enabled) return { status: 'idle' };
  const cached = getCachedRatings(storeLinks);
  if (cached?.status === 'success') return { status: 'success', data: cached.data };
  if (cached?.status === 'error') return { status: 'error' };
  return { status: 'loading' };
}

/**
 * Fetches live App Store / Play Store ratings with scroll-ahead prefetch + cache.
 */
export function useAppRating(
  storeLinks: string[] | undefined,
  options: boolean | UseAppRatingOptions = true,
) {
  const resolved =
    typeof options === 'boolean' ? { enabled: options, prefetch: options } : options;
  const enabled = resolved.enabled ?? true;
  const prefetch = resolved.prefetch ?? enabled;

  const linksKey = storeLinks?.join('\0') ?? '';

  const [state, setState] = useState<UseAppRatingState>(() =>
    initialState(storeLinks, enabled),
  );

  useEffect(() => {
    if (!storeLinks?.length) {
      setState({ status: 'idle' });
      return;
    }

    const cached = getCachedRatings(storeLinks);
    if (cached?.status === 'success') {
      setState({ status: 'success', data: cached.data });
      return;
    }
    if (cached?.status === 'error') {
      setState({ status: 'error' });
      return;
    }

    if (!prefetch && !enabled) {
      setState({ status: 'idle' });
      return;
    }

    if (enabled) {
      setState((prev) => (prev.status === 'success' ? prev : { status: 'loading' }));
    }

    let cancelled = false;

    void prefetchAppRatings(storeLinks).then((result) => {
      if (cancelled) return;
      if (result.status === 'success') {
        setState({ status: 'success', data: result.data });
      } else if (enabled) {
        setState({ status: 'error' });
      } else {
        setState({ status: 'idle' });
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- storeLinks content is encoded in linksKey
  }, [linksKey, enabled, prefetch]);

  return state;
}

export { ratingCacheKey };
