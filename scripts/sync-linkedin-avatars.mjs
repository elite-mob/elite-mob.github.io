/**
 * Downloads LinkedIn profile photos for testimonials into public/testimonials/avatars/.
 * Tries unavatar.io first, then Playwright (Chromium) for profiles that return a placeholder.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const testimonialsPath = join(root, 'src/data/testimonials.ts');
const outDir = join(root, 'public/testimonials/avatars');

const PLACEHOLDER_RE =
  /1c5u578iilxfi4m4dvc4q810q|aero-v1\/sc\/h\/[a-z0-9]+$/i;

const LINKEDIN_URL_RE =
  /linkedinUrl:\s*['"](https:\/\/[^'"]+linkedin\.com\/in\/[^'"]+)['"]/gi;

function collectLinkedInUrls(source) {
  const urls = [];
  for (const match of source.matchAll(LINKEDIN_URL_RE)) {
    if (match[1]) urls.push(match[1]);
  }
  return [...new Set(urls)];
}

function parseSlug(url) {
  try {
    const match = new URL(url).pathname.match(/\/in\/([^/?#]+)/i);
    return match?.[1]?.replace(/\/$/, '') ?? null;
  } catch {
    return null;
  }
}

function isPlaceholderUrl(url) {
  return !url || PLACEHOLDER_RE.test(url);
}

async function resolvePhotoUrlUnavatar(slug) {
  const res = await fetch(`https://unavatar.io/linkedin/${encodeURIComponent(slug)}?json`);
  if (!res.ok) throw new Error(`unavatar HTTP ${res.status}`);
  const data = await res.json();
  if (!data?.url || isPlaceholderUrl(data.url)) {
    throw new Error('unavatar returned a generic placeholder');
  }
  return data.url;
}

async function resolvePhotoUrlPlaywright(profileUrl) {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    });
    await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.waitForTimeout(2000);

    const src = await page.evaluate(() => {
      const candidates = [
        ...document.querySelectorAll('img.pv-top-card-profile-picture__image'),
        ...document.querySelectorAll('img[data-test-id="profile-photo"]'),
        ...document.querySelectorAll('section.pv-top-card img'),
        ...document.querySelectorAll('img[src*="profile-displayphoto"]'),
      ];
      for (const img of candidates) {
        const url = img.getAttribute('src');
        if (url && url.includes('media.licdn.com') && !url.includes('ghost')) {
          return url;
        }
      }
      return null;
    });

    if (!src || isPlaceholderUrl(src)) {
      throw new Error('Playwright could not find a profile photo on the page');
    }
    return src;
  } finally {
    await browser.close();
  }
}

async function resolvePhotoUrl(slug, profileUrl) {
  try {
    return await resolvePhotoUrlUnavatar(slug);
  } catch {
    return resolvePhotoUrlPlaywright(profileUrl);
  }
}

async function downloadAndSave(slug, photoUrl) {
  const res = await fetch(photoUrl, {
    headers: { 'User-Agent': 'elite-mob-testimonial-avatars/1.0' },
  });
  if (!res.ok) throw new Error(`image HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const webp = await sharp(buffer)
    .resize(176, 176, { fit: 'cover', position: 'centre' })
    .webp({ quality: 82 })
    .toBuffer();
  writeFileSync(join(outDir, `${slug}.webp`), webp);
}

async function main() {
  const source = readFileSync(testimonialsPath, 'utf8');
  const urls = collectLinkedInUrls(source);

  mkdirSync(outDir, { recursive: true });

  if (urls.length === 0) {
    console.log('No linkedinUrl entries in testimonials.ts');
    return;
  }

  console.log(`Syncing ${urls.length} LinkedIn avatar(s)...`);
  let failed = 0;

  for (const url of urls) {
    const slug = parseSlug(url);
    if (!slug) {
      console.warn(`  ✗ Could not parse slug from ${url}`);
      failed += 1;
      continue;
    }

    const outPath = join(outDir, `${slug}.webp`);
    if (existsSync(outPath)) {
      console.log(`  ○ ${slug} — already exists, skipping`);
      continue;
    }

    try {
      const photoUrl = await resolvePhotoUrl(slug, url);
      await downloadAndSave(slug, photoUrl);
      console.log(`  ✓ ${slug} → public/testimonials/avatars/${slug}.webp`);
    } catch (err) {
      failed += 1;
      console.warn(`  ✗ ${slug} — ${err instanceof Error ? err.message : err}`);
      console.warn(`    Add manually: public/testimonials/avatars/${slug}.webp`);
    }
  }

  if (failed > 0) {
    console.warn(
      `\n${failed} avatar(s) could not be synced — add WebP files under public/testimonials/avatars/ or set avatarUrl in testimonials.ts.`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
