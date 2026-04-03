import { useEffect } from 'react';
import { logButtonClick } from '@/integrations/firebase/analytics';

function inferButtonLabel(el: HTMLElement): string {
  const explicit =
    el.getAttribute('data-analytics-label')?.trim() ||
    el.closest('[data-analytics-label]')?.getAttribute('data-analytics-label')?.trim();
  if (explicit) return explicit.slice(0, 100);

  const aria = el.getAttribute('aria-label')?.trim();
  if (aria) return aria.slice(0, 100);

  const title = el.getAttribute('title')?.trim();
  if (title) return title.slice(0, 100);

  const text = el.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  if (text) return text.slice(0, 100);

  return 'button';
}

function resolveLinkUrl(el: HTMLElement): string | undefined {
  if (el.tagName === 'A') {
    return (el as HTMLAnchorElement).href || undefined;
  }
  return undefined;
}

/**
 * Delegates click tracking for native buttons, role=button controls, and elements
 * marked with `data-analytics-button` (including shadcn `Button` and link-as-button CTAs).
 */
export function AnalyticsButtonClickTracker() {
  useEffect(() => {
    const onClickCapture = (e: MouseEvent) => {
      if (e.button !== 0) return;

      const target = e.target;
      if (!target || !(target instanceof Element)) return;

      const el = target.closest<HTMLElement>(
        'button, [role="button"], [data-analytics-button]',
      );
      if (!el) return;

      if (el.closest('[data-analytics-ignore]')) return;
      if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') return;

      const label = inferButtonLabel(el);
      const variant = el.getAttribute('data-button-variant')?.trim() || undefined;
      const linkUrl = resolveLinkUrl(el);

      void logButtonClick({
        button_label: label,
        button_variant: variant,
        link_url: linkUrl,
      });
    };

    document.addEventListener('click', onClickCapture, true);
    return () => document.removeEventListener('click', onClickCapture, true);
  }, []);

  return null;
}
