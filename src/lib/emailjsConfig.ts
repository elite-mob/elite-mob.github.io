/**
 * EmailJS is configured via VITE_* env vars (see .env.example).
 * Returns null if required keys are missing so the UI can fall back to other contact options.
 */
export type EmailJsConfig = {
  publicKey: string;
  serviceId: string;
  templateId: string;
  /** Optional template variable (e.g. recipient), if your template expects it */
  toEmail?: string;
};

export function getEmailJsConfig(): EmailJsConfig | null {
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim();
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim();
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim();
  if (!publicKey || !serviceId || !templateId) {
    return null;
  }
  const toEmail = import.meta.env.VITE_EMAILJS_TO_EMAIL?.trim();
  return {
    publicKey,
    serviceId,
    templateId,
    ...(toEmail ? { toEmail } : {}),
  };
}

/** Shown in error toasts when set; avoids hardcoding a personal email in the repo */
export function getContactEmailHint(): string | undefined {
  const v = import.meta.env.VITE_CONTACT_EMAIL?.trim();
  return v || undefined;
}
