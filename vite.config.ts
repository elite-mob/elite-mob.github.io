import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import portfolioGalleryPlugin from "./scripts/vite-plugin-portfolio-gallery.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  readFileSync(path.join(__dirname, "package.json"), "utf-8")
) as { version?: string; name?: string };

/**
 * GitHub Pages: user/org site at `https://<user>.github.io/` uses repo `<user>.github.io` with base `/`.
 * Project pages at `https://<user>.github.io/<repo>/` need `base: '/<repo>/'` or assets load from the wrong path (blank page).
 */
function resolveBase(): string {
  const explicit = process.env.VITE_BASE_URL;
  if (explicit) {
    const b = explicit.startsWith("/") ? explicit : `/${explicit}`;
    return b.endsWith("/") ? b : `${b}/`;
  }
  if (process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_REPOSITORY) {
    const repo = process.env.GITHUB_REPOSITORY.split("/")[1] ?? "";
    if (/\.github\.io$/i.test(repo)) return "/";
    if (repo) return `/${repo}/`;
  }
  return "/";
}

/**
 * Injects the production URL for src/assets/avatar.png into index.html (og:image / twitter:image).
 * Uses Rollup output so the path matches the hashed /assets/avatar-*.png file.
 */
function injectOgImageMeta(): Plugin {
  const siteUrl = (process.env.VITE_SITE_URL ?? "https://elite-mob.github.io").replace(/\/$/, "");
  return {
    name: "inject-og-image-meta",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const base = resolveBase();
        const bundle = ctx.bundle;
        if (!bundle) {
          return html;
        }
        let fileName: string | undefined;
        for (const [, chunk] of Object.entries(bundle)) {
          if (
            chunk.type === "asset" &&
            chunk.fileName.endsWith(".png") &&
            /(^|\/)avatar[-.]/i.test(chunk.fileName)
          ) {
            fileName = chunk.fileName;
            break;
          }
        }
        if (!fileName) {
          console.warn(
            "[inject-og-image-meta] avatar.png asset not found in bundle; og:image placeholder left unchanged",
          );
          return html;
        }
        const urlPath = base === "/" ? `/${fileName}` : `${base}${fileName}`;
        const fullUrl = `${siteUrl}${urlPath}`;
        return html.replaceAll("__OG_IMAGE_URL__", fullUrl);
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: resolveBase(),
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(
      packageJson.version ?? "0.0.0"
    ),
    "import.meta.env.VITE_APP_NAME": JSON.stringify(
      packageJson.name ?? "elite-mob.github.io"
    ),
  },
  server: {
    host: "::",
    port: 8080,
    /** Fewer duplicate HMR bursts on Windows (editors that save in chunks). */
    watch: {
      awaitWriteFinish: {
        stabilityThreshold: 150,
        pollInterval: 100,
      },
    },
  },
  plugins: [react(), portfolioGalleryPlugin(), injectOgImageMeta()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  /** Avoid stale pre-bundles after router/react upgrades (fixes occasional blank dev screen). */
  optimizeDeps: {
    include: ["react", "react-dom", "react-router", "react-router-dom", "react-helmet-async"],
  },
  build: {
    target: 'es2015',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'motion-vendor';
            if (id.includes('@emailjs')) return 'emailjs-vendor';
            // Keep React and Radix in one chunk to avoid circular react-vendor <-> ui-vendor imports.
            if (
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('/react/') ||
              id.includes('@radix-ui') ||
              id.includes('class-variance-authority')
            ) {
              return 'react-vendor';
            }
          }
          if (id.includes('/src/data/chatKnowledge.json')) return 'chat-knowledge';
          if (id.includes('/src/pages/ProjectDetail')) return 'page-project-detail';
          if (id.includes('/src/components/chatbot/')) return 'chatbot';
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
