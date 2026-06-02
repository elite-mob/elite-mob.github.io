/**
 * Fetches live previews from portfolio project links via Microlink, saves under
 * public/portfolio-gallery/{projectId}-{slug}/, and syncs src/data/portfolioGallery.json
 * from all images in each project folder.
 *
 * Run: npm run fetch-portfolio-screenshots
 * Skips files already on disk for each project folder.
 */

import { readFile, writeFile, access, cp, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import {
  GALLERY_ROOT,
  buildGalleryManifest,
  galleryFolderName,
  listGalleryImageFiles,
  parseProjects,
  parseProjectsWithLinks,
  scanGalleryFolder,
  ensureGalleryFolder,
} from './portfolio-gallery-utils.mjs';

const ROOT = process.cwd();
const DATA_FILE = join(ROOT, 'src', 'data', 'portfolioData.ts');
const MANIFEST_FILE = join(ROOT, 'src', 'data', 'portfolioGallery.json');

const CONCURRENCY = 1;
const REQUEST_GAP_MS = 2500;

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

async function copyGalleryFromSource(sourceDir, destDir) {
  await mkdir(destDir, { recursive: true });
  const files = await listGalleryImageFiles(sourceDir);
  for (const file of files) {
    await cp(join(sourceDir, file), join(destDir, file));
  }
}

async function fetchProjectGallery(project, linkCache) {
  const { folder, dir } = await ensureGalleryFolder(project.id, project.title);

  if (isSocialOnly(project.link)) {
    return scanGalleryFolder(folder);
  }

  const cached = linkCache.get(project.link);
  if (cached?.dir && (await fileExists(cached.dir))) {
    await copyGalleryFromSource(cached.dir, dir);
    const paths = await scanGalleryFolder(folder);
    if (paths.length > 0) {
      console.log(`  ↳ copied from ${cached.folder} → ${folder} (${paths.length} images)`);
      linkCache.set(project.link, { dir, folder });
      return paths;
    }
  }

  const tasks = [];
  if (isAppStoreLink(project.link)) {
    tasks.push({ key: 'preview', mobile: true });
  } else {
    tasks.push({ key: 'desktop', mobile: false });
    tasks.push({ key: 'mobile', mobile: true });
  }

  for (const { key, mobile } of tasks) {
    const fileName = `${key}.webp`;
    const dest = join(dir, fileName);

    if (await fileExists(dest)) continue;

    try {
      const shotUrl = await microlinkScreenshot(project.link, { mobile });
      await downloadOptimized(shotUrl, dest);
      console.log(`  ✓ ${key}: ${project.id} (${project.title})`);
    } catch (err) {
      console.warn(`  ✗ ${key} (${project.id}): ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, REQUEST_GAP_MS));
  }

  const paths = await scanGalleryFolder(folder);
  if (paths.length > 0) {
    linkCache.set(project.link, { dir, folder });
  }
  return paths;
}

async function runPool(items, worker, limit) {
  let i = 0;
  async function next() {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: limit }, () => next()));
}

async function main() {
  const source = await readFile(DATA_FILE, 'utf8');
  const projects = parseProjectsWithLinks(source);

  console.log(`Projects with links: ${projects.length}`);
  await mkdir(GALLERY_ROOT, { recursive: true });

  const linkCache = new Map();

  await runPool(
    projects,
    async (project) => {
      console.log(`Gallery: ${galleryFolderName(project.id, project.title)}`);
      await fetchProjectGallery(project, linkCache);
    },
    CONCURRENCY,
  );

  const manifest = await buildGalleryManifest(parseProjects(source));

  await writeFile(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  const withImages = Object.values(manifest).filter((arr) => arr.length > 0).length;
  const totalImages = Object.values(manifest).reduce((n, arr) => n + arr.length, 0);
  console.log(
    `\nSynced ${MANIFEST_FILE}: ${withImages}/${Object.keys(manifest).length} projects with images (${totalImages} slides)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
