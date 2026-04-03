import sharp from 'sharp';
import { readdir, stat, writeFile } from 'fs/promises';
import { basename, extname, join } from 'path';
import { existsSync } from 'fs';

const ASSETS_DIR = join(process.cwd(), 'src', 'assets');
const SUPPORTED_FORMATS = ['.png', '.jpg', '.jpeg', '.webp'];

/** Full-bleed hero / large backdrops: allow a bit more headroom for wide screens. */
const MAX_EDGE_HERO = 1920;
/** Portfolio cards are ~≤800px CSS wide; 2× retina ≈ 1600px; cap saves bytes without visible loss. */
const MAX_EDGE_DEFAULT = 1536;

function maxEdgeForFile(name) {
  const lower = name.toLowerCase();
  if (lower === 'background1.png' || lower.startsWith('background')) {
    return MAX_EDGE_HERO;
  }
  return MAX_EDGE_DEFAULT;
}

async function optimizeImage(filePath) {
  const ext = extname(filePath).toLowerCase();
  const fileName = basename(filePath);
  const stats = await stat(filePath);
  const originalSize = stats.size;

  try {
    const maxDimension = maxEdgeForFile(fileName);
    let pipeline = sharp(filePath, { failOn: 'none' }).rotate();

    const metadata = await sharp(filePath).metadata();
    const { width = 0, height = 0 } = metadata;

    if (width > maxDimension || height > maxDimension) {
      pipeline = pipeline.resize({
        width: width > height ? maxDimension : undefined,
        height: height >= width ? maxDimension : undefined,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    let optimized;
    if (ext === '.png') {
      optimized = await pipeline
        .png({
          quality: 85,
          compressionLevel: 9,
          adaptiveFiltering: true,
          effort: 10,
          palette: false,
        })
        .toBuffer();
    } else if (ext === '.jpg' || ext === '.jpeg') {
      optimized = await pipeline
        .jpeg({
          quality: 82,
          mozjpeg: true,
          progressive: true,
          optimiseScans: true,
        })
        .toBuffer();
    } else if (ext === '.webp') {
      optimized = await pipeline
        .webp({
          quality: 82,
          effort: 6,
          smartSubsample: true,
        })
        .toBuffer();
    } else {
      console.log(`Skipping ${filePath} - unsupported format`);
      return;
    }

    const newSize = optimized.length;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

    if (newSize < originalSize) {
      // Write buffer directly (Windows can be flaky replacing via rename temp → final).
      await writeFile(filePath, optimized);

      console.log(`✓ ${fileName}: ${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (${savings}% saved)`);
      return { saved: originalSize - newSize };
    } else {
      console.log(`- ${fileName}: Already optimized (${(originalSize / 1024).toFixed(1)}KB)`);
      return { saved: 0 };
    }
  } catch (error) {
    console.error(`✗ Error optimizing ${filePath}:`, error.message);
    return { saved: 0 };
  }
}

async function optimizeAllImages() {
  console.log('Starting image optimization...\n');

  if (!existsSync(ASSETS_DIR)) {
    console.error(`Assets directory not found: ${ASSETS_DIR}`);
    process.exit(1);
  }

  const files = await readdir(ASSETS_DIR);
  const imageFiles = files.filter((file) => SUPPORTED_FORMATS.includes(extname(file).toLowerCase()));

  if (imageFiles.length === 0) {
    console.log('No images found to optimize.');
    return;
  }

  console.log(`Found ${imageFiles.length} image(s) to optimize.\n`);

  let totalSaved = 0;
  for (const file of imageFiles) {
    const filePath = join(ASSETS_DIR, file);
    const result = await optimizeImage(filePath);
    if (result) {
      totalSaved += result.saved;
    }
  }

  console.log(`\n✓ Optimization complete! Total saved: ${(totalSaved / 1024).toFixed(1)}KB`);
}

optimizeAllImages().catch(console.error);
