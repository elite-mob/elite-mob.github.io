/**
 * Shared helpers for portfolio gallery folders under public/portfolio-gallery/.
 * One folder per project: `{projectId}-{title-slug}/` with all slider images inside.
 */

import { readdir, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

export const GALLERY_ROOT = join(process.cwd(), 'public', 'portfolio-gallery');

/** Any common raster image in a project folder can be a slider slide. */
export const GALLERY_IMAGE_EXT = new Set([
  '.avif',
  '.bmp',
  '.gif',
  '.heic',
  '.heif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.webp',
]);

const SKIP_FILES = new Set(['.ds_store', 'thumbs.db', 'desktop.ini']);

export function getImageExtension(fileName) {
  const dot = fileName.lastIndexOf('.');
  if (dot <= 0) return '';
  return fileName.slice(dot).toLowerCase();
}

export function isGalleryImageFile(fileName) {
  if (!fileName || fileName.startsWith('.')) return false;
  const lower = fileName.toLowerCase();
  if (SKIP_FILES.has(lower)) return false;
  return GALLERY_IMAGE_EXT.has(getImageExtension(fileName));
}

export function slugifyTitle(title) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function galleryFolderName(projectId, title) {
  const slug = slugifyTitle(title);
  return slug ? `${projectId}-${slug}` : projectId;
}

export function publicGalleryPath(folder, fileName) {
  return `/portfolio-gallery/${folder}/${fileName}`;
}

export function parseProjects(source) {
  const projects = [];
  const blockRegex = /id:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'/g;
  let match;
  while ((match = blockRegex.exec(source)) !== null) {
    projects.push({ id: match[1], title: match[2] });
  }
  return projects;
}

export function parseProjectsWithLinks(source) {
  const projects = [];
  const blockRegex = /id:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?link:\s*'([^']+)'/g;
  let match;
  while ((match = blockRegex.exec(source)) !== null) {
    projects.push({ id: match[1], title: match[2], link: match[3] });
  }
  return projects;
}

function extractQuotedField(block, field) {
  const re = new RegExp(`${field}:\\s*'((?:\\\\'|[^'])*)'`);
  const match = block.match(re);
  return match ? match[1].replace(/\\'/g, "'") : undefined;
}

function extractBacktickField(block, field) {
  const marker = `${field}:`;
  const start = block.indexOf(marker);
  if (start === -1) return undefined;
  const tick = block.indexOf('`', start + marker.length);
  if (tick === -1) return undefined;
  let end = tick + 1;
  while (end < block.length) {
    const next = block.indexOf('`', end);
    if (next === -1) break;
    if (block[next - 1] !== '\\') {
      return block.slice(tick + 1, next).replace(/\\`/g, '`').trim();
    }
    end = next + 1;
  }
  return undefined;
}

/** Fields needed for the home portfolio grid (no Vite import). */
export function parseProjectsForGrid(source) {
  const projects = [];
  const blockRegex = /\{\s*\n\s*id:\s*'([^']+)'([\s\S]*?)\n\s*\}(?:,|\s*\])/g;
  let match;
  while ((match = blockRegex.exec(source)) !== null) {
    const id = match[1];
    const block = match[2];
    const title = extractQuotedField(block, 'title');
    const description = extractBacktickField(block, 'description');
    const category = extractQuotedField(block, 'category');
    if (!title || !description || !category) continue;

    const link = extractQuotedField(block, 'link');
    const androidLink = extractQuotedField(block, 'androidLink');
    const featured = /featured:\s*true/.test(block);

    projects.push({
      id,
      title,
      description,
      category,
      ...(link ? { link } : {}),
      ...(androidLink ? { androidLink } : {}),
      featured,
    });
  }
  return projects;
}

/** A-Z by file name (case-insensitive, numeric segments ordered naturally). */
export function sortGalleryFileNames(names) {
  return [...names].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
  );
}

/** Folders under gallery root that are not project galleries. */
export const GALLERY_RESERVED_DIRS = new Set(['_generated']);

export async function listGalleryImageFiles(dir) {
  try {
    const names = await readdir(dir);
    return sortGalleryFileNames(names.filter(isGalleryImageFile));
  } catch {
    return [];
  }
}

/** All public paths for images in a project gallery folder. */
export async function scanGalleryFolder(folderName) {
  const dir = join(GALLERY_ROOT, folderName);
  const files = await listGalleryImageFiles(dir);
  return files.map((file) => publicGalleryPath(folderName, file));
}

export async function ensureGalleryFolder(projectId, title) {
  const folder = galleryFolderName(projectId, title);
  const dir = join(GALLERY_ROOT, folder);
  await mkdir(dir, { recursive: true });
  return { folder, dir };
}

/** Remove folders that do not match any project (e.g. legacy hash names). */
export async function removeOrphanGalleryFolders(projects) {
  const valid = new Set(projects.map((p) => galleryFolderName(p.id, p.title)));
  let removed = 0;

  try {
    const entries = await readdir(GALLERY_ROOT, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || valid.has(entry.name) || GALLERY_RESERVED_DIRS.has(entry.name)) continue;
      await rm(join(GALLERY_ROOT, entry.name), { recursive: true, force: true });
      removed += 1;
      console.log(`  removed orphan folder: ${entry.name}`);
    }
  } catch {
    /* gallery root may not exist yet */
  }

  return removed;
}

/** Build manifest: every project id → all images in its gallery folder. */
export async function buildGalleryManifest(projects) {
  await mkdir(GALLERY_ROOT, { recursive: true });
  await removeOrphanGalleryFolders(projects);

  const manifest = {};
  for (const project of projects) {
    const { folder } = await ensureGalleryFolder(project.id, project.title);
    manifest[project.id] = await scanGalleryFolder(folder);
  }
  return manifest;
}
