/**
 * Optional booking link (Cal.com, Calendly, Google Appointment, etc.).
 * Set `VITE_SCHEDULE_MEETING_URL` in `.env`; omit to hide schedule CTAs.
 */
export function getScheduleMeetingUrl(): string | undefined {
  const raw = import.meta.env.VITE_SCHEDULE_MEETING_URL?.trim();
  if (!raw) return undefined;
  try {
    // Reject junk values at build/runtime
    const url = new URL(raw);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}
