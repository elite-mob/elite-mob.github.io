import { useEffect, useState } from 'react';
import { fetchAppRatings, type AppRating } from '@/lib/appStoreRating';

type UseAppRatingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: AppRating[] }
  | { status: 'error' };

/**
 * Fetches live App Store / Play Store ratings when enabled.
 * Set `enabled` false until a card scrolls into view to avoid flooding proxies.
 */
export function useAppRating(storeLinks: string[] | undefined, enabled = true) {
  const [state, setState] = useState<UseAppRatingState>({ status: 'idle' });
  const linksKey = storeLinks?.join('\0') ?? '';

  useEffect(() => {
    if (!storeLinks?.length || !enabled) {
      setState({ status: 'idle' });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    void fetchAppRatings(storeLinks)
      .then((data) => {
        if (cancelled) return;
        if (data.length === 0) setState({ status: 'error' });
        else setState({ status: 'success', data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- storeLinks content is encoded in linksKey
  }, [linksKey, enabled]);

  return state;
}
