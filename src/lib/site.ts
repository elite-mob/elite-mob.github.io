import defaultOgImage from '@/assets/avatar.png';

/**
 * Canonical site URL for SEO, OG tags, and JSON-LD.
 * Override with VITE_SITE_URL in .env for staging or custom domain.
 */
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://elite-mob.github.io').replace(/\/$/, '');

export const SITE_NAME = 'Hans Chan';
export const DEFAULT_TITLE = `${SITE_NAME} | Full-Stack Developer | Web, Mobile & AI`;
export const DEFAULT_DESCRIPTION =
  'Full-stack developer based in China. Portfolio: web, mobile, and AI, trusted by startups and enterprises. 40+ shipped projects. Clear communication, on-time delivery, outcomes you can count on.';

/** Bundled avatar used for og:image / Twitter cards; Vite emits a hashed /assets/... URL in production. */
export const DEFAULT_OG_IMAGE_PATH = defaultOgImage;

export const SAME_AS_LINKS = [
  'https://github.com/elite-mob',
  'https://stackoverflow.com/users/8172804/lovemob',
] as const;

export function absoluteUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return SITE_URL;
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

/** Resolve bundled asset URL (Vite) or string path to absolute URL for OG tags. */
export function ogImageUrl(imageUrl: string | undefined): string {
  if (!imageUrl) return absoluteUrl(DEFAULT_OG_IMAGE_PATH);
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  if (imageUrl.startsWith('/')) return absoluteUrl(imageUrl);
  if (imageUrl.startsWith('data:')) return absoluteUrl(DEFAULT_OG_IMAGE_PATH);
  return absoluteUrl(imageUrl);
}
