import { publicAssetUrl } from '@/lib/publicAssetUrl';

export type PortfolioImageVariant = 'thumb' | 'display' | 'full';

export type PortfolioSlideSources = {
  full: string;
  thumb: string | null;
  display: string | null;
};

const GENERATED_PREFIX = '/portfolio-gallery/_generated';

function variantUrl(fullUrl: string, tier: 'thumbs' | 'display'): string | null {
  const normalized = fullUrl.trim();
  if (!normalized.includes('/portfolio-gallery/')) return null;
  if (normalized.includes('/_generated/')) return null;

  const path = normalized.split('/portfolio-gallery/')[1];
  if (!path) return null;

  const base = path.replace(/\.[^.]+$/, '');
  return publicAssetUrl(`${GENERATED_PREFIX}/${tier}/${base}.webp`);
}

/** Map a full gallery URL to thumb / display / full sources. */
export function getPortfolioSlideSources(fullUrl: string): PortfolioSlideSources {
  const full = publicAssetUrl(fullUrl);
  return {
    full,
    thumb: variantUrl(full, 'thumbs'),
    display: variantUrl(full, 'display'),
  };
}

export function resolvePortfolioSlideSources(urls: string[]): PortfolioSlideSources[] {
  return urls.filter(Boolean).map(getPortfolioSlideSources);
}

/** Best low-res URL for instant paint (thumb → display → full). */
export function getLowResSrc(sources: PortfolioSlideSources): string {
  return sources.thumb ?? sources.display ?? sources.full;
}

/** Target high-res URL for a slider context (cards use display, hero uses full). */
export function getHighResSrc(sources: PortfolioSlideSources, variant: 'card' | 'hero'): string {
  if (variant === 'hero') return sources.full;
  return sources.display ?? sources.full;
}
