/**
 * Writes dist/sitemap.xml after vite build. Run: node scripts/generate-sitemap.js
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dataPath = path.join(root, 'src', 'data', 'portfolioData.ts');
const distPath = path.join(root, 'dist');
const outFile = path.join(distPath, 'sitemap.xml');

const BASE = 'https://elite-mob.github.io';

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

if (!existsSync(distPath)) {
  console.warn('generate-sitemap: dist/ not found; run after vite build');
  process.exit(0);
}

const data = readFileSync(dataPath, 'utf8');
const ids = [...data.matchAll(/id:\s*'((?:web|mobile|ai)-\d+)'/g)].map((m) => m[1]);
const unique = [...new Set(ids)];

const entries = [
  { loc: `${BASE}/`, changefreq: 'weekly', priority: '1.0' },
  { loc: `${BASE}/privacy`, changefreq: 'yearly', priority: '0.4' },
  ...unique.map((id) => ({
    loc: `${BASE}/project/${id}`,
    changefreq: 'monthly',
    priority: '0.85',
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${escapeXml(e.loc)}</loc>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

writeFileSync(outFile, xml, 'utf8');
console.log(`generate-sitemap: wrote ${entries.length} URLs to dist/sitemap.xml`);
