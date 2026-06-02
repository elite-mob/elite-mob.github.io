/**
 * Fetches Google Play ratings via google-play-scraper and writes androidStoreRatings.json.
 * Run automatically in prebuild; also: npm run sync-android-ratings
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import gplay from 'google-play-scraper';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const portfolioPath = join(root, 'src/data/portfolioData.ts');
const outPath = join(root, 'src/data/androidStoreRatings.json');

const PLAY_ID_RE =
  /https:\/\/play\.google\.com\/store\/apps\/details\?(?:[^'"]*&)?id=([a-zA-Z0-9._]+)/g;

function collectPlayPackageIds(source) {
  const ids = new Set();
  for (const match of source.matchAll(PLAY_ID_RE)) {
    if (match[1]) ids.add(match[1]);
  }
  return [...ids];
}

async function fetchAndroidRating(packageId) {
  const app = await gplay.app({
    appId: packageId,
    lang: 'en',
    country: 'us',
  });

  const rating = app.score;
  const ratingCount = app.ratings;
  if (rating == null || ratingCount == null || ratingCount <= 0) {
    throw new Error(`No rating for ${packageId}`);
  }

  return {
    rating,
    ratingCount,
    appName: app.title ?? packageId,
    storeUrl: app.url ?? `https://play.google.com/store/apps/details?id=${packageId}`,
    fetchedAt: new Date().toISOString(),
  };
}

async function main() {
  const portfolioSource = readFileSync(portfolioPath, 'utf8');
  const packageIds = collectPlayPackageIds(portfolioSource);

  if (packageIds.length === 0) {
    console.log('No Play Store package IDs found in portfolioData.ts');
    writeFileSync(outPath, '{}\n', 'utf8');
    return;
  }

  console.log(`Fetching Google Play ratings for ${packageIds.length} app(s)...`);
  const manifest = {};

  for (const packageId of packageIds) {
    try {
      manifest[packageId] = await fetchAndroidRating(packageId);
      const { rating, ratingCount } = manifest[packageId];
      console.log(`  ✓ ${packageId} — ${rating.toFixed(2)} (${ratingCount} ratings)`);
    } catch (err) {
      console.warn(`  ✗ ${packageId} — ${err instanceof Error ? err.message : err}`);
    }
  }

  writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
