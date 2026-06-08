import galleryManifest from 'virtual:portfolio-gallery';
import { publicAssetUrl } from '@/lib/publicAssetUrl';
import {
  resolvePortfolioSlideSources,
  type PortfolioSlideSources,
} from '@/lib/portfolioImageVariants';

type GalleryManifest = Record<string, string[]>;

const manifest = galleryManifest as GalleryManifest;

function fileNameFromGalleryUrl(url: string): string {
  const segment = url.split('/').pop() ?? '';
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** A-Z by file name (case-insensitive, numeric segments ordered naturally). */
export function sortGalleryUrls(urls: string[]): string[] {
  return [...urls].sort((a, b) =>
    fileNameFromGalleryUrl(a).localeCompare(fileNameFromGalleryUrl(b), undefined, {
      numeric: true,
      sensitivity: 'base',
    }),
  );
}

/** Images from public/portfolio-gallery/{projectId}-{slug}/ (auto-scanned on dev + build). */
export function getProjectGalleryPaths(projectId: string): string[] {
  return sortGalleryUrls((manifest[projectId] ?? []).map(publicAssetUrl));
}

/** All images in a project's gallery folder, used as slider slides. */
export function getProjectSliderImages(projectId: string, fallbackArtwork?: string): string[] {
  const gallery = getProjectGalleryPaths(projectId);
  if (gallery.length > 0) return gallery;

  if (fallbackArtwork && fallbackArtwork !== '/placeholder.svg') {
    return [publicAssetUrl(fallbackArtwork)];
  }
  return [];
}

/** Full + generated thumb/display paths for progressive loading. */
export function getProjectSliderSources(
  projectId: string,
  fallbackArtwork?: string,
): PortfolioSlideSources[] {
  return resolvePortfolioSlideSources(getProjectSliderImages(projectId, fallbackArtwork));
}
