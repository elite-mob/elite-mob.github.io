import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirebaseConfig } from './config';

let cachedApp: FirebaseApp | null = null;

/**
 * Single Firebase app for Analytics, Firestore, and Auth.
 * Returns null if env is incomplete (same as before Analytics-only setup).
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (cachedApp) return cachedApp;
  const config = getFirebaseConfig();
  if (!config) return null;
  if (getApps().length > 0) {
    cachedApp = getApps()[0]!;
    return cachedApp;
  }
  cachedApp = initializeApp(config);
  return cachedApp;
}
