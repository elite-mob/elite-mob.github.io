/**
 * Scans public/portfolio-gallery/{projectId}-{slug}/ on dev + build.
 * Drop any supported image into a project folder, sliders pick it up automatically.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
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
      await refreshManifest({ writeJson: true });
    },
    configureServer(server) {
      devServer = server;
      const galleryRoot = join(root, 'public/portfolio-gallery');
      server.watcher.add(galleryRoot);

      const onGalleryChange = async (file) => {
        if (!isGalleryPath(file)) return;
        await refreshManifest({ writeJson: false });
        invalidateDevModule();
      };

      server.watcher.on('add', onGalleryChange);
      server.watcher.on('unlink', onGalleryChange);
      server.watcher.on('change', onGalleryChange);
    },
  };
}
