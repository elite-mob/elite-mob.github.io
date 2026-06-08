/**
 * Build-time iOS App Store ratings (iTunes lookup API). Avoids JSONP on scroll.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseProjectsWithLinks } from './portfolio-gallery-utils.mjs';

const OUT_FILE = join(process.cwd(), 'src/data/iosStoreRatings.json');

function parseStoreLink(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host.includes('apps.apple.com') || host.includes('itunes.apple.com')) {
      const idMatch = parsed.pathname.match(/\/id(\d+)/);
      if (idMatch?.[1]) return { platform: 'ios', storeId: idMatch[1] };
    }
  } catch {
    return null;
  }
  return null;
}

function parseItunesLookup(data, appId) {
  const app = data.results?.[0];
  const rating = app?.averageUserRating ?? app?.averageUserRatingForCurrentVersion;
  const ratingCount = app?.userRatingCount ?? app?.userRatingCountForCurrentVersion;
  if (rating == null || ratingCount == null || ratingCount <= 0) {
    throw new Error('App Store rating unavailable');
  }
  return {
    rating,
    ratingCount,
    appName: app.trackName ?? 'App Store app',
    storeUrl: app.trackViewUrl ?? `https://apps.apple.com/app/id${appId}`,
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchIosRating(appId) {
  const res = await fetch(
    `https://itunes.apple.com/lookup?id=${encodeURIComponent(appId)}&country=us`,
  );
  if (!res.ok) throw new Error(`iTunes lookup HTTP ${res.status}`);
  const data = await res.json();
  return parseItunesLookup(data, appId);
}

async function readExistingManifest() {
  try {
    const raw = await readFile(OUT_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function fetchIosStoreRatings({ log = true } = {}) {
  const source = await readFile(resolve(process.cwd(), 'src/data/portfolioData.ts'), 'utf8');
  const projects = parseProjectsWithLinks(source);

  const iosIds = new Set();
  for (const project of projects) {
    for (const raw of [project.link, project.androidLink]) {
      const link = raw?.trim();
      const parsed = link ? parseStoreLink(link) : null;
      if (parsed?.platform === 'ios') iosIds.add(parsed.storeId);
    }
  }

  const manifest = await readExistingManifest();
  let ok = 0;
  let fail = 0;
  let reused = 0;

  for (const appId of iosIds) {
    if (manifest[appId]) {
      reused += 1;
      continue;
    }
    try {
      manifest[appId] = await fetchIosRating(appId);
      ok += 1;
      await new Promise((r) => setTimeout(r, 120));
    } catch (err) {
      fail += 1;
      if (log) {
        console.warn(`  ios rating skip id${appId}: ${err instanceof Error ? err.message : err}`);
      }
    }
  }

  await writeFile(OUT_FILE, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  if (log) {
    console.log(
      `ios store ratings: ${ok} fetched, ${reused} cached, ${fail} skipped → src/data/iosStoreRatings.json`,
    );
  }

  return { ok, fail, reused, total: iosIds.size };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await fetchIosStoreRatings();
}
