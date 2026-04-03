import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  logPageView,
  logTimeOnPage,
  logHomeSectionView,
} from '@/integrations/firebase/analytics';

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Home';
  if (pathname.startsWith('/project/')) return 'Project';
  if (pathname === '/privacy') return 'Privacy';
  if (pathname === '/404' || pathname.includes('not-found')) return 'Not Found';
  return 'Page';
}

/**
 * Tracks SPA route changes: page_view, time on previous route, and home hash sections.
 */
export function AnalyticsRouteTracker() {
  const location = useLocation();
  const prevPathRef = useRef<string | null>(null);
  const enterTimeRef = useRef<number>(Date.now());

  // Normalize path for analytics (include search for filtered portfolio)
  const pathKey = `${location.pathname}${location.search}`;

  useEffect(() => {
    const now = Date.now();
    const prev = prevPathRef.current;

    if (prev !== null && prev !== pathKey) {
      const duration = now - enterTimeRef.current;
      void logTimeOnPage({ page_path: prev, duration_ms: duration });
    }

    prevPathRef.current = pathKey;
    enterTimeRef.current = now;

    const title = getPageTitle(location.pathname);
    void logPageView({
      page_path: pathKey,
      page_title: title,
      page_location: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }, [pathKey, location.pathname]);

  // Home: track which section users scroll to via hash (#portfolio, #about, …)
  useEffect(() => {
    if (location.pathname !== '/') return;

    const reportHash = () => {
      const hash = window.location.hash.replace(/^#/, '') || 'home';
      void logHomeSectionView({ section: hash });
    };

    reportHash();
    window.addEventListener('hashchange', reportHash);
    return () => window.removeEventListener('hashchange', reportHash);
  }, [location.pathname]);

  return null;
}
