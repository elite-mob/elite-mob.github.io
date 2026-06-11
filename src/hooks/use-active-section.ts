import { useEffect, useState } from 'react';

const HOME_SECTION_IDS = [
  'home',
  'about',
  'portfolio',
  'experience',
  'skills',
  'reviews',
  'contact',
] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

function getScrollMarker(): number {
  const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
  return (Number.isFinite(padding) ? padding : 88) + 1;
}

/** Section whose top has crossed the fixed-header marker (last match wins). */
export function measureActiveSection(): HomeSectionId {
  const marker = getScrollMarker();
  let active: HomeSectionId = 'home';

  for (const id of HOME_SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.getBoundingClientRect().top <= marker) {
      active = id;
    }
  }

  return active;
}

/**
 * Highlights the nav link for whichever homepage section is in view.
 * Uses scroll position (not IntersectionObserver) so every section is evaluated consistently.
 */
export function useActiveSection(enabled = true): HomeSectionId | null {
  const [active, setActive] = useState<HomeSectionId | null>(enabled ? 'home' : null);

  useEffect(() => {
    if (!enabled) {
      setActive(null);
      return;
    }

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const next = measureActiveSection();
      setActive((prev) => (prev === next ? prev : next));
    };

    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    update();

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    const main = document.getElementById('main-content');
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' && main
        ? new ResizeObserver(scheduleUpdate)
        : null;
    resizeObserver?.observe(main);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      resizeObserver?.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [enabled]);

  return active;
}

export { HOME_SECTION_IDS };
