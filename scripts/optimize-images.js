import sharp from 'sharp';
import { readFile, readdir, rename, stat, unlink, writeFile } from 'fs/promises';
import { basename, dirname, extname, join } from 'path';
import { existsSync } from 'fs';
import { spawn } from 'node:child_process';

const ASSETS_DIR = join(process.cwd(), 'src', 'assets');
const GALLERY_DIR = join(process.cwd(), 'public', 'portfolio-gallery');
const SUPPORTED_FORMATS = ['.png', '.jpg', '.jpeg', '.webp'];

const MAX_EDGE_HERO = 1920;
/** Portfolio cards ~800px CSS; 2× retina + headroom */
const MAX_EDGE_GALLERY = 1280;
const MAX_EDGE_DEFAULT = 1536;

const WEBP_QUALITY = 82;
const PNG_QUALITY = 85;
const JPEG_QUALITY = 82;

async function walkImages(dir, results = []) {
  if (!existsSync(dir)) return results;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkImages(fullPath, results);
    } else if (SUPPORTED_FORMATS.includes(extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }
  return results;
}

function maxEdgeForFile(filePath, context) {
  const name = basename(filePath).toLowerCase();
  if (context === 'gallery') return MAX_EDGE_GALLERY;
  if (name === 'background1.png' || name.startsWith('background')) return MAX_EDGE_HERO;
  return MAX_EDGE_DEFAULT;
}

function shouldConvertToWebp(filePath, context) {
  if (context !== 'gallery') return false;
  const ext = extname(filePath).toLowerCase();
  return ext === '.png' || ext === '.jpg' || ext === '.jpeg';
}

async function buildPipeline(filePath, maxDimension) {
  const input = await readFile(filePath);
  let pipeline = sharp(input, { failOn: 'none' }).rotate();
  const metadata = await sharp(input).metadata();
  const { width = 0, height = 0 } = metadata;

  if (width > maxDimension || height > maxDimension) {
    pipeline = pipeline.resize({
      width: width > height ? maxDimension : undefined,
      height: height >= width ? maxDimension : undefined,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }
  return pipeline;
}

async function encodeBuffer(pipeline, ext) {
  if (ext === '.webp') {
    return pipeline.webp({ quality: WEBP_QUALITY, effort: 6, smartSubsample: true }).toBuffer();
  }
  if (ext === '.png') {
    return pipeline
      .png({
        quality: PNG_QUALITY,
        compressionLevel: 9,
        adaptiveFiltering: true,
        effort: 10,
        palette: false,
      })
      .toBuffer();
  }
  if (ext === '.jpg' || ext === '.jpeg') {
    return pipeline
      .jpeg({
        quality: JPEG_QUALITY,
        mozjpeg: true,
        progressive: true,
        optimiseScans: true,
      })
      .toBuffer();
  }
  return null;
}

async function optimizeImage(filePath, context) {
  const ext = extname(filePath).toLowerCase();
  const fileName = basename(filePath);
  const stats = await stat(filePath);
  const originalSize = stats.size;
  const maxDimension = maxEdgeForFile(filePath, context);

  try {
    const pipeline = await buildPipeline(filePath, maxDimension);

    if (shouldConvertToWebp(filePath, context)) {
      const webpPath = join(dirname(filePath), `${basename(filePath, ext)}.webp`);
      const webpBuffer = await pipeline
        .webp({ quality: WEBP_QUALITY, effort: 6, smartSubsample: true })
        .toBuffer();

      if (webpBuffer.length < originalSize) {
        await writeFile(webpPath, webpBuffer);
        await unlink(filePath);
        const rel = webpPath.replace(/\\/g, '/');
        console.log(
          `✓ ${fileName} → ${basename(webpPath)}: ${(originalSize / 1024).toFixed(1)}KB → ${(webpBuffer.length / 1024).toFixed(1)}KB`,
        );
        return { saved: originalSize - webpBuffer.length };
      }
    }

    const optimized = await encodeBuffer(pipeline, ext);
    if (!optimized) {
      console.log(`Skipping ${filePath} - unsupported format`);
      return { saved: 0 };
    }

    const newSize = optimized.length;
    if (newSize < originalSize) {
      const tempPath = `${filePath}.opt.tmp`;
      await writeFile(tempPath, optimized);
      await unlink(filePath);
      await rename(tempPath, filePath);
      const savings = (((originalSize - newSize) / originalSize) * 100).toFixed(1);
      console.log(
        `✓ ${fileName}: ${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (${savings}% saved)`,
      );
      return { saved: originalSize - newSize };
    }

    console.log(`- ${fileName}: Already optimized (${(originalSize / 1024).toFixed(1)}KB)`);
    return { saved: 0 };
  } catch (error) {
    console.error(`✗ Error optimizing ${filePath}:`, error.message);
    return { saved: 0 };
  }
}

function runSyncGalleryManifest() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/sync-portfolio-gallery-manifest.mjs'], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`sync exited ${code}`))));
  });
}

async function optimizeAllImages() {
  console.log('Starting image optimization...\n');

  const assetFiles = existsSync(ASSETS_DIR)
    ? (await readdir(ASSETS_DIR)).filter((f) =>
        SUPPORTED_FORMATS.includes(extname(f).toLowerCase()),
      )
    : [];

  const galleryFiles = await walkImages(GALLERY_DIR);
  const jobs = [
    ...assetFiles.map((f) => ({ path: join(ASSETS_DIR, f), context: 'assets' })),
    ...galleryFiles.map((p) => ({ path: p, context: 'gallery' })),
  ];

  if (jobs.length === 0) {
    console.log('No images found to optimize.');
    return;
  }

  console.log(
    `Found ${jobs.length} image(s) (${assetFiles.length} assets, ${galleryFiles.length} gallery).\n`,
  );

  let totalSaved = 0;
  for (const { path, context } of jobs) {
    const result = await optimizeImage(path, context);
    if (result) totalSaved += result.saved;
  }

  console.log(`\n✓ Optimization complete! Total saved: ${(totalSaved / 1024 / 1024).toFixed(2)}MB`);

  if (galleryFiles.length > 0) {
    console.log('\nSyncing portfolio gallery manifest…');
    await runSyncGalleryManifest();
  }
}

optimizeAllImages().catch((err) => {
  console.error(err);
  process.exit(1);
});
