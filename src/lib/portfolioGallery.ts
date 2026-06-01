import galleryManifest from '@/data/portfolioGallery.json';

type GalleryManifest = Record<string, string[]>;

const manifest = galleryManifest as GalleryManifest;

/** Fetched live previews from project links (public/portfolio-gallery). */
export function getProjectGalleryPaths(projectId: string): string[] {
  return manifest[projectId] ?? [];
}

/** Primary card image plus any fetched link previews (deduped). */
export function getProjectSliderImages(projectId: string, primaryImage?: string): string[] {
  const fetched = getProjectGalleryPaths(projectId);
  const images: string[] = [];

  if (primaryImage && primaryImage !== '/placeholder.svg') {
    images.push(primaryImage);
  }
  for (const src of fetched) {
    if (!images.includes(src)) images.push(src);
  }
  return images.length > 0 ? images : primaryImage ? [primaryImage] : [];
}
