import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Announces route changes to assistive tech (SPA has no full page reload).
 * Waits for react-helmet to update document.title.
 */
export function RouteAnnouncer() {
  const location = useLocation();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const t = window.setTimeout(() => {
      const title = document.title?.trim() || 'Page loaded';
      setMessage(`Navigated to ${title}`);
    }, 120);
    return () => window.clearTimeout(t);
  }, [location.pathname, location.search, location.hash]);

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
