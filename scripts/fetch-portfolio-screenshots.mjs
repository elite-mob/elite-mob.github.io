/**
 * Fetches live previews from portfolio project links via Microlink, saves under
 * public/portfolio-gallery/, and writes src/data/portfolioGallery.json.
 *
 * Run: npm run fetch-portfolio-screenshots
 * Cached by link hash — skips URLs already on disk.
 */

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const DATA_FILE = join(ROOT, 'src', 'data', 'portfolioData.ts');
const OUT_DIR = join(ROOT, 'public', 'portfolio-gallery');
const MANIFEST_FILE = join(ROOT, 'src', 'data', 'portfolioGallery.json');

const CONCURRENCY = 1;
const REQUEST_GAP_MS = 2500;

function hashLink(link) {
  return createHash('sha256').update(link).digest('hex').slice(0, 14);
}

function parseProjects(source) {
  const projects = [];
  const blockRegex = /id:\s*'([^']+)'[\s\S]*?link:\s*'([^']+)'/g;
  let match;
  while ((match = blockRegex.exec(source)) !== null) {
    projects.push({ id: match[1], link: match[2] });
  }
  return projects;
}

function isAppStoreLink(link) {
  return /apps\.apple\.com|play\.google\.com|itunes\.apple\.com/i.test(link);
}

function isSocialOnly(link) {
  return /instagram\.com|facebook\.com|twitter\.com|x\.com/i.test(link);
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function microlinkScreenshot(link, { mobile = false }, attempt = 0) {
  const params = new URLSearchParams({
    url: link,
    screenshot: 'true',
    meta: 'false',
  });
  if (mobile) {
    params.set('viewport.isMobile', 'true');
    params.set('viewport.deviceScaleFactor', '2');
  } else {
    params.set('viewport.width', '1280');
    params.set('viewport.height', '800');
  }

  const res = await fetch(`https://api.microlink.io/?${params}`, {
    headers: { 'User-Agent': 'elite-mob-portfolio-screenshot-fetch/1.0' },
  });
  if (res.status === 429 && attempt < 4) {
    const wait = 8000 * (attempt + 1);
    console.warn(`  … rate limited, retry in ${wait / 1000}s`);
    await new Promise((r) => setTimeout(r, wait));
    return microlinkScreenshot(link, { mobile }, attempt + 1);
  }
  if (!res.ok) throw new Error(`Microlink HTTP ${res.status}`);
  const json = await res.json();
  if (json.status !== 'success' || !json.data?.screenshot?.url) {
    throw new Error(json.message || 'Microlink screenshot missing');
  }
  return json.data.screenshot.url;
}

async function downloadOptimized(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf)
    .rotate()
    .resize({ width: 1280, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(destPath);
}

async function fetchLinkGallery(link) {
  const hash = hashLink(link);
  const dir = join(OUT_DIR, hash);
  await mkdir(dir, { recursive: true });

  const tasks = [];
  if (isAppStoreLink(link) || isSocialOnly(link)) {
    tasks.push({ key: 'preview', mobile: true });
  } else {
    tasks.push({ key: 'desktop', mobile: false });
    tasks.push({ key: 'mobile', mobile: true });
  }

  const paths = [];
  for (const { key, mobile } of tasks) {
    const fileName = `${key}.webp`;
    const dest = join(dir, fileName);
    const publicPath = `/portfolio-gallery/${hash}/${fileName}`;

    if (await fileExists(dest)) {
      paths.push(publicPath);
      continue;
    }

    try {
      const shotUrl = await microlinkScreenshot(link, { mobile });
      await downloadOptimized(shotUrl, dest);
      paths.push(publicPath);
      console.log(`  ✓ ${key}: ${link}`);
    } catch (err) {
      console.warn(`  ✗ ${key} (${link}): ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, REQUEST_GAP_MS));
  }

  return paths;
}

async function runPool(items, worker, limit) {
  const results = new Array(items.length);
  let i = 0;

  async function next() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx], idx);
    }
  }

  await Promise.all(Array.from({ length: limit }, () => next()));
  return results;
}

async function main() {
  const source = await readFile(DATA_FILE, 'utf8');
  const projects = parseProjects(source);
  const uniqueLinks = [...new Set(projects.map((p) => p.link))];

  console.log(`Projects with links: ${projects.length}, unique URLs: ${uniqueLinks.length}`);
  await mkdir(OUT_DIR, { recursive: true });

  const linkToPaths = new Map();

  await runPool(
    uniqueLinks,
    async (link) => {
      if (isSocialOnly(link)) {
        console.log(`Skipping social-only: ${link}`);
        linkToPaths.set(link, []);
        return;
      }
      console.log(`Fetching: ${link}`);
      const paths = await fetchLinkGallery(link);
      linkToPaths.set(link, paths);
    },
    CONCURRENCY,
  );

  const manifest = {};
  for (const { id, link } of projects) {
    manifest[id] = linkToPaths.get(link) ?? [];
  }

  await writeFile(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  const withImages = Object.values(manifest).filter((arr) => arr.length > 0).length;
  console.log(`\nWrote ${MANIFEST_FILE} (${withImages}/${projects.length} projects with fetched previews)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
