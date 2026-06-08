/**
 * Build mobile-friendly portfolio variants from public/portfolio-gallery/.
 * Outputs WebP thumbs (fast first paint) and display sizes (card/desktop).
 * Full-size originals are unchanged and loaded progressively in the app.
 */

import { mkdirSync } from 'node:fs';
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { GALLERY_ROOT, isGalleryImageFile, parseProjects } from './portfolio-gallery-utils.mjs';

const GENERATED_ROOT = resolve(GALLERY_ROOT, '_generated');

/** ~mobile card width; very small bytes for scroll-ahead prefetch */
const THUMB_MAX_WIDTH = 420;
const THUMB_QUALITY = 70;

/** ~desktop card / tablet; sharp enough for grid without full artwork */
const DISPLAY_MAX_WIDTH = 960;
const DISPLAY_QUALITY = 78;

const RASTER_EXT = new Set(['.avif', '.bmp', '.gif', '.heic', '.heif', '.jpeg', '.jpg', '.png', '.webp']);

/** Serialize concurrent runs (dev server + manual CLI). */
let activeRun = null;

function isRasterGalleryFile(fileName) {
  if (!isGalleryImageFile(fileName)) return false;
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  return RASTER_EXT.has(ext);
}

function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

async function fileNeedsUpdate(srcPath, destPath) {
  try {
    const [src, dest] = await Promise.all([stat(srcPath), stat(destPath)]);
    return src.mtimeMs > dest.mtimeMs;
  } catch {
    return true;
  }
}

async function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

async function writeVariant(srcPath, destPath, maxWidth, quality) {
  const absSrc = resolve(srcPath);
  const absDest = resolve(destPath);
  ensureDir(dirname(absDest));

  const buffer = await sharp(absSrc)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toBuffer();

  const maxAttempts = 4;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      ensureDir(dirname(absDest));
      await writeFile(absDest, buffer);
      return;
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await sleep(40 * attempt);
      }
    }
  }

  throw lastError;
}

async function collectSourceFiles() {
  const files = [];

  try {
    const entries = await readdir(GALLERY_ROOT, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === '_generated') continue;
      const dir = join(GALLERY_ROOT, entry.name);
      const names = await readdir(dir);
      for (const name of names) {
        if (!isRasterGalleryFile(name)) continue;
        files.push({
          folder: entry.name,
          name,
          srcPath: resolve(dir, name),
        });
      }
    }
  } catch {
    /* gallery root may not exist yet */
  }

  return files;
}

async function runGenerate({ log = true } = {}) {
  await mkdir(GENERATED_ROOT, { recursive: true });

  const files = await collectSourceFiles();
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const base = file.name.replace(/\.[^.]+$/, '');
    const thumbDest = resolve(GENERATED_ROOT, 'thumbs', file.folder, `${base}.webp`);
    const displayDest = resolve(GENERATED_ROOT, 'display', file.folder, `${base}.webp`);

    const thumbNeeded = await fileNeedsUpdate(file.srcPath, thumbDest);
    const displayNeeded = await fileNeedsUpdate(file.srcPath, displayDest);

    if (!thumbNeeded && !displayNeeded) {
      skipped += 1;
      continue;
    }

    try {
      if (thumbNeeded) {
        await writeVariant(file.srcPath, thumbDest, THUMB_MAX_WIDTH, THUMB_QUALITY);
      }
      if (displayNeeded) {
        await writeVariant(file.srcPath, displayDest, DISPLAY_MAX_WIDTH, DISPLAY_QUALITY);
      }
      updated += 1;
    } catch (err) {
      failed += 1;
      if (log) {
        console.warn(
          `  skip ${relative(process.cwd(), file.srcPath)}: ${err instanceof Error ? err.message : err}`,
        );
      }
    }
  }

  const result = { updated, skipped, failed, total: files.length };

  if (log) {
    const failNote = failed > 0 ? `, ${failed} failed` : '';
    console.log(
      `portfolio thumbs: ${updated} updated, ${skipped} up-to-date (${files.length} source images${failNote})`,
    );
    if (failed > 0) {
      console.warn(
        '  tip: stop `pnpm dev` and rerun `pnpm gallery:variants` if files were locked during generation.',
      );
    }
  }

  return result;
}

export async function generatePortfolioThumbs(options = {}) {
  if (!activeRun) {
    activeRun = runGenerate(options).finally(() => {
      activeRun = null;
    });
  }
  return activeRun;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const portfolioSource = await import('node:fs/promises').then((fs) =>
    fs.readFile(join(process.cwd(), 'src/data/portfolioData.ts'), 'utf8'),
  );
  parseProjects(portfolioSource);
  const result = await generatePortfolioThumbs();
  if (result.failed > 0) {
    process.exitCode = 1;
  }
}
