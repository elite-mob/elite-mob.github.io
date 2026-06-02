import { useEffect, useState } from 'react';
import { fetchAppRating, type AppRating } from '@/lib/appStoreRating';

type UseAppRatingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: AppRating }
  | { status: 'error' };

/**
 * Fetches live App Store / Play Store ratings when enabled.
 * Set `enabled` false until a card scrolls into view to avoid flooding the API.
 */
export function useAppRating(storeLink: string | undefined, enabled = true) {
  const [state, setState] = useState<UseAppRatingState>({ status: 'idle' });

  useEffect(() => {
    if (!storeLink || !enabled) {
      setState({ status: 'idle' });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    void fetchAppRating(storeLink)
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });

    return () => {
      cancelled = true;
    };
  }, [storeLink, enabled]);

  return state;
}
