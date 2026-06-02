/**
 * Slug for portfolio-gallery folder names (public/portfolio-gallery/{folder}/).
 * Format: `{projectId}-{title-slug}` — unique, readable, matches portfolioData.
 */
export function portfolioGalleryFolderName(projectId: string, title: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return slug ? `${projectId}-${slug}` : projectId;
}

export function portfolioGalleryPublicPath(folder: string, fileName: string): string {
  return `/portfolio-gallery/${encodeURIComponent(folder)}/${encodeURIComponent(fileName)}`;
}

/** Primary project artwork path inside that project's gallery folder. */
export function projectArtworkUrl(projectId: string, title: string): string {
  return portfolioGalleryPublicPath(portfolioGalleryFolderName(projectId, title), 'artwork.webp');
}
