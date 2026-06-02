import galleryManifest from 'virtual:portfolio-gallery';
import { publicAssetUrl } from '@/lib/publicAssetUrl';

type GalleryManifest = Record<string, string[]>;

const manifest = galleryManifest as GalleryManifest;

/** Images from public/portfolio-gallery/{projectId}-{slug}/ (auto-scanned on dev + build). */
export function getProjectGalleryPaths(projectId: string): string[] {
  return (manifest[projectId] ?? []).map(publicAssetUrl);
}

/** Prefer real screenshots over logo-style artwork on card sliders. */
function slideDisplayOrder(url: string): number {
  const base = decodeURIComponent(url.split('/').pop() ?? '').replace(/\.[^.]+$/i, '').toLowerCase();
  if (base === 'preview' || base.startsWith('preview')) return 0;
  if (base === 'desktop') return 1;
  if (base === 'mobile') return 2;
  if (base === 'artwork') return 10;
  return 5;
}

/** All images in a project's gallery folder — used as slider slides. */
export function getProjectSliderImages(projectId: string, fallbackArtwork?: string): string[] {
  const gallery = getProjectGalleryPaths(projectId).sort(
    (a, b) => slideDisplayOrder(a) - slideDisplayOrder(b) || a.localeCompare(b),
  );
  if (gallery.length > 0) return gallery;

  if (fallbackArtwork && fallbackArtwork !== '/placeholder.svg') {
    return [publicAssetUrl(fallbackArtwork)];
  }
  return [];
}
