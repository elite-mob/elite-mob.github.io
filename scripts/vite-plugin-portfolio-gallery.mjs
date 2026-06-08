/**
 * Scans public/portfolio-gallery/{projectId}-{slug}/ on dev + build.
 * Drop any supported image into a project folder, sliders pick it up automatically.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fetchIosStoreRatings } from './fetch-ios-store-ratings.mjs';
import { generateHeroAssets } from './generate-hero-assets.mjs';
import { generateOgAssets } from './generate-og-assets.mjs';
import { generatePortfolioGrid } from './generate-portfolio-grid.mjs';
import { generatePortfolioThumbs } from './generate-portfolio-thumbs.mjs';
import { buildGalleryManifest, parseProjects } from './portfolio-gallery-utils.mjs';

const VIRTUAL_ID = 'virtual:portfolio-gallery';
const RESOLVED_ID = '\0' + VIRTUAL_ID;
const MANIFEST_FILE = 'src/data/portfolioGallery.json';

function isGalleryPath(file) {
  return file.replace(/\\/g, '/').includes('/portfolio-gallery/');
}

export default function portfolioGalleryPlugin() {
  let root = process.cwd();
  /** @type {import('vite').ViteDevServer | null} */
  let devServer = null;
  let manifestCache = null;

  async function scanManifest() {
    const source = await readFile(join(root, 'src/data/portfolioData.ts'), 'utf8');
    const projects = parseProjects(source);
    return buildGalleryManifest(projects);
  }

  async function refreshManifest({ writeJson = false } = {}) {
    manifestCache = await scanManifest();
    if (writeJson) {
      await writeFile(
        join(root, MANIFEST_FILE),
        `${JSON.stringify(manifestCache, null, 2)}\n`,
        'utf8',
      );
    }
    return manifestCache;
  }

  function invalidateDevModule() {
    if (!devServer) return;
    const mod = devServer.moduleGraph.getModuleById(RESOLVED_ID);
    if (mod) {
      devServer.moduleGraph.invalidateModule(mod);
      devServer.ws.send({ type: 'full-reload' });
    }
  }

  return {
    name: 'portfolio-gallery',
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    async load(id) {
      if (id !== RESOLVED_ID) return;
      if (!manifestCache) {
        await refreshManifest({ writeJson: false });
      }
      return `export default ${JSON.stringify(manifestCache)}`;
    },
    async buildStart() {
      await generateHeroAssets({ log: true });
      await generateOgAssets({ log: true });
      await generatePortfolioThumbs({ log: true });
      await generatePortfolioGrid({ log: true });
      try {
        await fetchIosStoreRatings({ log: true });
      } catch (err) {
        console.warn(
          `[portfolio-gallery] iOS ratings fetch failed: ${err instanceof Error ? err.message : err}`,
        );
      }
      await refreshManifest({ writeJson: true });
    },
    configureServer(server) {
      devServer = server;
      const galleryRoot = join(root, 'public/portfolio-gallery');
      server.watcher.add(galleryRoot);

      let regenTimer = null;
      const onGalleryChange = (file) => {
        const normalized = file.replace(/\\/g, '/');
        if (!isGalleryPath(file)) return;
        if (normalized.includes('/_generated/')) return;

        if (regenTimer) clearTimeout(regenTimer);
        regenTimer = setTimeout(() => {
          void (async () => {
            await generatePortfolioThumbs({ log: false });
            await refreshManifest({ writeJson: false });
            invalidateDevModule();
          })();
        }, 600);
      };

      server.watcher.on('add', onGalleryChange);
      server.watcher.on('unlink', onGalleryChange);
      server.watcher.on('change', onGalleryChange);
    },
  };
}
