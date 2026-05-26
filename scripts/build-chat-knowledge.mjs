/**
 * Prebuild: export portfolio/site knowledge for the chatbot (Vite resolves image imports).
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = join(root, 'src/data/chatKnowledge.json');

const server = await createServer({
  root,
  logLevel: 'error',
  server: { middlewareMode: true },
});

try {
  const { buildKnowledgeChunks } = await server.ssrLoadModule('/src/lib/chatbot/buildKnowledgeChunks.ts');
  const { projects } = await server.ssrLoadModule('/src/data/portfolioData.ts');
  const chunks = buildKnowledgeChunks(projects);
  const payload = {
    generatedAt: new Date().toISOString(),
    chunkCount: chunks.length,
    chunks,
  };
  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${chunks.length} chat knowledge chunks to src/data/chatKnowledge.json`);
} finally {
  await server.close();
}
