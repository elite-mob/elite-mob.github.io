/**
 * Optimized OG/Twitter preview image (keeps avatar.png out of the JS bundle).
 */

import { mkdirSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = process.cwd();
const source = resolve(root, 'src/assets/avatar.png');
const outDir = resolve(root, 'public/og');

export async function generateOgAssets({ log = true } = {}) {
  await mkdir(outDir, { recursive: true });
  mkdirSync(outDir, { recursive: true });

  const buffer = await sharp(source)
    .rotate()
    .resize({ width: 1200, height: 630, fit: 'cover', position: 'centre' })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();

  await writeFile(resolve(outDir, 'avatar.webp'), buffer);

  if (log) {
    console.log('og assets: wrote public/og/avatar.webp');
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await generateOgAssets();
}
