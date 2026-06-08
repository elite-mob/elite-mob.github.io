/**
 * Optimized hero background WebP variants for mobile + desktop LCP.
 */

import { mkdirSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = process.cwd();
const source = resolve(root, 'src/assets/background1.png');
const outDir = resolve(root, 'public/hero');

async function writeWebp(src, dest, width, quality) {
  mkdirSync(outDir, { recursive: true });
  const buffer = await sharp(src)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toBuffer();
  await writeFile(dest, buffer);
}

export async function generateHeroAssets({ log = true } = {}) {
  await mkdir(outDir, { recursive: true });

  await writeWebp(source, resolve(outDir, 'background-mobile.webp'), 768, 72);
  await writeWebp(source, resolve(outDir, 'background-desktop.webp'), 1920, 78);

  if (log) {
    console.log('hero assets: wrote public/hero/background-mobile.webp + background-desktop.webp');
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await generateHeroAssets();
}
