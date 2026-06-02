import galleryManifest from 'virtual:portfolio-gallery';

type GalleryManifest = Record<string, string[]>;

const manifest = galleryManifest as GalleryManifest;

/** Images from public/portfolio-gallery/{projectId}-{slug}/ (auto-scanned on dev + build). */
export function getProjectGalleryPaths(projectId: string): string[] {
  return manifest[projectId] ?? [];
}

/** All images in a project's gallery folder — used as slider slides. */
export function getProjectSliderImages(projectId: string, fallbackArtwork?: string): string[] {
  const gallery = getProjectGalleryPaths(projectId);
  if (gallery.length > 0) return gallery;

  if (fallbackArtwork && fallbackArtwork !== '/placeholder.svg') {
    return [fallbackArtwork];
  }
  return [];
}
