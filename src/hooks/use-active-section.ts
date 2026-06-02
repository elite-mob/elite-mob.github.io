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

/**
 * Highlights the nav link for whichever homepage section is most visible.
 */
export function useActiveSection(enabled = true): HomeSectionId | null {
  const [active, setActive] = useState<HomeSectionId | null>('home');

  useEffect(() => {
    if (!enabled) return;

    const elements = HOME_SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el != null,
    );

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const top = visible[0]?.target.id;
        if (top && HOME_SECTION_IDS.includes(top as HomeSectionId)) {
          setActive(top as HomeSectionId);
        }
      },
      {
        rootMargin: '-42% 0px -48% 0px',
        threshold: [0, 0.12, 0.25, 0.4],
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  return active;
}

export { HOME_SECTION_IDS };
