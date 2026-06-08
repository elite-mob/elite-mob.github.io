/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Canonical site URL for SEO, OG tags, JSON-LD (no trailing slash). Defaults in src/lib/site.ts */
  readonly VITE_SITE_URL?: string;
  /** From package.json */
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_NAME: string;
  /** EmailJS (contact form); all three required for the form to send */
  readonly VITE_EMAILJS_PUBLIC_KEY?: string;
  readonly VITE_EMAILJS_SERVICE_ID?: string;
  readonly VITE_EMAILJS_TEMPLATE_ID?: string;
  /** Optional template field (e.g. to_email), if your EmailJS template uses it */
  readonly VITE_EMAILJS_TO_EMAIL?: string;
  /** Optional: used only in error toasts as a fallback contact line */
  readonly VITE_CONTACT_EMAIL?: string;
  /** Optional: Cal.com / Calendly / etc., enables “Schedule a meeting” CTAs when set */
  readonly VITE_SCHEDULE_MEETING_URL?: string;
  /** Optional OpenAI chat via Firebase Function; omit for built-in local Q&A */
  readonly VITE_CHAT_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.pdf' {
  const src: string;
  export default src;
}

/** Built by vite-plugin-portfolio-gallery from public/portfolio-gallery/ */
declare module 'virtual:portfolio-gallery' {
  const manifest: Record<string, string[]>;
  export default manifest;
}