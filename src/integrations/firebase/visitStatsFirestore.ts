import {
  getFirestore,
  doc,
  runTransaction,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirebaseApp } from './app';
import { getFirebaseConfig } from './config';

export const SITE_STATS_COLLECTION = 'site_stats';
export const SUMMARY_DOC_ID = 'summary';

export type SiteVisitSummary = {
  total_visits: number;
  country_count: number;
  by_country: { name: string; code: string; count: number }[] | null;
  updated_at?: unknown;
};

function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const ac = new AbortController();
  const t = window.setTimeout(() => ac.abort(), ms);
  return fetch(url, { signal: ac.signal }).finally(() => window.clearTimeout(t));
}

async function fetchCountryFromClient(): Promise<{ code: string | null; name: string | null }> {
  try {
    const r = await fetchWithTimeout('https://ipapi.co/json/', 8000);
    if (!r.ok) return { code: null, name: null };
    const j = (await r.json()) as { country_code?: string; country_name?: string };
    return {
      code: j.country_code ?? null,
      name: j.country_name ?? null,
    };
  } catch {
    return { code: null, name: null };
  }
}

/**
 * Records one visit per browser session: anonymous auth + Firestore transaction
 * merging country into `by_country` (country from ipapi.co in the browser).
 */
export async function recordVisitToFirestore(): Promise<void> {
  const app = getFirebaseApp();
  if (!app) return;

  const auth = getAuth(app);
  try {
    await signInAnonymously(auth);
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('[visitStats] Anonymous sign-in failed; enable Anonymous auth in Firebase Console', e);
    }
    return;
  }

  const db = getFirestore(app);
  const { code, name } = await fetchCountryFromClient();
  const summaryRef = doc(db, SITE_STATS_COLLECTION, SUMMARY_DOC_ID);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(summaryRef);
    const d = snap.data() as Partial<SiteVisitSummary> | undefined;
    const total = (d?.total_visits ?? 0) + 1;
    let byCountry = [...(d?.by_country ?? [])];

    if (code && name) {
      const i = byCountry.findIndex((c) => c.code === code);
      if (i >= 0) {
        byCountry[i] = { ...byCountry[i], count: byCountry[i].count + 1 };
      } else {
        byCountry.push({ name, code, count: 1 });
      }
      byCountry = byCountry.sort((a, b) => b.count - a.count).slice(0, 30);
    }

    const country_count = new Set(byCountry.map((c) => c.code).filter(Boolean)).size;

    transaction.set(
      summaryRef,
      {
        total_visits: total,
        country_count,
        by_country: byCountry.length ? byCountry : null,
        updated_at: serverTimestamp(),
      },
      { merge: true },
    );
  });
}

export function subscribeToVisitStats(onData: (data: SiteVisitSummary | null) => void): () => void {
  const app = getFirebaseApp();
  if (!app) {
    onData(null);
    return () => {};
  }
  const db = getFirestore(app);
  const summaryRef = doc(db, SITE_STATS_COLLECTION, SUMMARY_DOC_ID);
  return onSnapshot(
    summaryRef,
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData(snap.data() as SiteVisitSummary);
    },
    () => onData(null),
  );
}

export function hasFirebaseConfig(): boolean {
  return getFirebaseConfig() !== null;
}
