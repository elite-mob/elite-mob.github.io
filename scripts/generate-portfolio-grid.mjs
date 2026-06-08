/**
 * Slim portfolio manifest for the home grid (avoids shipping full case-study copy).
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  galleryFolderName,
  parseProjectsForGrid,
  publicGalleryPath,
} from './portfolio-gallery-utils.mjs';

const OUT_FILE = 'src/data/portfolioGrid.json';
const SOURCE_FILE = 'src/data/portfolioData.ts';

export async function generatePortfolioGrid({ log = true } = {}) {
  const root = process.cwd();
  const source = await readFile(join(root, SOURCE_FILE), 'utf8');
  const parsed = parseProjectsForGrid(source);

  const grid = parsed.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    imageUrl: publicGalleryPath(galleryFolderName(p.id, p.title), 'artwork.webp'),
    ...(p.link ? { link: p.link } : {}),
    ...(p.androidLink ? { androidLink: p.androidLink } : {}),
    featured: Boolean(p.featured),
  }));

  await writeFile(join(root, OUT_FILE), `${JSON.stringify(grid, null, 2)}\n`, 'utf8');

  if (log) {
    console.log(`portfolio grid: wrote ${grid.length} entries → ${OUT_FILE}`);
  }

  return grid.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await generatePortfolioGrid();
}
