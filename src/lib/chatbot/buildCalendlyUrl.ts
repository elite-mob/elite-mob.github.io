export type CalendlyPrefillParams = {
  name: string;
  email: string;
  topic?: string;
};

/**
 * Append Calendly invitee prefill query params to the configured booking URL.
 * @see https://help.calendly.com/hc/en-us/articles/226766767
 */
export function buildCalendlyPrefillUrl(baseUrl: string, params: CalendlyPrefillParams): string {
  const url = new URL(baseUrl);
  url.searchParams.set('name', params.name.trim());
  url.searchParams.set('email', params.email.trim());
  if (params.topic?.trim()) {
    url.searchParams.set('a1', params.topic.trim());
  }
  return url.href;
}
