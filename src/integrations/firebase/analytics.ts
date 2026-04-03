import { getAnalytics, isSupported, logEvent, setDefaultEventParameters, setUserProperties, type Analytics } from 'firebase/analytics';
import { getFirebaseApp } from './app';

let analyticsPromise: Promise<Analytics | null> | null = null;

/** Single shared Analytics instance (production + browser + supported only). */
export const getAnalyticsInstance = (): Promise<Analytics | null> => {
  if (analyticsPromise) {
    return analyticsPromise;
  }

  analyticsPromise = (async (): Promise<Analytics | null> => {
    if (!import.meta.env.PROD || typeof window === 'undefined') {
      return null;
    }

    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) {
      return null;
    }

    if (!(await isSupported())) {
      return null;
    }

    const analytics = getAnalytics(firebaseApp);
    const appVersion = import.meta.env.VITE_APP_VERSION ?? '0.0.0';
    const appName = import.meta.env.VITE_APP_NAME ?? 'portfolio';

    setDefaultEventParameters(analytics, {
      app_version: appVersion,
      web_app_name: appName,
    });

    setUserProperties(analytics, {
      app_version: appVersion,
      web_app_name: appName,
    });

    return analytics;
  })();

  return analyticsPromise;
};

/** Fire-and-forget init from main.tsx (warms up Analytics before first event). */
export const initFirebaseAnalytics = async (): Promise<void> => {
  await getAnalyticsInstance();
};

type PageViewParams = {
  page_path: string;
  page_title: string;
  page_location?: string;
};

/** GA4-style page_view for SPA route changes. */
export const logPageView = async (params: PageViewParams): Promise<void> => {
  const analytics = await getAnalyticsInstance();
  if (!analytics) return;

  logEvent(analytics, 'page_view', {
    page_path: params.page_path,
    page_title: params.page_title,
    page_location: params.page_location ?? (typeof window !== 'undefined' ? window.location.href : ''),
  });
};

/** Time spent on the previous route before navigating away (ms). */
export const logTimeOnPage = async (params: {
  page_path: string;
  duration_ms: number;
}): Promise<void> => {
  const analytics = await getAnalyticsInstance();
  if (!analytics) return;

  if (params.duration_ms < 0) return;

  logEvent(analytics, 'page_duration', {
    page_path: params.page_path,
    duration_ms: Math.round(params.duration_ms),
  });
};

/** User clicked a project card (interest signal before detail view). */
export const logProjectCardClick = async (params: {
  project_id: string;
  project_title: string;
  category: string;
}): Promise<void> => {
  const analytics = await getAnalyticsInstance();
  if (!analytics) return;

  logEvent(analytics, 'project_card_click', {
    project_id: params.project_id,
    project_title: params.project_title,
    project_category: params.category,
  });
};

/** User opened project detail page (full context for reports). */
export const logProjectDetailView = async (params: {
  project_id: string;
  project_title: string;
  category: string;
}): Promise<void> => {
  const analytics = await getAnalyticsInstance();
  if (!analytics) return;

  logEvent(analytics, 'project_detail_view', {
    project_id: params.project_id,
    project_title: params.project_title,
    project_category: params.category,
  });
};

/** Home page section from hash (#portfolio, #about, …). */
export const logHomeSectionView = async (params: {
  section: string;
}): Promise<void> => {
  const analytics = await getAnalyticsInstance();
  if (!analytics) return;

  logEvent(analytics, 'home_section_view', {
    section_id: params.section,
  });
};

/** Primary clicks on `<button>`, `[role="button"]`, and tracked links (`data-analytics-button`). Sent to GA4 via Firebase. */
export const logButtonClick = async (params: {
  button_label: string;
  button_variant?: string;
  link_url?: string;
}): Promise<void> => {
  const analytics = await getAnalyticsInstance();
  if (!analytics) return;

  const label = params.button_label.trim().slice(0, 100) || 'button';

  logEvent(analytics, 'button_click', {
    button_label: label,
    ...(params.button_variant && { button_variant: params.button_variant.slice(0, 64) }),
    ...(params.link_url && { link_url: params.link_url.slice(0, 500) }),
  });
};
