/**
 * Hash / section navigation for the single-page home layout and cross-route jumps.
 */
import type { NavigateFunction } from 'react-router-dom';

const MAX_SCROLL_ATTEMPTS = 24;
const SCROLL_RETRY_MS = 50;
const LAYOUT_STABLE_MAX_MS = 900;
const LAYOUT_STABLE_FRAMES = 3;
const SCROLL_ALIGN_TOLERANCE_PX = 12;
const PROGRAMMATIC_SCROLL_SUPPRESS_MS = 1400;

const HOME_SECTION_IDS = [
  'home',
  'about',
  'portfolio',
  'experience',
  'skills',
  'reviews',
  'contact',
] as const;

let activeScrollId = 0;
let suppressHashAutoScrollUntil = 0;

function normalizeHash(hash: string): string {
  const trimmed = hash.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

function sectionIdFromHash(hash: string): string {
  return normalizeHash(hash).replace(/^#/, '');
}

function sectionIndex(sectionId: string): number {
  return HOME_SECTION_IDS.indexOf(sectionId as (typeof HOME_SECTION_IDS)[number]);
}

function isBelowPortfolio(sectionId: string): boolean {
  const portfolioIdx = sectionIndex('portfolio');
  const targetIdx = sectionIndex(sectionId);
  return portfolioIdx !== -1 && targetIdx > portfolioIdx;
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

function getScrollPaddingTop(): number {
  return parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
}

function isScrollAligned(element: Element, tolerance = SCROLL_ALIGN_TOLERANCE_PX): boolean {
  return Math.abs(element.getBoundingClientRect().top - getScrollPaddingTop()) <= tolerance;
}

function scrollTopForElement(element: Element): number {
  const padding = getScrollPaddingTop();
  return Math.max(0, window.scrollY + element.getBoundingClientRect().top - padding);
}

/** Scroll a section into view; fixed nav offset via `scroll-padding-top` on `html`. */
export function scrollElementIntoView(element: Element): void {
  const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
  window.scrollTo({ top: scrollTopForElement(element), left: 0, behavior });
}

function beginProgrammaticScroll(): number {
  activeScrollId += 1;
  suppressHashAutoScrollUntil = performance.now() + PROGRAMMATIC_SCROLL_SUPPRESS_MS;
  return activeScrollId;
}

/** One late correction after smooth scroll / lazy layout — avoids multi-hop bounce. */
function scheduleScrollCorrection(fragment: string, scrollId: number): void {
  const delays = prefersReducedMotion() ? [80] : [520, 1100];

  delays.forEach((ms) => {
    window.setTimeout(() => {
      if (scrollId !== activeScrollId) return;
      const element = document.querySelector(fragment);
      if (!element || isScrollAligned(element)) return;
      window.scrollTo({
        top: scrollTopForElement(element),
        left: 0,
        behavior: 'auto',
      });
    }, ms);
  });
}

function waitForLayoutStable(callback: () => void, maxMs = LAYOUT_STABLE_MAX_MS): void {
  let lastHeight = document.documentElement.scrollHeight;
  let stableFrames = 0;
  let rafId = 0;
  let timeoutId = 0;
  let done = false;
  const start = performance.now();

  const finish = () => {
    if (done) return;
    done = true;
    if (rafId) cancelAnimationFrame(rafId);
    if (timeoutId) window.clearTimeout(timeoutId);
    callback();
  };

  const tick = () => {
    const height = document.documentElement.scrollHeight;

    if (height === lastHeight) {
      stableFrames += 1;
      if (stableFrames >= LAYOUT_STABLE_FRAMES) {
        finish();
        return;
      }
    } else {
      stableFrames = 0;
      lastHeight = height;
    }

    if (performance.now() - start >= maxMs) {
      finish();
      return;
    }

    rafId = requestAnimationFrame(tick);
  };

  timeoutId = window.setTimeout(finish, maxMs);
  rafId = requestAnimationFrame(tick);
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

/**
 * Expanding the portfolio grid adds height above later sections. Only do that when
 * navigating downward; expanding while scrolling up causes visible bounce.
 */
function shouldPreExpandPortfolio(sectionId: string): boolean {
  if (!isBelowPortfolio(sectionId)) return false;

  const target = document.getElementById(sectionId);
  if (!target) return true;

  const targetY = target.getBoundingClientRect().top + window.scrollY;
  return targetY > window.scrollY + 64;
}

function prepareSectionLayout(sectionId: string): void {
  if (sectionId === 'portfolio') {
    applyPortfolioSideEffects();
    return;
  }

  if (shouldPreExpandPortfolio(sectionId)) {
    dispatchPortfolioShowContent();
  }
}

function scrollToSectionWhenStable(fragment: string, scrollId: number, attempt = 0): void {
  if (scrollId !== activeScrollId) return;

  const element = document.querySelector(fragment);
  if (!element) {
    if (attempt < MAX_SCROLL_ATTEMPTS) {
      window.setTimeout(
        () => scrollToSectionWhenStable(fragment, scrollId, attempt + 1),
        SCROLL_RETRY_MS,
      );
    }
    return;
  }

  scrollElementIntoView(element);
  scheduleScrollCorrection(fragment, scrollId);
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

export function scrollToSectionAfterPaint(hash: string, scrollId?: number): void {
  const fragment = normalizeHash(hash);
  if (!fragment) return;

  const id = scrollId ?? beginProgrammaticScroll();
  const sectionId = sectionIdFromHash(fragment);
  prepareSectionLayout(sectionId);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      waitForLayoutStable(() => scrollToSectionWhenStable(fragment, id));
    });
  });
}

/** Skip Index hash handlers while programmatic navigation is scrolling. */
export function shouldSuppressHashAutoScroll(): boolean {
  return performance.now() < suppressHashAutoScrollUntil;
}

function updateHomeHash(fragment: string, navigate?: NavigateFunction): void {
  const onHome = isHomePath();

  if (navigate) {
    navigate({ pathname: '/', hash: fragment }, { replace: onHome });
    return;
  }

  if (!onHome) {
    window.location.href = homeHrefWithHash(fragment);
    return;
  }

  window.history.replaceState(null, '', homeHrefWithHash(fragment));
}

function runSectionNavigation(
  hash: string,
  navigate?: NavigateFunction,
  anchorScrollY?: number,
): void {
  const fragment = normalizeHash(hash);
  if (!fragment) return;

  const scrollId = beginProgrammaticScroll();

  if (typeof anchorScrollY === 'number') {
    window.scrollTo({ top: Math.max(0, anchorScrollY), left: 0, behavior: 'auto' });
  }

  updateHomeHash(fragment, navigate);
  scrollToSectionAfterPaint(fragment, scrollId);
}

/**
 * Mobile menu navigation: restore the frozen scroll offset, then scroll to target.
 */
export function navigateToSectionFromMenu(
  hash: string,
  lockedScrollY: number,
  navigate?: NavigateFunction,
): void {
  runSectionNavigation(hash, navigate, lockedScrollY);
}

export function navigateToPortfolioFromMenu(
  lockedScrollY: number,
  navigate?: NavigateFunction,
  category?: string,
): void {
  if (category) {
    localStorage.setItem('portfolioCategory', category);
  }
  applyPortfolioSideEffects(category);
  runSectionNavigation('#portfolio', navigate, lockedScrollY);
}

export const navigateToSection = (hash: string, navigate?: NavigateFunction) => {
  runSectionNavigation(hash, navigate);
};

export const navigateToPortfolio = (category?: string, navigate?: NavigateFunction) => {
  if (category) {
    localStorage.setItem('portfolioCategory', category);
  }

  const scrollId = beginProgrammaticScroll();
  applyPortfolioSideEffects(category);

  const onHome = isHomePath();
  const search = category ? `?category=${encodeURIComponent(category)}` : '';

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

  scrollToSectionAfterPaint('#portfolio', scrollId);
};

// Handle hash navigation on page load / direct URL with fragment
export const handleHashNavigation = () => {
  const raw = window.location.hash || '';
  const fragment = normalizeHash(raw);
  if (!fragment) return;

  scrollToSectionAfterPaint(fragment);
};
