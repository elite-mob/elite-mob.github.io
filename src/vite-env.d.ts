/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Canonical site URL for SEO, OG tags, JSON-LD (no trailing slash). Defaults in src/lib/site.ts */
  readonly VITE_SITE_URL?: string;
  /** From package.json; used for Firebase / GA4 version reporting */
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;
  /** EmailJS (contact form); all three required for the form to send */
  readonly VITE_EMAILJS_PUBLIC_KEY?: string;
  readonly VITE_EMAILJS_SERVICE_ID?: string;
  readonly VITE_EMAILJS_TEMPLATE_ID?: string;
  /** Optional template field (e.g. to_email), if your EmailJS template uses it */
  readonly VITE_EMAILJS_TO_EMAIL?: string;
  /** Optional: used only in error toasts as a fallback contact line */
  readonly VITE_CONTACT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.pdf' {
  const src: string;
  export default src;
}