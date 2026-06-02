/**
 * Hash / section navigation for the single-page home layout and cross-route jumps.
 */
import type { NavigateFunction } from 'react-router-dom';

const MAX_SCROLL_ATTEMPTS = 12;
const SCROLL_RETRY_MS = 50;

function normalizeHash(hash: string): string {
  const trimmed = hash.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

function sectionIdFromHash(hash: string): string {
  return normalizeHash(hash).replace(/^#/, '');
}

/** True when the current URL is the site home (respects Vite `BASE_URL`). */
export function isHomePath(): boolean {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '') || '';
  const pathname = window.location.pathname.replace(/\/$/, '') || '/';
  if (!base || base === '/') return pathname === '/' || pathname === '';
  return pathname === base;
}

function homeHrefWithHash(hash: string): string {
  const fragment = normalizeHash(hash);
  return new URL(fragment, window.location.origin + import.meta.env.BASE_URL).href;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Scroll a section into view; fixed nav offset via `scroll-padding-top` on `html`. */
export function scrollElementIntoView(element: Element): void {
  element.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  });
}

/** Retry scroll until the target exists (cross-route / lazy sections). */
export function scrollToSectionByHash(hash: string, attempt = 0): boolean {
  const fragment = normalizeHash(hash);
  if (!fragment) return false;

  const element = document.querySelector(fragment);
  if (element) {
    scrollElementIntoView(element);
    return true;
  }

  if (attempt < MAX_SCROLL_ATTEMPTS) {
    window.setTimeout(() => scrollToSectionByHash(fragment, attempt + 1), SCROLL_RETRY_MS);
  }
  return false;
}

export function scrollToSectionAfterPaint(hash: string): void {
  const fragment = normalizeHash(hash);
  if (!fragment) return;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollToSectionByHash(fragment);
    });
  });
}

function dispatchPortfolioShowContent(): void {
  window.dispatchEvent(new CustomEvent('portfolioShowContent'));
}

function dispatchPortfolioFilter(category: string): void {
  localStorage.setItem('portfolioCategory', category);
  window.dispatchEvent(new CustomEvent('portfolioFilterChange', { detail: { category } }));
}

function applyPortfolioSideEffects(category?: string): void {
  dispatchPortfolioShowContent();
  if (category) dispatchPortfolioFilter(category);
}

export const navigateToSection = (hash: string, navigate?: NavigateFunction) => {
  const fragment = normalizeHash(hash);
  if (!fragment) return;

  const onHome = isHomePath();

  if (navigate) {
    navigate({ pathname: '/', hash: fragment }, { replace: onHome });
  } else if (!onHome) {
    window.location.href = homeHrefWithHash(fragment);
    return;
  } else {
    window.history.replaceState(null, '', homeHrefWithHash(fragment));
  }

  if (onHome) {
    scrollToSectionAfterPaint(fragment);
  }
};

export const navigateToPortfolio = (category?: string, navigate?: NavigateFunction) => {
  const onHome = isHomePath();
  const search = category ? `?category=${encodeURIComponent(category)}` : '';

  if (category) {
    localStorage.setItem('portfolioCategory', category);
  }

  if (navigate) {
    navigate(
      {
        pathname: '/',
        hash: '#portfolio',
        ...(search ? { search } : {}),
      },
      { replace: onHome },
    );
  } else if (!onHome) {
    const u = new URL(import.meta.env.BASE_URL, window.location.origin);
    u.hash = 'portfolio';
    if (search) u.search = search;
    window.location.href = u.href;
    return;
  } else if (search) {
    const u = new URL(window.location.href);
    u.search = search;
    window.history.replaceState(null, '', u.pathname + u.search + u.hash);
  } else {
    window.history.replaceState(null, '', homeHrefWithHash('#portfolio'));
  }

  applyPortfolioSideEffects(category);

  if (onHome) {
    scrollToSectionAfterPaint('#portfolio');
  }
};

// Handle hash navigation on page load / route change
export const handleHashNavigation = () => {
  const raw = window.location.hash || '';
  const fragment = normalizeHash(raw);
  if (!fragment) return;

  const id = sectionIdFromHash(fragment);
  if (id === 'portfolio') {
    dispatchPortfolioShowContent();
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    if (category) dispatchPortfolioFilter(category);
  }

  scrollToSectionAfterPaint(fragment);
};
