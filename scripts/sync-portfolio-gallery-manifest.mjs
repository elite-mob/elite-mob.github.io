/**
 * Ensures one gallery folder per project and writes portfolioGallery.json
 * from every image file on disk (source of truth for slider images).
 *
 * Run: npm run sync-portfolio-gallery
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildGalleryManifest, parseProjects } from './portfolio-gallery-utils.mjs';

const ROOT = process.cwd();
const DATA_FILE = join(ROOT, 'src', 'data', 'portfolioData.ts');
const MANIFEST_FILE = join(ROOT, 'src', 'data', 'portfolioGallery.json');

async function main() {
  const source = await readFile(DATA_FILE, 'utf8');
  const projects = parseProjects(source);
  const manifest = await buildGalleryManifest(projects);

  await writeFile(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  const withImages = Object.values(manifest).filter((arr) => arr.length > 0).length;
  const totalImages = Object.values(manifest).reduce((n, arr) => n + arr.length, 0);
  console.log(
    `Synced ${MANIFEST_FILE}: ${withImages}/${projects.length} projects with images (${totalImages} slides total)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
