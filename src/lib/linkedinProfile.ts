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

export function testimonialAvatarSrc(testimonial: {
  linkedinUrl?: string;
  avatarUrl?: string;
}): string | null {
  if (testimonial.avatarUrl?.trim()) return testimonial.avatarUrl.trim();
  const slug = testimonial.linkedinUrl
    ? parseLinkedInProfileSlug(testimonial.linkedinUrl)
    : null;
  return slug ? linkedInSyncedAvatarPath(slug) : null;
}
