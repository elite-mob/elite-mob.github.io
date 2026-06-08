export function parseLinkedInProfileSlug(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    const match = parsed.pathname.match(/\/in\/([^/?#]+)/i);
    const slug = match?.[1]?.replace(/\/$/, '');
    return slug || null;
  } catch {
    return null;
  }
}

/** Static avatar under public/testimonials/avatars/{slug}.webp */
export function linkedInSyncedAvatarPath(slug: string): string {
  return `/testimonials/avatars/${slug}.webp`;
}

/** LinkedIn slugs that have a synced file in public/testimonials/avatars/. */
const SYNCED_AVATAR_SLUGS = new Set([
  'jeremy-freund-a4079313',
  'jscottelam',
  'kevin-ludlow',
  'lindsaybuck',
  'louis-long',
  'opezachary',
  'william-krackomberger-7044b51b5',
]);

export function testimonialAvatarSrc(testimonial: {
  linkedinUrl?: string;
  avatarUrl?: string;
}): string | null {
  if (testimonial.avatarUrl?.trim()) return testimonial.avatarUrl.trim();
  const slug = testimonial.linkedinUrl
    ? parseLinkedInProfileSlug(testimonial.linkedinUrl)
    : null;
  if (!slug || !SYNCED_AVATAR_SLUGS.has(slug)) return null;
  return linkedInSyncedAvatarPath(slug);
}
