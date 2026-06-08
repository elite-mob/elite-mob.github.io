import { useEffect, useRef, useState } from 'react';

type UseNearViewportOptions = {
  /** Start preloading before the card enters the viewport. */
  nearMargin?: string;
  /** Card is considered visible for entrance / display logic. */
  visibleMargin?: string;
  visibleThreshold?: number;
};

/**
 * Two-stage visibility: `isNear` (prefetch) then `isVisible` (display).
 * Both latch true once triggered (trigger-once).
 */
export function useNearViewport(
  options: UseNearViewportOptions = {},
): [React.MutableRefObject<HTMLElement | null>, boolean, boolean] {
  const {
    nearMargin = '320px 0px 320px 0px',
    visibleMargin = '80px 0px 120px 0px',
    visibleThreshold = 0.06,
  } = options;

  const ref = useRef<HTMLElement | null>(null);
  const [isNear, setIsNear] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true);
          nearObserver.unobserve(element);
        }
      },
      { threshold: 0, rootMargin: nearMargin },
    );

    const visibleObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          visibleObserver.unobserve(element);
        }
      },
      { threshold: visibleThreshold, rootMargin: visibleMargin },
    );

    nearObserver.observe(element);
    visibleObserver.observe(element);

    return () => {
      nearObserver.disconnect();
      visibleObserver.disconnect();
    };
  }, [nearMargin, visibleMargin, visibleThreshold]);

  return [ref, isNear, isVisible];
}
