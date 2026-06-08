import { useEffect, useState } from 'react';

/** Viewport at or below `breakpoint` (default: md / 767px). */
export function useIsMobile(breakpointPx = 767): boolean {
  const query = `(max-width: ${breakpointPx}px)`;

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return isMobile;
}
