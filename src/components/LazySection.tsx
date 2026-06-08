import { Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useNearViewport } from '@/hooks/use-near-viewport';
import { cn } from '@/lib/utils';

type LazySectionProps = {
  children: ReactNode;
  /** Reserve space before the section mounts (reduces layout shift). */
  minHeight?: string;
  /** When to start loading content. */
  rootMargin?: string;
  className?: string;
  /** Match window.location.hash for deep-link eager load (#portfolio). */
  sectionId?: string;
  fallback?: ReactNode;
};

const defaultFallback = (
  <div className="w-full animate-pulse rounded-2xl bg-muted/30" aria-hidden />
);

function hashTargetsSection(sectionId: string | undefined, hash: string) {
  if (!sectionId) return false;
  const normalized = hash.startsWith('#') ? hash : hash ? `#${hash}` : '';
  return normalized === `#${sectionId}`;
}

export function LazySection({
  children,
  minHeight = '16rem',
  rootMargin = '320px 0px 400px 0px',
  className,
  sectionId,
  fallback = defaultFallback,
}: LazySectionProps) {
  const location = useLocation();
  const routerHash = location.hash || (typeof window !== 'undefined' ? window.location.hash : '');
  const [hashEager, setHashEager] = useState(() => hashTargetsSection(sectionId, routerHash));
  const [ref, isNear] = useNearViewport({
    nearMargin: rootMargin,
    visibleMargin: '0px',
    visibleThreshold: 0,
  });

  useEffect(() => {
    if (!sectionId) return;
    setHashEager(hashTargetsSection(sectionId, routerHash));
  }, [sectionId, routerHash]);

  const shouldMount = isNear || hashEager;

  const style = useMemo(
    () => (shouldMount ? undefined : { minHeight }),
    [shouldMount, minHeight],
  );

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={cn(className)} style={style}>
      {shouldMount ? <Suspense fallback={fallback}>{children}</Suspense> : null}
    </div>
  );
}
